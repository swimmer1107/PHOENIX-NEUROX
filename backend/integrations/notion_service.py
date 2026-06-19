"""
Notion Integration Service — QuantumBridge
==========================================
Handles all Notion API interactions:
  - Findings Database (create vulnerability records)
  - Migration Tasks Database (create remediation tasks)
  - Audit Log Database (log scan/action events)
  - Project Risk Dashboard (maintain project-level metrics)

Required environment variables:
  NOTION_API_KEY
  NOTION_FINDINGS_DB_ID
  NOTION_TASKS_DB_ID
  NOTION_AUDIT_DB_ID
  NOTION_PROJECT_DB_ID
"""

import os
import logging
from datetime import datetime, timezone
from typing import Optional

import httpx
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

# ── Notion API config ─────────────────────────────────────────────────────────
_NOTION_API_KEY = os.getenv("NOTION_API_KEY", "")
_NOTION_VERSION = "2022-06-28"
_NOTION_BASE = "https://api.notion.com/v1"

_FINDINGS_DB_ID = os.getenv("NOTION_FINDINGS_DB_ID", "")
_TASKS_DB_ID = os.getenv("NOTION_TASKS_DB_ID", "")
_AUDIT_DB_ID = os.getenv("NOTION_AUDIT_DB_ID", "")
_PROJECT_DB_ID = os.getenv("NOTION_PROJECT_DB_ID", "")

# Algorithms that require a migration task (CRITICAL or HIGH severity findings)
_TASK_TRIGGER_SEVERITIES = {"CRITICAL", "HIGH"}


def _headers() -> dict:
    """Return standard Notion API request headers."""
    return {
        "Authorization": f"Bearer {_NOTION_API_KEY}",
        "Content-Type": "application/json",
        "Notion-Version": _NOTION_VERSION,
    }


def _is_configured() -> bool:
    """Return True only when all required env vars are set."""
    return bool(_NOTION_API_KEY and _FINDINGS_DB_ID and _TASKS_DB_ID and _AUDIT_DB_ID)


def _rich_text(value: str) -> list:
    """Helper — build a Notion rich_text property value."""
    return [{"type": "text", "text": {"content": str(value)[:2000]}}]


def _now_iso() -> str:
    """Return current UTC timestamp as ISO 8601 string."""
    return datetime.now(timezone.utc).isoformat()


# ── Findings Database ─────────────────────────────────────────────────────────

async def create_finding(
    *,
    repo_name: str,
    file_name: str,
    algorithm: str,
    risk_score: int,
    severity: str,
    suggested_migration: str,
    timestamp: Optional[str] = None,
) -> Optional[dict]:
    """
    Create a new vulnerability record in the Notion Findings database.
    Returns the created page object or None on failure.
    """
    if not _is_configured():
        logger.warning("[Notion] Skipping create_finding — not configured")
        return None

    ts = timestamp or _now_iso()
    payload = {
        "parent": {"database_id": _FINDINGS_DB_ID},
        "properties": {
            "Repository Name": {"title": _rich_text(repo_name)},
            "File Name": {"rich_text": _rich_text(file_name)},
            "Vulnerable Algorithm": {"rich_text": _rich_text(algorithm)},
            "Risk Score": {"number": risk_score},
            "Severity": {"select": {"name": severity}},
            "Suggested Migration": {"rich_text": _rich_text(suggested_migration)},
            "Detection Timestamp": {"date": {"start": ts}},
            "Status": {"select": {"name": "Open"}},
        },
    }

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.post(
                f"{_NOTION_BASE}/pages",
                headers=_headers(),
                json=payload,
            )
            resp.raise_for_status()
            page = resp.json()
            logger.info("[Notion] Finding created: %s | %s | %s", repo_name, algorithm, severity)
            return page
    except Exception as exc:
        logger.error("[Notion] create_finding failed: %s", exc)
        return None


# ── Migration Tasks Database ──────────────────────────────────────────────────

async def create_migration_task(
    *,
    task_name: str,
    priority: str,
    related_finding_page_id: Optional[str] = None,
    due_date: Optional[str] = None,
    assigned_to: str = "Security Team",
) -> Optional[dict]:
    """
    Create a remediation task in the Notion Tasks database.
    Links back to the finding page when a page ID is supplied.
    Only called for CRITICAL or HIGH severity findings.
    """
    if not _is_configured():
        logger.warning("[Notion] Skipping create_migration_task — not configured")
        return None

    properties: dict = {
        "Task Name": {"title": _rich_text(task_name)},
        "Assigned To": {"rich_text": _rich_text(assigned_to)},
        "Priority": {"select": {"name": priority}},
        "Status": {"select": {"name": "To Do"}},
    }

    if due_date:
        properties["Due Date"] = {"date": {"start": due_date}}

    # Only add relation if the Tasks DB has a Relation property configured
    # Skipping by default to avoid 400 errors on fresh DB setups

    payload = {
        "parent": {"database_id": _TASKS_DB_ID},
        "properties": properties,
    }

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.post(
                f"{_NOTION_BASE}/pages",
                headers=_headers(),
                json=payload,
            )
            resp.raise_for_status()
            page = resp.json()
            logger.info("[Notion] Migration task created: %s | %s", task_name, priority)
            return page
    except Exception as exc:
        logger.error("[Notion] create_migration_task failed: %s", exc)
        return None


# ── Audit Log Database ────────────────────────────────────────────────────────

