import re

# ── Vulnerability definitions ─────────────────────────────────────────────────

VULNERABLE_PATTERNS = {
    "RSA": {
        "patterns": [
            r"RSA\.generate", r"rsa\.newkeys", r"from Crypto\.PublicKey import RSA",
            r"generateKeyPair.*rsa", r"createSign.*sha256WithRSAEncryption",
            r"rs256", r"RS256", r"PKCS1", r"rsa_encrypt", r"rsa_decrypt"
        ],
        "severity": "CRITICAL",
        "quantum_vulnerable": True,
        "description": "RSA will be broken by Shor's algorithm on quantum computers",
        "why_quantum_risk": "Shor's algorithm solves integer factorization in polynomial time O(log N)³, making RSA mathematically obsolete against quantum computers.",
        "replacement": "ML-KEM-768 (NIST FIPS 203)",
        "complexity": "Medium",
        "migration_steps": [
            "1. Identify all RSA key generation and usage points",
            "2. Replace RSA key encapsulation with ML-KEM-768 (liboqs-python)",
            "3. Replace RSA signatures with ML-DSA-65",
            "4. Run hybrid mode (RSA + ML-KEM) during transition",
            "5. Phase out RSA entirely once PQC is validated",
        ],
        "replacement_code": """# ✅ QUANTUM-SAFE REPLACEMENT for RSA
# Using ML-KEM-768 (NIST FIPS 203) via liboqs-python
import oqs

def generate_mlkem_keypair():
    kem = oqs.KeyEncapsulation("ML-KEM-768")
    public_key = kem.generate_keypair()
    return kem, public_key

def encapsulate(public_key):
    with oqs.KeyEncapsulation("ML-KEM-768") as kem:
        ciphertext, shared_secret = kem.encap_secret(public_key)
        return ciphertext, shared_secret

def decapsulate(kem, ciphertext):
    shared_secret = kem.decap_secret(ciphertext)
    return shared_secret""",
    },
    "ECC": {
        "patterns": [
            r"ec\.generate_private_key", r"ECDSA", r"ECDH", r"prime256v1",
            r"secp256k1", r"P-256", r"ES256", r"elliptic\.curve"
        ],
        "severity": "HIGH",
        "quantum_vulnerable": True,
        "description": "ECC is vulnerable to quantum attacks via Shor's algorithm",
        "why_quantum_risk": "Shor's algorithm can solve the discrete logarithm problem underlying ECC in O(n³) time, recovering private keys from public keys.",
        "replacement": "ML-DSA-65 (NIST FIPS 204)",
        "complexity": "Medium",
        "migration_steps": [
            "1. Identify all EC key generation (ec.generate_private_key, ECKey, etc.)",
            "2. Replace with ML-DSA-65 for signatures (NIST FIPS 204)",
            "3. Replace ECDH key exchange with ML-KEM-768",
            "4. Update certificate infrastructure to support PQC",
            "5. Use hybrid classical+PQC during transition period",
        ],
        "replacement_code": """# ✅ QUANTUM-SAFE REPLACEMENT for ECC
# Using ML-DSA-65 (NIST FIPS 204) via liboqs-python
import oqs

def generate_mldsa_keypair():
    signer = oqs.Signature("ML-DSA-65")
    public_key = signer.generate_keypair()
    return signer, public_key

def sign_data(signer, message: bytes) -> bytes:
    return signer.sign(message)

def verify_signature(public_key: bytes, message: bytes, signature: bytes) -> bool:
    with oqs.Signature("ML-DSA-65") as verifier:
        return verifier.verify(message, signature, public_key)""",
    },
    "DH": {
        "patterns": [
            r"dh\.generate_parameters", r"DHE", r"DIFFIE_HELLMAN", r"DiffieHellman"
        ],
        "severity": "HIGH",
        "quantum_vulnerable": True,
        "description": "Diffie-Hellman key exchange is quantum-vulnerable",
        "why_quantum_risk": "Shor's algorithm computes discrete logarithms in O((log p)³) time — making DH key exchange completely insecure against quantum computers.",
        "replacement": "ML-KEM-1024 (NIST FIPS 203)",
        "complexity": "Hard",
        "migration_steps": [
            "1. Replace DH/DHE key exchange with ML-KEM-1024",
            "2. Update TLS configuration to use hybrid DH+ML-KEM",
            "3. Regenerate all session key derivation using PQC-derived shared secrets",
        ],
        "replacement_code": """# ✅ QUANTUM-SAFE REPLACEMENT for Diffie-Hellman
# Use ML-KEM-1024 for high-security key exchange (NIST FIPS 203)
import oqs

def quantum_safe_key_exchange():
    kem = oqs.KeyEncapsulation("ML-KEM-1024")
    public_key = kem.generate_keypair()
    return kem, public_key""",
    },
    "MD5": {
        "patterns": [r"hashlib\.md5", r"MD5", r"createHash.*md5"],
        "severity": "MEDIUM",
        "quantum_vulnerable": False,
        "description": "MD5 is cryptographically broken even on classical computers",
        "why_quantum_risk": "MD5 is already classically broken. Grover's algorithm reduces its effective security from 128-bit to just 64-bit quantum security.",
        "replacement": "SHA3-256 (NIST FIPS 202)",
        "complexity": "Easy",
        "migration_steps": [
            "1. Replace all hashlib.md5() calls with hashlib.sha3_256()",
            "2. Update any stored hashes during next user login",
            "3. For passwords, use hashlib.scrypt() or bcrypt instead",
        ],
        "replacement_code": """# ✅ QUANTUM-SAFE REPLACEMENT for MD5
# SHA3-256 provides 128-bit quantum security (Grover-resistant)
import hashlib

def secure_hash(data: bytes) -> str:
    return hashlib.sha3_256(data).hexdigest()""",
    },
    "SHA1": {
        "patterns": [r"hashlib\.sha1", r"SHA-1", r"SHA1", r"createHash.*sha1"],
        "severity": "MEDIUM",
        "quantum_vulnerable": False,
        "description": "SHA-1 is deprecated and collision-vulnerable",
        "why_quantum_risk": "SHA-1 is classically broken by collision attacks. Grover's algorithm reduces its preimage resistance to 80-bit quantum security.",
        "replacement": "SHA3-256 (NIST FIPS 202)",
        "complexity": "Easy",
        "migration_steps": [
            "1. Replace all SHA-1 usage with SHA3-256",
            "2. Update HMAC-SHA1 to HMAC-SHA3-256",
            "3. Re-issue any certificates signed with SHA-1",
        ],
        "replacement_code": """# ✅ QUANTUM-SAFE REPLACEMENT for SHA-1
# SHA3-256 — NIST FIPS 202, 128-bit quantum security
import hashlib

def secure_hash(data: bytes) -> str:
    return hashlib.sha3_256(data).hexdigest()

def secure_hmac(key: bytes, message: bytes) -> bytes:
    import hmac
    return hmac.new(key, message, hashlib.sha3_256).digest()""",
    },
    "DES": {
        "patterns": [r"DES\.new", r"3DES", r"TripleDES", r"des\.encrypt"],
        "severity": "CRITICAL",
        "quantum_vulnerable": False,
        "description": "DES/3DES is severely outdated and insecure",
        "why_quantum_risk": "DES is already broken by classical brute-force. Grover's algorithm further reduces its effective key size to near zero.",
        "replacement": "AES-256-GCM (NIST FIPS 197)",
        "complexity": "Easy",
        "migration_steps": [
            "1. Replace DES.new() / TripleDES with AES-256-GCM",
            "2. Generate a fresh 256-bit key (os.urandom(32))",
            "3. Use GCM mode for authenticated encryption",
            "4. Re-encrypt any data previously encrypted with DES",
        ],
        "replacement_code": """# ✅ QUANTUM-SAFE REPLACEMENT for DES/3DES
# AES-256-GCM provides 256-bit security (128-bit quantum security)
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
import os

def encrypt(plaintext: bytes, key: bytes = None) -> tuple:
    if key is None:
        key = os.urandom(32)  # 256-bit key
    aesgcm = AESGCM(key)
    nonce = os.urandom(12)
    ciphertext = aesgcm.encrypt(nonce, plaintext, None)
    return key, nonce, ciphertext

def decrypt(key: bytes, nonce: bytes, ciphertext: bytes) -> bytes:
    aesgcm = AESGCM(key)
    return aesgcm.decrypt(nonce, ciphertext, None)""",
    },
}

