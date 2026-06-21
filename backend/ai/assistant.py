from __future__ import annotations
"""
QuantumShield AI Assistant — QuantumBridge
==========================================
Context-aware, conversational assistant with intent detection.
Responds naturally to greetings/small-talk and uses real scan data
only when the user is asking about security, vulnerabilities, or their repo.
"""

import os

try:
    import anthropic
    _client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY", ""))
except ImportError:
    _client = None

# ── Intent categories ─────────────────────────────────────────────────────────

_GREETING_WORDS = {
    "hi", "hello", "hey", "hiya", "howdy",
    "good morning", "good evening", "good afternoon",
    "what's up", "whats up", "sup",
}

_SMALLTALK_PHRASES = {
    "how are you", "how r you", "how do you do",
    "what are you", "who are you", "what can you do",
    "tell me about yourself", "your name", "introduce yourself",
    "what is quantumbridge", "what is quantumshield",
    "help", "capabilities", "what do you know",
}

_REPO_ANALYSIS_WORDS = {
    "analyze my repo", "analyze my repository", "analyze my code",
    "scan results", "my findings", "my vulnerabilities",
    "my risk", "my score", "repository analysis",
    "what did you find", "what was found", "show findings",
    "show results", "my scan",
}

_SECURITY_QUESTION_WORDS = {
    "rsa", "ecc", "ecdsa", "ecdh", "dh", "dhe",
    "des", "3des", "md5", "sha1", "sha-1",
    "ml-kem", "ml-dsa", "slh-dsa", "kyber", "dilithium",
    "quantum", "pqc", "post-quantum", "harvest now",
    "hndl", "shor", "grover", "nist", "fips",
    "vulnerability", "vulnerable", "cryptograph",
    "encrypt", "decrypt", "signature", "certificate",
    "tls", "ssl", "key exchange", "key encapsulation",
    "migration", "migrate", "replace", "fix", "patch",
    "compliance", "cnsa", "bsi", "nsa",
}

_ARMORIQ_WORDS = {
    "armoriq", "armor iq", "policy", "compliance check",
    "policy violation", "audit", "verified", "verification",
    "policy decision", "compliant",
}

_RISK_WORDS = {
    "risk", "score", "how bad", "how dangerous", "safe",
    "critical", "high", "medium", "low", "exposure",
    "quantum exposure", "severity",
}

_FIX_WORDS = {
    "fix", "how to fix", "remediat", "replac", "patch",
    "how do i", "what should i", "suggest", "recommend",
    "migration step", "how to migrat",
}


def _detect_intent(msg: str) -> str:
    """
    Classify user message into one of:
      greeting | smalltalk | repo_analysis | armoriq |
      risk | fix | security_question | general
    """
    lower = msg.lower().strip()

    # Greeting — exact or starts with
    if lower in _GREETING_WORDS or any(lower.startswith(w) for w in _GREETING_WORDS):
        return "greeting"

    # Small talk
    if any(phrase in lower for phrase in _SMALLTALK_PHRASES):
        return "smalltalk"

    # ArmorIQ specific
    if any(w in lower for w in _ARMORIQ_WORDS):
        return "armoriq"

    # Explicit repo/scan analysis request
    if any(phrase in lower for phrase in _REPO_ANALYSIS_WORDS):
        return "repo_analysis"

    # Risk score question
    if any(w in lower for w in _RISK_WORDS):
        return "risk"

    # Fix / migration
    if any(w in lower for w in _FIX_WORDS):
        return "fix"

    # General security question
    if any(w in lower for w in _SECURITY_QUESTION_WORDS):
        return "security_question"

    return "general"


# ── System prompt builder ─────────────────────────────────────────────────────

_BASE_PROMPT = """You are QuantumShield AI, a professional and friendly security assistant
built into QuantumBridge — a post-quantum cryptography migration platform.

Personality:
- Professional, friendly, and conversational
- Greet users warmly when they say hello
- Answer general questions helpfully
- For security topics, be precise and technical
- Always start security/risk responses with a badge: [CRITICAL] [HIGH] [MEDIUM] [LOW] [SAFE]
- For greetings and small talk, respond naturally WITHOUT a risk badge

Your expertise:
- Post-Quantum Cryptography: ML-KEM (FIPS 203), ML-DSA (FIPS 204), SLH-DSA (FIPS 205)
- Vulnerable algorithms: RSA, ECC, ECDSA, DH, DHE, MD5, SHA-1, DES
- Harvest Now Decrypt Later (HNDL) threat model
- NIST PQC standardization, CNSA 2.0, BSI recommendations
- ArmorIQ policy enforcement and compliance validation
- Cryptographic agility and hybrid migration strategies

ArmorIQ integration:
- When scan context includes ArmorIQ verification, always reference it
- Mention policy decisions (approved/flagged/violated)
- Include ArmorIQ audit status when discussing compliance

Response length:
- Greetings/small talk: 2-4 sentences max
- Security questions: concise, under 250 words
- Detailed analysis: up to 400 words"""


