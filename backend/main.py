from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from scanner.crypto_scanner import scan_code
from scanner.risk_engine import calculate_risk_score
from ai.assistant import chat_with_assistant
from models.schemas import CodeInput, ChatMessage
import os
import asyncio
from dotenv import load_dotenv

# ── Integration services ──────────────────────────────────────────────────────
from integrations.notion_service import (
    process_scan_findings,
    log_audit_event,
    upsert_project_metrics,
)
from integrations.armoriq_service import (
    enforce_policy,
    send_audit_event,
    verify_risk_score,
    validate_credentials,
    PolicyViolation,
)

load_dotenv()

import sqlite3
import threading
import json
import logging

_db_lock = threading.Lock()
_DB_PATH = os.path.join(os.path.dirname(__file__), "scan_history.db")

def _init_db():
    """Create the SQLite scan history table if it doesn't exist."""
    with _db_lock:
        conn = sqlite3.connect(_DB_PATH)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS scan_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TEXT NOT NULL,
                filename TEXT NOT NULL,
                findings TEXT NOT NULL,
                risk TEXT NOT NULL
            )
        """)
        conn.commit()
        conn.close()

def _append_scan(timestamp: str, filename: str, findings: list, risk: dict):
    """Persist a completed scan to SQLite (safe for multi-worker use)."""
    with _db_lock:
        conn = sqlite3.connect(_DB_PATH)
        conn.execute(
            "INSERT INTO scan_history (timestamp, filename, findings, risk) VALUES (?,?,?,?)",
            (timestamp, filename, json.dumps(findings), json.dumps(risk))
        )
        conn.commit()
        conn.close()

def _load_scans() -> list:
    """Load all scans from SQLite, ordered by insertion time."""
    with _db_lock:
        conn = sqlite3.connect(_DB_PATH)
        rows = conn.execute(
            "SELECT timestamp, filename, findings, risk FROM scan_history ORDER BY id ASC"
        ).fetchall()
        conn.close()
    return [
        {
            "timestamp": r[0],
            "filename":  r[1],
            "findings":  json.loads(r[2]),
            "risk":      json.loads(r[3]),
        }
        for r in rows
    ]

from contextlib import asynccontextmanager

@asynccontextmanager
async def _lifespan(app):
    """Initialise DB and validate integration credentials on startup."""
    log = logging.getLogger(__name__)
    _init_db()
    validate_credentials()
    from integrations.notion_service import _is_configured as notion_ok
    if notion_ok():
        log.info("[Notion] Integration configured and ready.")
    else:
        log.warning("[Notion] Credentials not configured — running without Notion sync.")
    yield

app = FastAPI(title="QuantumBridge API", version="1.0.0", lifespan=_lifespan)

# SCAN_HISTORY kept as a compatibility alias for test access — real persistence uses SQLite
SCAN_HISTORY: list = []  # used only by TestClient in tests; production reads from DB

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Helper: run integration tasks safely in background ───────────────────────

def _bg(coro):
    """
    Schedule a coroutine as a fire-and-forget background task.
    Wraps it in a try/except so any integration failure is logged
    but NEVER surfaces to the caller or blocks the response.
    """
    async def _safe():
        try:
            await coro
        except Exception as exc:
            import logging
            logging.getLogger(__name__).warning(
                "[Integration] Background task failed: %s", exc
            )
    asyncio.create_task(_safe())


# ── /api/scan/code ────────────────────────────────────────────────────────────

@app.post("/api/scan/code")
async def scan_code_input(input: CodeInput):
    # ── 1. Core scanner — always runs first, never blocked ───────────────────
    findings = scan_code(input.code, input.filename)
    risk = calculate_risk_score(findings)

    # ── 2. Build the full response immediately ───────────────────────────────
    response = {
        "findings": findings,
        "risk": risk,
        "total": len(findings),
        "policy_blocked": False,
        "policy_message": "",
        # Structured ArmorIQ block — populated below if configured
        "armoriq": {
            "status":          "SKIPPED",
            "policy_decision": "skipped",
            "verified":        False,
            "original_score":  risk.get("score"),
            "verified_score":  risk.get("score"),
            "message":         "ArmorIQ not configured",
        },
    }

    # ── 3. ArmorIQ risk verification (best-effort, never blocks) ─────────────
    try:
        verified_risk = await verify_risk_score(risk, findings)
        response["risk"] = verified_risk
        response["armoriq"].update({
            "status":          verified_risk.get("armoriq_status", "SKIPPED"),
            "policy_decision": verified_risk.get("policy_decision", "skipped"),
            "verified":        verified_risk.get("armoriq_verified", False),
            "original_score":  verified_risk.get("original_score", risk.get("score")),
            "verified_score":  verified_risk.get("verified_score",  risk.get("score")),
            "message":         "Risk verified by ArmorIQ" if verified_risk.get("armoriq_verified") else "ArmorIQ unavailable",
        })
    except Exception:
        pass  # keep original risk score

    # ── 4. ArmorIQ policy check (best-effort — only blocks if explicitly denied)
    try:
        policy_result = await enforce_policy(findings, risk)
        response["armoriq"]["status"]  = policy_result.get("status", response["armoriq"]["status"])
        response["armoriq"]["message"] = policy_result.get("message", response["armoriq"]["message"])
    except PolicyViolation as pv:
        response["policy_blocked"] = True
        response["policy_message"] = str(pv)
        response["armoriq"]["status"]  = "FAIL"
        response["armoriq"]["message"] = str(pv)
    except Exception:
        pass  # ArmorIQ unavailable — continue normally

    # ── 5. All remaining integration work goes to background ─────────────────
    _bg(send_audit_event(event="ScanStarted",  metadata={"filename": input.filename}))
    _bg(send_audit_event(event="ScanCompleted", metadata={"filename": input.filename, "total": len(findings)}))
    _bg(log_audit_event(action="Scan Started",   related_repo=input.filename))
    _bg(log_audit_event(action="Scan Completed", related_repo=input.filename))

    for finding in findings:
        _bg(send_audit_event(
            event="VulnerabilityFound",
            metadata={
                "algorithm": finding.get("algorithm"),
                "severity":  finding.get("severity"),
                "file":      finding.get("file"),
            },
        ))

    _bg(send_audit_event(
        event="RecommendationGenerated",
        metadata={"filename": input.filename, "total_findings": len(findings)},
    ))

    _bg(process_scan_findings(
        findings=findings,
        risk=response["risk"],
        repo_name=input.filename,
    ))

    # Record scan outcome to history
    from datetime import datetime, timezone
    ts = datetime.now(timezone.utc).isoformat()
    _append_scan(ts, input.filename, findings, response["risk"])

    # ── 6. Return scanner result instantly ───────────────────────────────────
    return response


# ── /api/scan/file ────────────────────────────────────────────────────────────

@app.post("/api/scan/file")
async def scan_file(file: UploadFile = File(...)):
    content = await file.read()
    code = content.decode("utf-8", errors="ignore")

    # ── 1. Core scanner — always runs first ──────────────────────────────────
    findings = scan_code(code, file.filename)
    risk = calculate_risk_score(findings)

    response = {
        "findings": findings,
        "risk": risk,
        "filename": file.filename,
        "policy_blocked": False,
        "policy_message": "",
        "armoriq": {
            "status":          "SKIPPED",
            "policy_decision": "skipped",
            "verified":        False,
            "original_score":  risk.get("score"),
            "verified_score":  risk.get("score"),
            "message":         "ArmorIQ not configured",
        },
    }

    # ── 2. ArmorIQ risk verification (best-effort) ───────────────────────────
    try:
        verified_risk = await verify_risk_score(risk, findings)
        response["risk"] = verified_risk
        response["armoriq"].update({
            "status":          verified_risk.get("armoriq_status", "SKIPPED"),
            "policy_decision": verified_risk.get("policy_decision", "skipped"),
            "verified":        verified_risk.get("armoriq_verified", False),
            "original_score":  verified_risk.get("original_score", risk.get("score")),
            "verified_score":  verified_risk.get("verified_score",  risk.get("score")),
            "message":         "Risk verified by ArmorIQ" if verified_risk.get("armoriq_verified") else "ArmorIQ unavailable",
        })
    except Exception:
        pass

    # ── 3. ArmorIQ policy check (best-effort) ────────────────────────────────
    try:
        policy_result = await enforce_policy(findings, risk)
        response["armoriq"]["status"]  = policy_result.get("status", response["armoriq"]["status"])
        response["armoriq"]["message"] = policy_result.get("message", response["armoriq"]["message"])
    except PolicyViolation as pv:
        response["policy_blocked"] = True
        response["policy_message"] = str(pv)
        response["armoriq"]["status"]  = "FAIL"
        response["armoriq"]["message"] = str(pv)
    except Exception:
        pass

    # ── 4. Background integration tasks ──────────────────────────────────────
    _bg(send_audit_event(event="ScanStarted",   metadata={"filename": file.filename}))
    _bg(send_audit_event(event="ScanCompleted", metadata={"filename": file.filename, "total": len(findings)}))
    _bg(log_audit_event(action="Scan Started",   related_repo=file.filename))
    _bg(log_audit_event(action="Scan Completed", related_repo=file.filename))

    for finding in findings:
        _bg(send_audit_event(
            event="VulnerabilityFound",
            metadata={
                "algorithm": finding.get("algorithm"),
                "severity":  finding.get("severity"),
                "file":      finding.get("file"),
            },
        ))

    _bg(send_audit_event(
        event="RecommendationGenerated",
        metadata={"filename": file.filename, "total_findings": len(findings)},
    ))

    _bg(process_scan_findings(
        findings=findings,
        risk=response["risk"],
        repo_name=file.filename,
    ))

    # Record scan outcome to history
    from datetime import datetime, timezone
    ts = datetime.now(timezone.utc).isoformat()
    _append_scan(ts, file.filename, findings, response["risk"])

    # ── 5. Return scanner result instantly ───────────────────────────────────
    return response


# ── /api/ai/chat ──────────────────────────────────────────────────────────────

@app.post("/api/ai/chat")
async def ai_chat(msg: ChatMessage):
    # Pass scan_context so the assistant responds based on actual scan data
    response = chat_with_assistant(
        msg.message,
        msg.history,
        scan_context=msg.scan_context,
    )
    return {"response": response}


# ── /api/dashboard/stats ──────────────────────────────────────────────────────

@app.get("/api/dashboard/stats")
async def dashboard_stats():
    SCAN_HISTORY = _load_scans()
    if not SCAN_HISTORY:
        return {
            "total_threats": 0,
            "defended": 0,
            "failed": 0,
            "total_scans": 0,
            "integrity_score": 0,
            "critical": 0,
            "suspicious": 0,
            "safe": 0,
            "history": [],
            "findings_list": []
        }

    total_scans = len(SCAN_HISTORY)
    total_threats = 0
    defended = 0  # Starts at 0, no fix-tracking implemented yet

    critical = 0
    suspicious = 0
    failed = 0
    safe = 0

    findings_list = []

    for scan in SCAN_HISTORY:
        scan_findings = scan.get("findings", [])
        total_threats += len(scan_findings)

        # If a scan had 0 findings, it is a completely safe module/file
        if not scan_findings:
            safe += 1

        for f in scan_findings:
            severity = f.get("severity")
            if severity == "CRITICAL":
                critical += 1
            elif severity == "HIGH":
                suspicious += 1
            elif severity == "MEDIUM":
                failed += 1
            elif severity == "LOW":
                safe += 1

            # Derive per-finding score from scan's overall risk score, weighted by severity
            severity_score_map = {"CRITICAL": 92, "HIGH": 74, "MEDIUM": 45, "LOW": 15}
            finding_score = scan["risk"].get("score")
            # Invert: higher scan risk score = lower individual finding score
            if finding_score is not None:
                base = severity_score_map.get(severity, 50)
                finding_display_score = max(0, min(100, int(base * (1 - finding_score / 200))))
            else:
                finding_display_score = severity_score_map.get(severity, 50)

            findings_list.append({
                "id": len(findings_list) + 1,
                "name": f"{f.get('algorithm')} Cryptographic Vulnerability" if f.get("quantum_vulnerable") else f"{f.get('algorithm')} Classical Vulnerability",
                "level": severity,
                "score": finding_display_score,
                "sourceFile": f.get("file", "unknown"),
                "sourceIP": "127.0.0.1",
                "algorithm": f.get("algorithm"),
                "status": "ACTIVE",
                "scanned": scan["timestamp"],
                "action": f"Migrate {f.get('algorithm')} → {f.get('replacement')}"
            })

    # Integrity Score: average of per-scan risk scores across all scans,
    # scaled to 0–10000. A risk score of 100 = fully safe, 0 = fully broken.
    # This means scanning vulnerable code lowers the score visibly,
    # and clean scans raise it — giving a meaningful live gauge.
    if SCAN_HISTORY:
        avg_risk_score = sum(
            scan["risk"].get("score", 100) for scan in SCAN_HISTORY
        ) / len(SCAN_HISTORY)
        integrity_score = int(avg_risk_score * 100)  # 0–10000
    else:
        integrity_score = 0

    # Build history array for the sparkline trend (cumulative threats over scans)
    history = []
    running_threat_total = 0
    for scan in SCAN_HISTORY:
        new_findings = len(scan.get("findings", []))
        running_threat_total += new_findings
        history.append({
            "v": running_threat_total,
            "new_findings": new_findings,
            "timestamp": scan["timestamp"],
            "score": scan["risk"].get("score", 100)
        })

    return {
        "total_threats": total_threats,
        "defended": defended,
        "failed": failed,
        "total_scans": total_scans,
        "integrity_score": integrity_score,
        "critical": critical,
        "suspicious": suspicious,
        "safe": safe,
        "history": history,
        "findings_list": findings_list
    }


# ── /api/notion/sync-dashboard ────────────────────────────────────────────────

@app.post("/api/notion/sync-dashboard")
async def notion_sync_dashboard(payload: dict):
    """Sync project-level risk metrics to Notion Project Dashboard database."""
    try:
        result = await upsert_project_metrics(
            project_name=payload.get("project_name", "QuantumBridge"),
            total_findings=payload.get("total_findings", 0),
            critical_findings=payload.get("critical_findings", 0),
            resolved_findings=payload.get("resolved_findings", 0),
            migration_progress_pct=payload.get("migration_progress", 0.0),
            overall_risk_score=payload.get("overall_risk_score", 100),
        )
        if result:
            return {"synced": True, "notion_page_id": result.get("id")}
    except Exception:
        pass
    return {"synced": False, "reason": "Notion not configured or request failed"}


# ── /api/notion/audit ─────────────────────────────────────────────────────────

@app.post("/api/notion/audit")
async def notion_audit(payload: dict):
    """Manually log an audit event to Notion."""
    try:
        result = await log_audit_event(
            action=payload.get("action", "Unknown"),
            user_or_system=payload.get("user_or_system", "QuantumBridge System"),
            related_repo=payload.get("related_repo", ""),
        )
        return {"logged": result is not None}
    except Exception:
        return {"logged": False}


# ── /api/armoriq/status ───────────────────────────────────────────────────────

@app.get("/api/armoriq/status")
async def armoriq_status():
    """
    Returns current ArmorIQ configuration status and recent audit events.
    Safe to call at any time — never exposes secret values.
    """
    from integrations.armoriq_service import _is_configured, _creds, get_audit_log
    api_key, project_id, policy_id = _creds()
    configured = _is_configured()
    return {
        "configured":      configured,
        "mode":            "real_api" if configured else "simulator",
        "project_id":      project_id if configured else "local-simulator",
        "policy_id":       policy_id  if configured else "default-policy",
        "api_key_present": bool(api_key),
        "message": (
            "ArmorIQ real API active — policy enforcement enabled."
            if configured else
            "ArmorIQ simulator active — policy enforcement running locally."
        ),
        "recent_audit_events": get_audit_log()[-10:],  # last 10 events
    }


# ── /api/armoriq/audit ────────────────────────────────────────────────────────

@app.post("/api/armoriq/audit")
async def armoriq_audit(payload: dict):
    """
    Manually fire an ArmorIQ audit event.
    Valid events: ScanStarted, ScanCompleted, VulnerabilityFound,
                  RecommendationGenerated, PRGenerated,
                  PolicyViolation, MigrationCompleted
    """
    event = payload.get("event", "")
    await send_audit_event(event=event, metadata=payload.get("metadata", {}))
    return {"sent": True, "event": event}


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=True if os.environ.get("DEBUG") else False,
    )
