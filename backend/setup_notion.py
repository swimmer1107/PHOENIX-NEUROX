"""
Notion Database Setup Script — QuantumBridge
============================================
Run this once to automatically configure all 4 Notion databases
with the correct column names and types.

Usage:
    python setup_notion.py
"""

import asyncio
import os
import httpx
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("NOTION_API_KEY", "")
NOTION_VERSION = "2022-06-28"
BASE = "https://api.notion.com/v1"

FINDINGS_DB_ID  = os.getenv("NOTION_FINDINGS_DB_ID", "")
TASKS_DB_ID     = os.getenv("NOTION_TASKS_DB_ID", "")
AUDIT_DB_ID     = os.getenv("NOTION_AUDIT_DB_ID", "")
PROJECT_DB_ID   = os.getenv("NOTION_PROJECT_DB_ID", "")

HEADERS = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json",
    "Notion-Version": NOTION_VERSION,
}


# ── Column definitions per database ──────────────────────────────────────────

FINDINGS_PROPS = {
    "Repository Name": {"title": {}},          # title column (rename existing)
    "File Name":            {"rich_text": {}},
    "Vulnerable Algorithm": {"rich_text": {}},
    "Risk Score":           {"number": {"format": "number"}},
    "Severity":             {"select": {"options": [
        {"name": "CRITICAL", "color": "red"},
        {"name": "HIGH",     "color": "orange"},
        {"name": "MEDIUM",   "color": "yellow"},
        {"name": "LOW",      "color": "green"},
    ]}},
    "Suggested Migration":  {"rich_text": {}},
    "Detection Timestamp":  {"date": {}},
    "Status":               {"select": {"options": [
        {"name": "Open",        "color": "red"},
        {"name": "In Progress", "color": "yellow"},
        {"name": "Resolved",    "color": "green"},
    ]}},
}

TASKS_PROPS = {
    "Task Name":   {"title": {}},
    "Assigned To": {"rich_text": {}},
    "Priority":    {"select": {"options": [
        {"name": "High",   "color": "red"},
        {"name": "Medium", "color": "yellow"},
        {"name": "Low",    "color": "green"},
    ]}},
    "Status":      {"select": {"options": [
        {"name": "To Do",       "color": "gray"},
        {"name": "In Progress", "color": "yellow"},
        {"name": "Done",        "color": "green"},
    ]}},
    "Due Date":    {"date": {}},
}

AUDIT_PROPS = {
    "Action":              {"title": {}},
    "Timestamp":           {"date": {}},
    "User/System":         {"rich_text": {}},
    "Related Repository":  {"rich_text": {}},
}

PROJECT_PROPS = {
    "Project Name":        {"title": {}},
    "Total Findings":      {"number": {"format": "number"}},
    "Critical Findings":   {"number": {"format": "number"}},
    "Resolved Findings":   {"number": {"format": "number"}},
    "Migration Progress %":{"number": {"format": "percent"}},
    "Overall Risk Score":  {"number": {"format": "number"}},
    "Last Updated":        {"date": {}},
}


def format_db_id(db_id: str) -> str:
    """
    Notion database IDs from the URL are 32-char hex strings.
    The API accepts them with or without hyphens but requires
    the standard UUID format: 8-4-4-4-12
    """
    raw = db_id.replace("-", "")
    if len(raw) == 32:
        return f"{raw[0:8]}-{raw[8:12]}-{raw[12:16]}-{raw[16:20]}-{raw[20:32]}"
    return db_id  # already formatted or unknown


async def get_existing_props(client, db_id):
    """Fetch the current property names from a database."""
    fid = format_db_id(db_id)
    resp = await client.get(f"{BASE}/databases/{fid}", headers=HEADERS)
    if resp.status_code != 200:
        print(f"   ❌ API error {resp.status_code}: {resp.text[:400]}")
        resp.raise_for_status()
    return resp.json().get("properties", {})


async def update_database(client, db_id, desired_props, db_name):
    """
    Update a Notion database to have the desired properties.
    - Renames the existing title column to match our expected name.
    - Adds any missing columns.
    """
    print(f"\n🔧 Configuring: {db_name}")

    existing = await get_existing_props(client, db_id)
    existing_names = list(existing.keys())
    print(f"   Existing columns: {existing_names}")

    # Find the current title column name
    current_title_name = None
    for name, prop in existing.items():
        if prop.get("type") == "title":
            current_title_name = name
            break

    # Build the properties payload
    props_to_send = {}

    for prop_name, prop_config in desired_props.items():
        is_title = "title" in prop_config

        if is_title:
            if current_title_name and current_title_name != prop_name:
                # Rename the existing title column
                props_to_send[current_title_name] = {"name": prop_name, "title": {}}
                print(f"   ✏️  Renaming title column '{current_title_name}' → '{prop_name}'")
            # If already correct name, nothing to do for title
        else:
            if prop_name not in existing:
                props_to_send[prop_name] = prop_config
                print(f"   ➕ Adding column: {prop_name}")
            else:
                print(f"   ✅ Already exists: {prop_name}")

    if not props_to_send:
        print(f"   ✅ All columns already correct!")
        return

    resp = await client.patch(
        f"{BASE}/databases/{format_db_id(db_id)}",
        headers=HEADERS,
        json={"properties": props_to_send},
    )

    if resp.status_code == 200:
        print(f"   ✅ {db_name} updated successfully!")
    else:
        print(f"   ❌ Failed ({resp.status_code}): {resp.text[:300]}")


async def main():
    if not API_KEY:
        print("❌ NOTION_API_KEY not set in .env")
        return

    missing = []
    if not FINDINGS_DB_ID: missing.append("NOTION_FINDINGS_DB_ID")
    if not TASKS_DB_ID:    missing.append("NOTION_TASKS_DB_ID")
    if not AUDIT_DB_ID:    missing.append("NOTION_AUDIT_DB_ID")
    if not PROJECT_DB_ID:  missing.append("NOTION_PROJECT_DB_ID")

    if missing:
        print(f"❌ Missing env vars: {', '.join(missing)}")
        return

    print("🚀 QuantumBridge — Notion Database Setup")
    print("=" * 45)

    async with httpx.AsyncClient(timeout=15) as client:
        await update_database(client, FINDINGS_DB_ID,  FINDINGS_PROPS, "QB Findings")
        await update_database(client, TASKS_DB_ID,     TASKS_PROPS,    "QB Migration Tasks")
        await update_database(client, AUDIT_DB_ID,     AUDIT_PROPS,    "QB Audit Log")
        await update_database(client, PROJECT_DB_ID,   PROJECT_PROPS,  "QB Project Dashboard")

    print("\n✅ Setup complete! Now run a scan and check your Notion databases.")


if __name__ == "__main__":
    asyncio.run(main())