async def log_audit_event(
    *,
    action: str,
    user_or_system: str = "QuantumBridge System",
    related_repo: str = "",
) -> Optional[dict]:
    """
    Append an audit entry to the Notion Audit Log database.
    Valid actions: Scan Started, Scan Completed, Risk Calculated,
                   PR Generated, Migration Completed
    """
    if not (_NOTION_API_KEY and _AUDIT_DB_ID):
        logger.warning("[Notion] Skipping log_audit_event — not configured")
        return None

    payload = {
        "parent": {"database_id": _AUDIT_DB_ID},
        "properties": {
            "Action": {"title": _rich_text(action)},
            "Timestamp": {"date": {"start": _now_iso()}},
            "User/System": {"rich_text": _rich_text(user_or_system)},
            "Related Repository": {"rich_text": _rich_text(related_repo)},
        },
    }

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.post(
                f"{_NOTION_BASE}/pages",
                headers=_headers(),
                json=payload,
            )
            resp.raise_for_status()
            logger.info("[Notion] Audit event logged: %s", action)
            return resp.json()
    except Exception as exc:
        logger.error("[Notion] log_audit_event failed: %s", exc)
        return None


# ── Project Risk Dashboard ────────────────────────────────────────────────────

async def upsert_project_metrics(
    *,
    project_name: str,
    total_findings: int,
    critical_findings: int,
    resolved_findings: int,
    migration_progress_pct: float,
    overall_risk_score: int,
) -> Optional[dict]:
    """
    Create or update a project-level risk metrics page in the Notion
    Project Risk Dashboard database.
    Queries for an existing page by project name first; creates one if absent.
    """
    if not (_NOTION_API_KEY and _PROJECT_DB_ID):
        logger.warning("[Notion] Skipping upsert_project_metrics — not configured")
        return None

    # Search for an existing page matching this project
    existing_page_id = await _find_project_page(project_name)

    properties: dict = {
        "Project Name": {"title": _rich_text(project_name)},
        "Total Findings": {"number": total_findings},
        "Critical Findings": {"number": critical_findings},
        "Resolved Findings": {"number": resolved_findings},
        "Migration Progress %": {"number": round(migration_progress_pct, 2)},
        "Overall Risk Score": {"number": overall_risk_score},
        "Last Updated": {"date": {"start": _now_iso()}},
    }

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            if existing_page_id:
                # Update existing page
                resp = await client.patch(
                    f"{_NOTION_BASE}/pages/{existing_page_id}",
                    headers=_headers(),
                    json={"properties": properties},
                )
            else:
                # Create new project page
                resp = await client.post(
                    f"{_NOTION_BASE}/pages",
                    headers=_headers(),
                    json={"parent": {"database_id": _PROJECT_DB_ID}, "properties": properties},
                )
            resp.raise_for_status()
            logger.info("[Notion] Project metrics upserted: %s", project_name)
            return resp.json()
    except Exception as exc:
        logger.error("[Notion] upsert_project_metrics failed: %s", exc)
        return None


async def _find_project_page(project_name: str) -> Optional[str]:
    """Query the Project DB for a page whose title matches project_name."""
    if not (_NOTION_API_KEY and _PROJECT_DB_ID):
        return None
    payload = {
        "filter": {
            "property": "Project Name",
            "title": {"equals": project_name},
        }
    }
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.post(
                f"{_NOTION_BASE}/databases/{_PROJECT_DB_ID}/query",
                headers=_headers(),
                json=payload,
            )
            resp.raise_for_status()
            results = resp.json().get("results", [])
            return results[0]["id"] if results else None
    except Exception as exc:
        logger.error("[Notion] _find_project_page failed: %s", exc)
        return None


# ── High-level orchestrator ───────────────────────────────────────────────────

async def process_scan_findings(
    *,
    findings: list,
    risk: dict,
    repo_name: str = "QuantumBridge Scan",
) -> None:
    """
    Called after every successful scan.
    Orchestrates:
      1. Audit: Scan Completed
      2. Per-finding: create Notion Finding record
      3. Per CRITICAL/HIGH finding: create linked Migration Task
      4. Audit: Risk Calculated
      5. Project metrics upsert
    """
    # 1. Audit — scan completed
    await log_audit_event(
        action="Scan Completed",
        related_repo=repo_name,
    )

    # 2 & 3. Process each finding
    for finding in findings:
        algorithm = finding.get("algorithm", "Unknown")
        severity = finding.get("severity", "LOW")
        file_name = finding.get("file", "unknown")
        recommendation = finding.get("recommendation", {})

        # Build a human-readable migration suggestion
        suggested_migration = (
            recommendation.get("algorithm", "")
            or finding.get("replacement", "")
            or "See migration guide"
        )

        # Create the finding record in Notion
        finding_page = await create_finding(
            repo_name=repo_name,
            file_name=file_name,
            algorithm=algorithm,
            risk_score=risk.get("score", 0),
            severity=severity,
            suggested_migration=suggested_migration,
        )

        # For critical/high findings, also create a remediation task
        if severity in _TASK_TRIGGER_SEVERITIES:
            finding_page_id = finding_page.get("id") if finding_page else None
            priority_map = {"CRITICAL": "High", "HIGH": "Medium"}
            await create_migration_task(
                task_name=f"Migrate {algorithm} in {file_name}",
                priority=priority_map.get(severity, "Medium"),
                related_finding_page_id=finding_page_id,
            )

    # 4. Audit — risk calculated
    await log_audit_event(
        action="Risk Calculated",
        related_repo=repo_name,
    )

    # 5. Upsert project-level metrics
    total = risk.get("total_findings", len(findings))
    critical = risk.get("critical_count", 0)
    resolved = 0  # no resolved tracking yet; placeholder
    progress_pct = round((resolved / total * 100) if total else 100.0, 2)

    await upsert_project_metrics(
        project_name=repo_name,
        total_findings=total,
        critical_findings=critical,
        resolved_findings=resolved,
        migration_progress_pct=progress_pct,
        overall_risk_score=risk.get("score", 100),
    )
