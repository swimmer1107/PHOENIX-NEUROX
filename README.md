# QuantumBridge — Post-Quantum Cryptography Migration Platform

QuantumBridge detects vulnerable cryptographic algorithms in your codebase and generates quantum-safe migration paths aligned with NIST PQC standards (FIPS 203/204/205).

---

## Features

- **Crypto Scanner** — detects RSA, ECC, ECDSA, DH, DES, MD5, SHA-1 and more
- **Risk Analyzer** — calculates quantum exposure score and severity breakdown
- **Migration Guide** — step-by-step PQC migration with generated replacement code
- **AI Assistant** — QuantumShield AI answers security questions using real scan context
- **Notion Integration** — auto-syncs findings, tasks, audit logs, and project metrics
- **ArmorIQ Integration** — policy enforcement, risk verification, and audit logging (simulator built-in, no credentials required)
- **Dashboard** — live security metrics and top threats table

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, TailwindCSS, Recharts, Monaco Editor |
| Backend | FastAPI, Python 3.11+, Uvicorn, Gunicorn |
| AI | Anthropic Claude (with offline fallback) |
| Integrations | Notion API, ArmorIQ (built-in simulator) |
| Deployment | Vercel (frontend), Render (backend) |

---

## Architecture

```
frontend/          React + Vite SPA (Vercel)
  src/
    pages/         Scanner, Dashboard, RiskAnalyzer, MigrationGuide, Landing
    components/    Navbar, AIAssistantDrawer, TopThreatsTable, ...
    hooks/         useAIAssistant (scan context provider)

backend/           FastAPI (Render)
  main.py          API routes + integration orchestration
  scanner/         crypto_scanner.py, risk_engine.py
  ai/              assistant.py (context-aware, intent-detection)
  integrations/    notion_service.py, armoriq_service.py
  models/          schemas.py
```

---

## Local Setup

### Backend

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env   # fill in your values
python main.py
```

Backend runs at `http://localhost:8000`

### Frontend

```bash
cd frontend
npm install
cp .env.example .env   # optional — defaults to localhost:8000
npm run dev
```

Frontend runs at `http://localhost:5173`

---

## Environment Variables

### Backend (`backend/.env`)

```env
# Anthropic Claude — optional, AI works offline without it
ANTHROPIC_API_KEY=sk-ant-...

# Notion Integration — optional
NOTION_API_KEY=secret_...
NOTION_FINDINGS_DB_ID=
NOTION_TASKS_DB_ID=
NOTION_AUDIT_DB_ID=
NOTION_PROJECT_DB_ID=

# ArmorIQ — optional, built-in simulator runs when empty
ARMORIQ_API_KEY=
ARMORIQ_PROJECT_ID=
ARMORIQ_POLICY_ID=

# Server
PORT=8000
DEBUG=true
```

### Frontend (`frontend/.env`)

```env
VITE_API_BASE_URL=http://localhost:8000
```

---

## Notion Integration

Automatically syncs after every scan:
- **Findings DB** — one record per vulnerability (algorithm, severity, file, risk score)
- **Migration Tasks DB** — remediation tasks for CRITICAL/HIGH findings
- **Audit Log DB** — scan started/completed, risk calculated events
- **Project Dashboard DB** — project-level metrics and migration progress

**Setup:**
1. Go to [notion.so/my-integrations](https://www.notion.so/my-integrations) → create integration → copy token
2. Create 4 databases (run `python setup_notion.py` to auto-configure columns)
3. Share each database with your integration via `...` → Connections
4. Add IDs from database URLs to `backend/.env`

---

## ArmorIQ Integration

Works without credentials — built-in simulator runs locally:

- **Policy enforcement** — PASS / WARNING / FAIL based on finding severity
- **Risk verification** — adjusts score based on quantum exposure
- **Audit logging** — all scan events logged to console + memory
- **Status endpoint** — `GET /api/armoriq/status`

When `ARMORIQ_API_KEY` is configured, the real API is called with automatic fallback to simulator on failure.

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/scan/code` | Scan pasted code |
| `POST` | `/api/scan/file` | Scan uploaded file |
| `POST` | `/api/ai/chat` | AI assistant with scan context |
| `GET`  | `/api/dashboard/stats` | Dashboard metrics |
| `GET`  | `/api/armoriq/status` | ArmorIQ mode + audit log |
| `POST` | `/api/armoriq/audit` | Fire manual audit event |
| `POST` | `/api/notion/sync-dashboard` | Push metrics to Notion |
| `POST` | `/api/notion/audit` | Log manual Notion audit event |

---

## Deployment

### Backend → Render

1. Push repo to GitHub
2. Create new **Web Service** on [render.com](https://render.com)
3. Set **Root Directory**: `backend`
4. **Build Command**: `pip install -r requirements.txt`
5. **Start Command**: `gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app --bind 0.0.0.0:$PORT`
6. Add environment variables in Render dashboard

### Frontend → Vercel

1. Import repo on [vercel.com](https://vercel.com)
2. Set **Root Directory**: `frontend`
3. **Framework Preset**: Vite
4. **Build Command**: `npm run build`
5. **Output Directory**: `dist`
6. Add `VITE_API_BASE_URL=https://your-backend.onrender.com` in Vercel env vars

---

## GitHub Push

```bash
cd Phoenix-main
git init
git add .
git commit -m "QuantumBridge - Notion & ArmorIQ Ready"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

---

## Team

**Team Phoenix | Cyberonites**
*IntrusionX Second Edition | GLA University*
