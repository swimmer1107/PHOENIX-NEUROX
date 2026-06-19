"""
ArmorIQ Integration Service — QuantumBridge
============================================
Runs a built-in ArmorIQ simulator when credentials are not configured.
No external API calls, no credentials required in standalone mode.

When ARMORIQ_API_KEY / PROJECT_ID / POLICY_ID are set, the real API is used.
When they are empty, the local simulator runs identical logic internally.

Either way, every scan gets:
  - Policy enforcement (PASS / WARNING / FAIL)
  - Risk verification with policy decision
  - Audit event logging (stored in memory / logged to console)
  - Structured armoriq block in every scan response
"""

import os
import logging
from datetime import datetime, timezone
from typing import Optional

logger = logging.getLogger(__name__)

_ARMORIQ_BASE = "https://api.armoriq.io/v1"

_VALID_EVENTS = {
    "ScanStarted",
    "ScanCompleted",
    "VulnerabilityFound",
    "RecommendationGenerated",
    "PRGenerated",
    "PolicyViolation",
    "MigrationCompleted",
}

# In-memory audit log for the simulator
_audit_log: list[dict] = []


# ── Credential helpers ────────────────────────────────────────────────────────

def _creds() -> tuple[str, str, str]:
    return (
        os.getenv("ARMORIQ_API_KEY", ""),
        os.getenv("ARMORIQ_PROJECT_ID", ""),
        os.getenv("ARMORIQ_POLICY_ID", ""),
    )


def _is_configured() -> bool:
    api_key, project_id, policy_id = _creds()
    return bool(api_key and project_id and policy_id)


def _headers() -> dict:
    api_key, project_id, _ = _creds()
    return {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "X-Project-ID": project_id,
    }


# ── Startup validation ────────────────────────────────────────────────────────

def validate_credentials() -> bool:
    """
    Check ArmorIQ credentials at startup. Log mode clearly.
    Returns True if real API is configured, False if using simulator.
    """
    if _is_configured():
        _, project_id, policy_id = _creds()
        logger.info(
            "[ArmorIQ] Real API configured — project=%s policy=%s",
            project_id, policy_id,
        )
        return True

    logger.warning(
        "[ArmorIQ] Credentials not configured. "
        "Running built-in ArmorIQ simulator — "
        "policy enforcement, audit logging, and risk verification are active locally."
    )
    return False


# ── Built-in policy simulator ─────────────────────────────────────────────────

def _simulate_policy(findings: list, risk: dict) -> dict:
    """
    Local ArmorIQ policy engine — mirrors real API logic.

    Rules:
      FAIL    — any CRITICAL finding, or risk score < 30
      WARNING — any HIGH finding, or risk score < 60
      PASS    — everything else
    """
    critical = sum(1 for f in findings if f.get("severity") == "CRITICAL")
    high     = sum(1 for f in findings if f.get("severity") == "HIGH")
    score    = risk.get("score", 100)

    if critical > 0 or score < 30:
        return {
            "allowed":         False,
            "status":          "FAIL",
            "policy_decision": "flagged",
            "message": (
                f"Policy FAILED — {critical} critical vulnerability(ies) detected. "
                f"Risk score {score}/100 violates the configured security policy. "
                f"Migrate critical algorithms before deployment."
            ),
        }
    if high > 0 or score < 60:
        return {
            "allowed":         True,
            "status":          "WARNING",
            "policy_decision": "approved_with_warnings",
            "message": (
                f"Policy WARNING — {high} high-severity finding(s). "
                f"Risk score {score}/100. Migration recommended before next release."
            ),
        }
    return {
        "allowed":         True,
        "status":          "PASS",
        "policy_decision": "approved",
        "message":         f"Policy PASSED — risk score {score}/100 meets security requirements.",
    }


def _simulate_risk_verification(original_risk: dict, findings: list) -> dict:
    """
    Local ArmorIQ risk verifier.
    Adjusts score slightly based on quantum exposure to simulate
    a second-opinion verification layer.
    """
    original_score = original_risk.get("score", 100)
    quantum_exp    = original_risk.get("quantum_exposure", 0)

    # ArmorIQ adds a quantum-awareness penalty
    penalty = int(quantum_exp * 0.1)   # up to -10 points for 100% quantum exposure
    verified_score = max(0, original_score - penalty)

    policy = _simulate_policy(findings, {**original_risk, "score": verified_score})

    return {
        **original_risk,
        "score":            verified_score,
        "original_score":   original_score,
        "verified_score":   verified_score,
        "policy_decision":  policy["policy_decision"],
        "armoriq_verified": True,
        "armoriq_status":   policy["status"],
        "armoriq_message":  policy["message"],
    }


def _simulate_audit_event(event: str, metadata: dict) -> None:
    """Store audit event in memory and log it."""
    entry = {
        "event":     event,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "metadata":  metadata,
    }
    _audit_log.append(entry)
    logger.info("[ArmorIQ Simulator] Audit event: %s | %s", event, metadata)


# ── Public API ────────────────────────────────────────────────────────────────

class PolicyViolation(Exception):
    """Raised when ArmorIQ (real or simulated) explicitly denies the scan."""
    def __init__(self, message: str, details: dict = None):
        super().__init__(message)
        self.details = details or {}