# ── Quantum-safe alternatives (kept for Notion/ArmorIQ metadata) ──────────────

QUANTUM_SAFE_ALTERNATIVES = {
    algo: {
        "algorithm": cfg["replacement"],
        "complexity": cfg["complexity"],
        "use_case": cfg.get("description", ""),
    }
    for algo, cfg in VULNERABLE_PATTERNS.items()
}


# ── Scanner ───────────────────────────────────────────────────────────────────

def scan_code(code: str, filename: str = "input") -> list:
    findings = []
    lines = code.split("\n")

    for line_num, line in enumerate(lines, 1):
        trimmed = line.strip()
        # Skip blank lines and pure comments
        if not trimmed or trimmed.startswith("#") or trimmed.startswith("//"):
            continue

        for algo, config in VULNERABLE_PATTERNS.items():
            already_found = any(
                f["line"] == line_num and f["algorithm"] == algo
                for f in findings
            )
            if already_found:
                continue

            for pattern in config["patterns"]:
                if re.search(pattern, line, re.IGNORECASE):
                    findings.append({
                        # ── Core fields (original) ────────────────────────
                        "file": filename,
                        "line": line_num,
                        "code_snippet": trimmed,
                        "algorithm": algo,
                        "severity": config["severity"],
                        "description": config["description"],
                        # ── Rich fields expected by the frontend ──────────
                        "quantum_vulnerable": config["quantum_vulnerable"],
                        "why_quantum_risk": config["why_quantum_risk"],
                        "replacement": config["replacement"],
                        "replacement_code": config["replacement_code"],
                        "migration_steps": config["migration_steps"],
                        "complexity": config["complexity"],
                        # ── recommendation dict for Notion/ArmorIQ ────────
                        "recommendation": QUANTUM_SAFE_ALTERNATIVES.get(algo, {}),
                    })
                    break  # one match per algorithm per line is enough

    return findings