def _build_system_prompt(scan_context: dict | None, intent: str) -> str:
    """Build system prompt — inject scan context only for relevant intents."""

    needs_context = intent in ("repo_analysis", "armoriq", "risk", "fix", "security_question")

    if not needs_context or not scan_context or not scan_context.get("findings"):
        # For greeting/smalltalk or when no scan exists, keep prompt clean
        no_scan_note = ""
        if needs_context and (not scan_context or not scan_context.get("findings")):
            no_scan_note = """

SCAN STATUS: No repository has been scanned yet.
Only mention this when the user explicitly asks about their repository,
vulnerabilities, or scan results. Do NOT mention it for greetings or general questions."""
        return _BASE_PROMPT + no_scan_note

    # Build rich context block from real scan data
    findings  = scan_context.get("findings", [])
    risk      = scan_context.get("risk", {})
    repo      = scan_context.get("repo_name", "the scanned file")
    armoriq_verified = scan_context.get("armoriq_verified", False)
    policy_decision  = risk.get("policy_decision", "skipped")
    orig_score       = risk.get("original_score", risk.get("score"))
    verified_score   = risk.get("verified_score", risk.get("score"))

    vuln_lines = []
    for f in findings:
        if f.get("severity") != "SAFE":
            vuln_lines.append(
                f"  • {f['algorithm']} at {f['file']}:{f['line']} "
                f"[{f['severity']}] → migrate to: {f.get('replacement', 'see guide')}"
            )

    safe_algos = [f["algorithm"] for f in findings if f.get("severity") == "SAFE"]

    armoriq_block = ""
    if armoriq_verified:
        armoriq_block = f"""
ArmorIQ Verification:
  • Original risk score:  {orig_score}/100
  • Verified risk score:  {verified_score}/100
  • Policy decision:      {policy_decision.upper()}
  • Always reference ArmorIQ verification when discussing compliance or policy."""
    else:
        armoriq_block = "\nArmorIQ Verification: Not configured (skipped)."

    context_block = f"""

LIVE SCAN DATA — answer questions using this real data:
Repository: {repo}
Risk Score: {risk.get('score', 'N/A')}/100  |  Level: {risk.get('level', 'N/A')}
Quantum Exposure: {risk.get('quantum_exposure', 0)}%
Critical Findings: {risk.get('critical_count', 0)}  |  High: {risk.get('high_count', 0)}
Total Vulnerabilities: {len(vuln_lines)}
{armoriq_block}

Detected vulnerabilities:
{chr(10).join(vuln_lines) if vuln_lines else '  None detected.'}

Quantum-safe algorithms already present: {', '.join(safe_algos) if safe_algos else 'None'}

Summary: {risk.get('summary', '')}

INSTRUCTION: Reference specific files, line numbers, algorithms, and ArmorIQ status
from this data. Do not give generic answers when real data is available."""

    return _BASE_PROMPT + context_block


# ── Offline fallback responses ────────────────────────────────────────────────