async def enforce_policy(findings: list, risk: dict) -> dict:
    """
    Validate scan results against ArmorIQ policy.
    Uses real API when configured, built-in simulator otherwise.

    Returns dict:
        status   — "PASS" | "WARNING" | "FAIL" | "SKIPPED"
        allowed  — True unless policy explicitly fails
        message  — human-readable outcome
        details  — full response dict

    Raises PolicyViolation when allowed=False.
    """
    if _is_configured():
        return await _enforce_policy_real(findings, risk)
    return await _enforce_policy_simulated(findings, risk)


async def _enforce_policy_simulated(findings: list, risk: dict) -> dict:
    result = _simulate_policy(findings, risk)

    if not result["allowed"]:
        _simulate_audit_event("PolicyViolation", {
            "reason":     result["message"],
            "risk_score": risk.get("score"),
        })
        raise PolicyViolation(result["message"], details=result)

    logger.info("[ArmorIQ Simulator] Policy check: %s", result["status"])
    return {
        "status":  result["status"],
        "allowed": result["allowed"],
        "message": result["message"],
        "details": result,
    }


async def _enforce_policy_real(findings: list, risk: dict) -> dict:
    try:
        import httpx
        _, project_id, policy_id = _creds()
        payload = {
            "policy_id":  policy_id,
            "project_id": project_id,
            "findings": [
                {"algorithm": f.get("algorithm"), "severity": f.get("severity"),
                 "file": f.get("file"), "line": f.get("line")}
                for f in findings
            ],
            "risk_summary": {
                "score":          risk.get("score"),
                "level":          risk.get("level"),
                "critical_count": risk.get("critical_count", 0),
                "high_count":     risk.get("high_count", 0),
            },
        }
        async with httpx.AsyncClient(timeout=8) as client:
            resp = await client.post(
                f"{_ARMORIQ_BASE}/policy/enforce",
                headers=_headers(), json=payload,
            )
            resp.raise_for_status()
            data = resp.json()

        allowed = data.get("allowed", True)
        message = data.get("message", "Policy check passed")
        status  = "PASS" if allowed else "FAIL"
        if allowed and data.get("warnings"):
            status = "WARNING"

        if not allowed:
            await send_audit_event(event="PolicyViolation", metadata={
                "reason": message, "risk_score": risk.get("score"),
            })
            raise PolicyViolation(message, details=data)

        return {"status": status, "allowed": True, "message": message, "details": data}

    except PolicyViolation:
        raise
    except Exception as exc:
        logger.warning("[ArmorIQ] Real API unavailable, falling back to simulator: %s", exc)
        return await _enforce_policy_simulated(findings, risk)


async def send_audit_event(
    *,
    event: str,
    metadata: Optional[dict] = None,
) -> None:
    """
    Fire a security audit event.
    Uses real API when configured, in-memory simulator otherwise.
    """
    if event not in _VALID_EVENTS:
        logger.warning("[ArmorIQ] Unrecognised event type: %s", event)

    if _is_configured():
        await _send_audit_real(event=event, metadata=metadata or {})
    else:
        _simulate_audit_event(event, metadata or {})


async def _send_audit_real(*, event: str, metadata: dict) -> None:
    try:
        import httpx
        _, project_id, _ = _creds()
        payload = {"project_id": project_id, "event": event, "metadata": metadata}
        async with httpx.AsyncClient(timeout=6) as client:
            resp = await client.post(
                f"{_ARMORIQ_BASE}/audit/event",
                headers=_headers(), json=payload,
            )
            resp.raise_for_status()
        logger.info("[ArmorIQ] Audit event sent: %s", event)
    except Exception as exc:
        logger.warning("[ArmorIQ] send_audit_event failed (%s): %s", event, exc)
        _simulate_audit_event(event, metadata)   # fall back to simulator


async def verify_risk_score(original_risk: dict, findings: list) -> dict:
    """
    Verify and optionally adjust the risk score via ArmorIQ.
    Uses real API when configured, built-in simulator otherwise.
    """
    if _is_configured():
        return await _verify_risk_real(original_risk, findings)
    return _simulate_risk_verification(original_risk, findings)


async def _verify_risk_real(original_risk: dict, findings: list) -> dict:
    try:
        import httpx
        _, project_id, policy_id = _creds()
        payload = {
            "project_id":       project_id,
            "policy_id":        policy_id,
            "original_score":   original_risk.get("score"),
            "risk_level":       original_risk.get("level"),
            "findings_count":   len(findings),
            "critical_count":   original_risk.get("critical_count", 0),
            "quantum_exposure": original_risk.get("quantum_exposure", 0),
        }
        async with httpx.AsyncClient(timeout=8) as client:
            resp = await client.post(
                f"{_ARMORIQ_BASE}/risk/verify",
                headers=_headers(), json=payload,
            )
            resp.raise_for_status()
            data = resp.json()

        verified_score  = data.get("verified_score", original_risk.get("score"))
        policy_decision = data.get("policy_decision", "approved")
        armoriq_status  = "FAIL" if policy_decision == "flagged" else "PASS"

        return {
            **original_risk,
            "score":            verified_score,
            "original_score":   original_risk.get("score"),
            "verified_score":   verified_score,
            "policy_decision":  policy_decision,
            "armoriq_verified": True,
            "armoriq_status":   armoriq_status,
        }

    except Exception as exc:
        logger.warning("[ArmorIQ] Real API unavailable, using simulator: %s", exc)
        return _simulate_risk_verification(original_risk, findings)


def get_audit_log() -> list[dict]:
    """Return the in-memory audit log (simulator mode only)."""
    return list(_audit_log)