def _offline_response(message: str, intent: str, scan_context: dict | None) -> str:
    """Context-aware offline fallback — never returns hardcoded generic strings."""

    risk  = (scan_context or {}).get("risk", {})
    finds = (scan_context or {}).get("findings", [])
    repo  = (scan_context or {}).get("repo_name", "your repository")
    armoriq_verified = (scan_context or {}).get("armoriq_verified", False)
    policy_decision  = risk.get("policy_decision", "skipped")

    # ── Greeting ──────────────────────────────────────────────────────────────
    if intent == "greeting":
        return (
            "Hello! I'm **QuantumShield AI**, your post-quantum security assistant. "
            "I can help with vulnerability analysis, PQC migration guidance, risk assessment, "
            "ArmorIQ compliance checks, and repository security reviews. "
            "What would you like to explore today?"
        )

    # ── Small talk ────────────────────────────────────────────────────────────
    if intent == "smalltalk":
        msg = message.lower()
        if any(w in msg for w in ["how are you", "how r you", "how do you do"]):
            return (
                "I'm running at full capacity and ready to analyze your cryptographic vulnerabilities! "
                "How can I help you today?"
            )
        if any(w in msg for w in ["what can you do", "capabilities", "help"]):
            return (
                "Here's what I can do:\n"
                "• Analyze scan results and explain vulnerabilities\n"
                "• Provide migration paths (RSA → ML-KEM, ECC → ML-DSA, etc.)\n"
                "• Assess risk scores and quantum exposure\n"
                "• Validate ArmorIQ policy compliance\n"
                "• Explain post-quantum cryptography concepts\n"
                "• Guide you through NIST FIPS 203/204/205 standards\n\n"
                "Run a scan and ask me anything about your repository!"
            )
        return (
            "I'm QuantumShield AI — your post-quantum security expert. "
            "Ask me about vulnerabilities, migration strategies, risk scores, or ArmorIQ compliance. "
            "Run a scan first for repository-specific insights!"
        )

    # ── No scan data for analysis intents ────────────────────────────────────
    if not finds:
        return (
            "No repository has been analyzed yet. "
            "Run a scan on the Scanner page and I can provide specific vulnerability insights, "
            "risk assessments, migration recommendations, and ArmorIQ compliance status "
            "based on your actual code."
        )

    # ── Build context helpers ─────────────────────────────────────────────────
    level    = risk.get("level", "UNKNOWN")
    score    = risk.get("score", "N/A")
    critical = risk.get("critical_count", 0)
    high_c   = risk.get("high_count", 0)
    quantum  = risk.get("quantum_exposure", 0)
    algos    = list({f["algorithm"] for f in finds if f.get("severity") != "SAFE"})
    badge    = {"CRITICAL": "[CRITICAL]", "HIGH": "[HIGH]",
                "MEDIUM": "[MEDIUM]", "LOW": "[LOW]", "SAFE": "[SAFE]"}.get(level, "[MEDIUM]")

    armoriq_note = ""
    if armoriq_verified:
        armoriq_note = (
            f"\n\n**ArmorIQ Verification:** Policy decision — **{policy_decision.upper()}**. "
            f"Verified risk score: {risk.get('verified_score', score)}/100."
        )
    elif intent == "armoriq":
        armoriq_note = "\n\n**ArmorIQ:** Not configured. Add ARMORIQ_API_KEY to .env to enable policy enforcement."

    # ── ArmorIQ ───────────────────────────────────────────────────────────────
    if intent == "armoriq":
        if armoriq_verified:
            return (
                f"{badge} **ArmorIQ compliance status for {repo}:**\n\n"
                f"• Policy decision: **{policy_decision.upper()}**\n"
                f"• Original risk score: {risk.get('original_score', score)}/100\n"
                f"• ArmorIQ verified score: {risk.get('verified_score', score)}/100\n"
                f"• Vulnerable algorithms: {', '.join(algos) or 'none'}\n\n"
                + ("⚠️ Policy violation detected — immediate remediation required."
                   if policy_decision == "flagged" else
                   "✅ Policy check passed — continue with migration plan.")
            )
        return (
            f"{badge} ArmorIQ is not configured for this installation.\n\n"
            f"Current scan results for **{repo}**: Risk **{level}** ({score}/100), "
            f"{critical} critical, {high_c} high findings.\n\n"
            f"Add ARMORIQ_API_KEY, ARMORIQ_PROJECT_ID, and ARMORIQ_POLICY_ID to your "
            f".env file to enable policy enforcement and compliance validation."
        )

    # ── Risk / score ──────────────────────────────────────────────────────────
    if intent == "risk":
        return (
            f"{badge} **{repo}** risk assessment:\n\n"
            f"• Risk score: **{score}/100** ({level})\n"
            f"• Quantum exposure: {quantum}%\n"
            f"• Critical findings: {critical}\n"
            f"• High findings: {high_c}\n"
            f"• Vulnerable algorithms: {', '.join(algos) or 'none'}\n"
            + armoriq_note
        )

    # ── Fix / migration ───────────────────────────────────────────────────────
    if intent == "fix":
        fixes = [
            f"• **{f['algorithm']}** at `{f['file']}:{f['line']}` → {f.get('replacement', 'see guide')}"
            for f in finds if f.get("severity") not in ("SAFE", "LOW")
        ]
        return (
            f"{badge} Priority fixes for **{repo}**:\n\n"
            + ("\n".join(fixes[:6]) if fixes else "No critical fixes required.")
            + "\n\nOpen the Scanner page for full quantum-safe replacement code and migration steps."
            + armoriq_note
        )

    # ── Repo analysis ─────────────────────────────────────────────────────────
    if intent == "repo_analysis":
        details = [
            f"• **{f['algorithm']}** [{f['severity']}] — `{f['file']}:{f['line']}`"
            for f in finds if f.get("severity") != "SAFE"
        ]
        return (
            f"{badge} **{repo}** — full analysis:\n\n"
            f"Risk: **{level}** ({score}/100) | Quantum exposure: {quantum}%\n\n"
            + ("\n".join(details[:8]) if details else "No vulnerabilities found.")
            + armoriq_note
        )

    # ── Security question with context ───────────────────────────────────────
    msg_lower = message.lower()

    if "rsa" in msg_lower:
        rsa_finds = [f for f in finds if f["algorithm"] == "RSA"]
        if rsa_finds:
            return (
                f"[CRITICAL] Found **{len(rsa_finds)} RSA instance(s)** in {repo}.\n\n"
                f"RSA is broken by Shor's algorithm on quantum computers.\n"
                f"• Replace with **ML-KEM-768** (NIST FIPS 203) for key encapsulation\n"
                f"• Replace with **ML-DSA-65** (NIST FIPS 204) for signatures\n"
                f"• Library: `liboqs-python` or `liboqs-node`\n\n"
                f"Check the Scanner page for generated replacement code."
                + armoriq_note
            )
        return (
            "[CRITICAL] RSA relies on integer factorization — solvable by Shor's algorithm "
            "on a quantum computer. Migrate to **ML-KEM-768** (FIPS 203) for encryption and "
            "**ML-DSA-65** (FIPS 204) for signatures. No RSA instances found in your last scan."
        )

    if any(w in msg_lower for w in ["ecc", "ecdsa", "elliptic"]):
        ecc_finds = [f for f in finds if f["algorithm"] in ("ECC", "ECDSA", "ECDH")]
        if ecc_finds:
            return (
                f"[HIGH] Found **{len(ecc_finds)} ECC/ECDSA instance(s)** in {repo}.\n\n"
                f"Replace with **ML-DSA-65** (NIST FIPS 204) for signatures.\n"
                f"Replace ECDH with **ML-KEM-768** (NIST FIPS 203) for key exchange.\n"
                f"Library: `liboqs-python`" + armoriq_note
            )

    if "harvest" in msg_lower or "hndl" in msg_lower:
        return (
            "[HIGH] **Harvest Now, Decrypt Later (HNDL):** Adversaries collect your "
            "RSA/ECC-encrypted traffic today and store it until quantum computers can decrypt it. "
            f"Your repo ({repo}) has {quantum}% quantum exposure — "
            f"{'immediate action required.' if quantum > 50 else 'plan migration now.'}"
        )

    if any(w in msg_lower for w in ["ml-kem", "kyber", "fips 203"]):
        return (
            "[SAFE] **ML-KEM** (NIST FIPS 203) is quantum-resistant key encapsulation based on "
            "the Module Learning With Errors (MLWE) problem. No known quantum speedup exists.\n"
            "• ML-KEM-512: standard security\n"
            "• ML-KEM-768: recommended\n"
            "• ML-KEM-1024: high security\n"
            "Library: `liboqs-python` or `liboqs-node`"
        )

    # ── Generic fallback with real context ────────────────────────────────────
    return (
        f"{badge} **{repo}** — Risk: **{level}** ({score}/100). "
        f"Detected: {', '.join(algos) or 'no critical vulnerabilities'}.\n\n"
        f"Ask me about specific vulnerabilities, migration steps, risk details, "
        f"or ArmorIQ compliance and I'll give you repository-specific answers."
        + armoriq_note
    )


# ── Public API ────────────────────────────────────────────────────────────────

def chat_with_assistant(
    message: str,
    history: list = [],
    scan_context: dict | None = None,
) -> str:
    """
    Generate a context-aware, conversational AI response.

    Args:
        message:      User's message.
        history:      Prior conversation turns.
   
        scan_context: Latest scan data (findings, risk, repo_name, armoriq info).
    """
    intent        = _detect_intent(message)
    system_prompt = _build_system_prompt(scan_context, intent)
    messages      = list(history) + [{"role": "user", "content": message}]

    # ── Try Anthropic API ─────────────────────────────────────────────────────
    api_key = os.getenv("ANTHROPIC_API_KEY", "")
    if _client and api_key and not api_key.startswith("mock") and len(api_key) > 10:
        try:
            resp = _client.messages.create(
                model="claude-3-5-sonnet-20240620",
                max_tokens=800,
                system=system_prompt,
                messages=messages,
            )
            return resp.content[0].text
        except Exception:
            pass  # fall through to offline

    # ── Offline fallback ──────────────────────────────────────────────────────
    return _offline_response(message, intent, scan_context)
