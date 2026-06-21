
import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import axios from 'axios';
import toast from 'react-hot-toast';
import GlowButton from '../components/GlowButton';
import API_BASE_URL from '../apiConfig';
import { useAIAssistant } from '../hooks/useAIAssistant.jsx';


const CRYPTO_PATTERNS = {

  RSA: {
    severity: "CRITICAL",
    quantum_vulnerable: true,
    replacement: "ML-KEM-768 (NIST FIPS 203)",
    description: "RSA relies on the difficulty of factoring large integers. Shor's algorithm running on a cryptographically relevant quantum computer (CRQC) can factor RSA keys exponentially faster than any classical method — breaking RSA-2048 in hours instead of billions of years.",
    why_quantum_risk: "Shor's algorithm solves integer factorization in polynomial time O(log N)³, making RSA mathematically obsolete against quantum computers.",
    migration_steps: [
      "1. Identify all RSA key generation and usage points",
      "2. Replace RSA key encapsulation with ML-KEM-768 (liboqs-python)",
      "3. Replace RSA signatures with ML-DSA-65",
      "4. Run hybrid mode (RSA + ML-KEM) during transition",
      "5. Phase out RSA entirely once PQC is validated",
    ],
    safe_replacement_code: {
      python: `# ✅ QUANTUM-SAFE REPLACEMENT for RSA
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
    return shared_secret`,
      javascript: `// ✅ QUANTUM-SAFE REPLACEMENT for RSA
// Using ML-KEM-768 via liboqs-node
const oqs = require('liboqs-node');

async function generateMLKEMKeypair() {
  const kem = new oqs.KeyEncapsulation('ML-KEM-768');
  const publicKey = kem.generateKeypair();
  return { kem, publicKey };
}

async function encapsulate(publicKey) {
  const kem = new oqs.KeyEncapsulation('ML-KEM-768');
  const { ciphertext, sharedSecret } = kem.encapSecret(publicKey);
  return { ciphertext, sharedSecret };
}`,
      java: `// ✅ QUANTUM-SAFE REPLACEMENT for RSA
// Using ML-KEM-768 via liboqs-java
import org.openquantumsafe.KeyEncapsulation;

public class QuantumSafeKEM {
    public static void main(String[] args) {
        KeyEncapsulation kem = new KeyEncapsulation("ML-KEM-768");
        byte[] publicKey = kem.generate_keypair();
        byte[] ciphertext = new byte[kem.get_length_ciphertext()];
        byte[] sharedSecretEnc = kem.encap_secret(publicKey);
        byte[] sharedSecretDec = kem.decap_secret(ciphertext);
    }
}`,
    },
    complexity: "Medium",
    patterns: [
      /from\s+Crypto\.PublicKey\s+import\s+RSA/i,
      /import\s+RSA\b/i,
      /RSA\.generate\s*\(/i,
      /RSA\.import_key/i,
      /rsa\.newkeys\s*\(/i,
      /rsa\.encrypt\s*\(/i,
      /rsa\.decrypt\s*\(/i,
      /generateKeyPair.*rsa/i,
      /KeyPairGenerator\.getInstance\s*\(\s*['"]RSA['"]/i,
      /createSign\s*\(\s*['"]RSA/i,
      /createVerify\s*\(\s*['"]RSA/i,
      /PKCS1_v1_5/i,
      /PKCS1_OAEP/i,
      /pkcs1_15/i,
      /RS256\b/,
      /RS384\b/,
      /RS512\b/,
      /rsa_encrypt/i,
      /rsa_decrypt/i,
      /RSAPrivateKey/i,
      /RSAPublicKey/i,
      /BEGIN RSA PRIVATE KEY/i,
      /BEGIN RSA PUBLIC KEY/i,
      /crypto\.privateDecrypt/i,
      /crypto\.publicEncrypt/i,
    ],
  },

  ECC: {
    severity: "HIGH",
    quantum_vulnerable: true,
    replacement: "ML-DSA-65 (NIST FIPS 204)",
    description: "Elliptic Curve Cryptography (ECC) bases its security on the Elliptic Curve Discrete Logarithm Problem (ECDLP). Shor's algorithm solves ECDLP in polynomial time, completely breaking all standard elliptic curves including P-256, P-384, secp256k1.",
    why_quantum_risk: "Shor's algorithm can solve the discrete logarithm problem underlying ECC in O(n³) time on a quantum computer, recovering private keys from public keys.",
    migration_steps: [
      "1. Identify all EC key generation (ec.generate_private_key, ECKey, etc.)",
      "2. Replace with ML-DSA-65 for signatures (NIST FIPS 204)",
      "3. Replace ECDH key exchange with ML-KEM-768",
      "4. Update certificate infrastructure to support PQC",
      "5. Use hybrid classical+PQC during transition period",
    ],
    safe_replacement_code: {
      python: `# ✅ QUANTUM-SAFE REPLACEMENT for ECC
# Using ML-DSA-65 (NIST FIPS 204) via liboqs-python
import oqs

def generate_mldsa_keypair():
    signer = oqs.Signature("ML-DSA-65")
    public_key = signer.generate_keypair()
    return signer, public_key

def sign_data(signer, message: bytes) -> bytes:
    signature = signer.sign(message)
    return signature

def verify_signature(public_key: bytes, message: bytes, signature: bytes) -> bool:
    with oqs.Signature("ML-DSA-65") as verifier:
        return verifier.verify(message, signature, public_key)`,
      javascript: `// ✅ QUANTUM-SAFE REPLACEMENT for ECC
// Using ML-DSA-65 via liboqs-node
const oqs = require('liboqs-node');

function generateMLDSAKeypair() {
  const sig = new oqs.Signature('ML-DSA-65');
  const publicKey = sig.generateKeypair();
  return { sig, publicKey };
}

function signData(sig, message) {
  return sig.sign(Buffer.from(message));
}

function verifySignature(publicKey, message, signature) {
  const verifier = new oqs.Signature('ML-DSA-65');
  return verifier.verify(Buffer.from(message), signature, publicKey);
}`,
    },
    complexity: "Medium",
    patterns: [
      /ec\.generate_private_key/i,
      /EC\.generate/i,
      /elliptic\.ec/i,
      /new\s+EC\s*\(/i,
      /EllipticCurve/i,
      /ECKey/i,
      /ec\.KeyPair/i,
      /secp256k1/i,
      /secp384r1/i,
      /secp521r1/i,
      /prime256v1/i,
      /\bP-256\b/i,
      /\bP-384\b/i,
      /\bP-521\b/i,
      /brainpoolP/i,
      /KeyPairGenerator\.getInstance\s*\(\s*['"]EC['"]/i,
      /ECGenParameterSpec/i,
    ],
  },

  ECDH: {
    severity: "HIGH",
    quantum_vulnerable: true,
    replacement: "ML-KEM-768 (NIST FIPS 203)",
    description: "ECDH (Elliptic Curve Diffie-Hellman) is used for secure key exchange. A quantum computer running Shor's algorithm can compute the shared secret from just the public keys alone — making any intercepted ECDH session retroactively decryptable.",
    why_quantum_risk: "An adversary can record ECDH-encrypted traffic today and decrypt it once a quantum computer is available ('Harvest Now, Decrypt Later'). Shor's algorithm recovers ECDH private keys from public keys in polynomial time.",
    migration_steps: [
      "1. Replace ECDH key exchange with ML-KEM-768 (Key Encapsulation)",
      "2. Update TLS configuration to use hybrid ECDH+ML-KEM",
      "3. Regenerate all session key derivation using PQC-derived shared secrets",
      "4. Update key derivation functions to use ML-KEM output",
    ],
    safe_replacement_code: {
      python: `# ✅ QUANTUM-SAFE REPLACEMENT for ECDH
# ML-KEM-768 replaces ECDH for key exchange (NIST FIPS 203)
import oqs

# Sender side: encapsulate a shared secret using recipient's public key
def kem_encapsulate(recipient_public_key: bytes):
    with oqs.KeyEncapsulation("ML-KEM-768") as kem:
        ciphertext, shared_secret = kem.encap_secret(recipient_public_key)
        return ciphertext, shared_secret

# Recipient side: decapsulate to recover the shared secret
def kem_decapsulate(kem_context, ciphertext: bytes) -> bytes:
    return kem_context.decap_secret(ciphertext)`,
      javascript: `// ✅ QUANTUM-SAFE REPLACEMENT for ECDH
// Using ML-KEM-768 via liboqs-node (NIST FIPS 203)
const oqs = require('liboqs-node');

// Recipient generates keypair
function generateRecipientKeypair() {
  const kem = new oqs.KeyEncapsulation('ML-KEM-768');
  const publicKey = kem.generateKeypair();
  return { kem, publicKey };
}

// Sender encapsulates shared secret
function senderEncapsulate(recipientPublicKey) {
  const kem = new oqs.KeyEncapsulation('ML-KEM-768');
  return kem.encapSecret(recipientPublicKey);
  // Returns { ciphertext, sharedSecret }
}`,
    },
    complexity: "Hard",
    patterns: [
      /\bECDH\b/i,
      /KeyAgreement\.getInstance\s*\(\s*['"]ECDH['"]/i,
      /crypto\.createECDH/i,
      /ecdh\.computeSecret/i,
      /ecdh\.generateKeys/i,
      /getSharedSecret.*ec/i,
      /X25519/i,
      /X448/i,
    ],
  },

  ECDSA: {
    severity: "HIGH",
    quantum_vulnerable: true,
    replacement: "ML-DSA-65 (NIST FIPS 204)",
    description: "ECDSA (Elliptic Curve Digital Signature Algorithm) is quantum-vulnerable because its security relies on the hardness of ECDLP. A quantum attacker can forge ECDSA signatures or recover private signing keys using Shor's algorithm.",
    why_quantum_risk: "Shor's algorithm breaks ECDSA by solving the elliptic curve discrete log problem — allowing an attacker to derive the private key from any signature and the corresponding public key.",
    migration_steps: [
      "1. Replace ECDSA with ML-DSA-65 (CRYSTALS-Dilithium) — NIST FIPS 204",
      "2. Update all JWT signing from ES256/ES384 to post-quantum alternatives",
      "3. Re-issue all certificates signed with ECDSA",
      "4. Update signature verification logic to use ML-DSA",
    ],
    safe_replacement_code: {
      python: `# ✅ QUANTUM-SAFE REPLACEMENT for ECDSA
# ML-DSA-65 (CRYSTALS-Dilithium) — NIST FIPS 204
import oqs

class QuantumSafeSigner:
    def __init__(self):
        self.signer = oqs.Signature("ML-DSA-65")
        self.public_key = self.signer.generate_keypair()
    
    def sign(self, message: bytes) -> bytes:
        return self.signer.sign(message)
    
    @staticmethod
    def verify(public_key: bytes, message: bytes, signature: bytes) -> bool:
        with oqs.Signature("ML-DSA-65") as v:
            return v.verify(message, signature, public_key)`,
    },
    complexity: "Medium",
    patterns: [
      /\bECDSA\b/i,
      /\bES256\b/,
      /\bES384\b/,
      /\bES512\b/,
      /SHA256withECDSA/i,
      /SHA384withECDSA/i,
      /SHA512withECDSA/i,
      /NONEwithECDSA/i,
      /Signature\.getInstance\s*\(\s*['"].*ECDSA/i,
      /createSign\s*\(\s*['"].*ecdsa/i,
      /ecdsa\.sign/i,
      /ecdsa\.verify/i,
      /ec\.sign\s*\(/i,
      /ec\.verify\s*\(/i,
    ],
  },

  DH: {
    severity: "HIGH",
    quantum_vulnerable: true,
    replacement: "ML-KEM-1024 (NIST FIPS 203)",
    description: "Diffie-Hellman key exchange relies on the hardness of the Discrete Logarithm Problem (DLP). Shor's algorithm solves DLP in polynomial time, allowing a quantum attacker to compute DH shared secrets from public values alone.",
    why_quantum_risk: "Shor's algorithm computes discrete logarithms in O((log p)³) time — making DH key exchange completely insecure against quantum computers regardless of key size.",
    safe_replacement_code: {
      python: `# ✅ QUANTUM-SAFE REPLACEMENT for Diffie-Hellman
# Use ML-KEM-1024 for high-security key exchange (NIST FIPS 203)
import oqs

def quantum_safe_key_exchange():
    # Recipient generates keypair
    kem = oqs.KeyEncapsulation("ML-KEM-1024")
    public_key = kem.generate_keypair()
    return kem, public_key`,
    },
    complexity: "Hard",
    patterns: [
      /DiffieHellman/i,
      /\bDHE\b/i,
      /dh\.generateKeys/i,
      /dh\.generate_parameters/i,
      /crypto\.createDiffieHellman/i,
      /KeyAgreement\.getInstance\s*\(\s*['"]DH['"]/i,
      /DHParameterSpec/i,
    ],
  },

  DES: {
    severity: "CRITICAL",
    quantum_vulnerable: false,
    replacement: "AES-256-GCM (NIST FIPS 197)",
    description: "DES uses a 56-bit key which can be brute-forced in seconds on modern hardware — even without quantum computers. 3DES is also deprecated by NIST (2023). This is a critical classical vulnerability that must be fixed immediately.",
    why_quantum_risk: "DES/3DES is already broken by classical brute-force attacks. Even without quantum computers, DES provides zero meaningful security. Grover's algorithm would further reduce its effective key size.",
    safe_replacement_code: {
      python: `# ✅ QUANTUM-SAFE REPLACEMENT for DES/3DES
# AES-256-GCM provides 256-bit security (128-bit quantum security)
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
import os

def encrypt(plaintext: bytes, key: bytes = None) -> tuple:
    if key is None:
        key = os.urandom(32)  # 256-bit key
    aesgcm = AESGCM(key)
    nonce = os.urandom(12)   # 96-bit nonce
    ciphertext = aesgcm.encrypt(nonce, plaintext, None)
    return key, nonce, ciphertext

def decrypt(key: bytes, nonce: bytes, ciphertext: bytes) -> bytes:
    aesgcm = AESGCM(key)
    return aesgcm.decrypt(nonce, ciphertext, None)`,
      javascript: `// ✅ QUANTUM-SAFE REPLACEMENT for DES/3DES
// AES-256-GCM — quantum-safe with 256-bit keys
const crypto = require('crypto');

function encrypt(plaintext, key = crypto.randomBytes(32)) {
  const nonce = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, nonce);
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();
  return { key, nonce, ciphertext, tag };
}

function decrypt({ key, nonce, ciphertext, tag }) {
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, nonce);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
}`,
    },
    complexity: "Easy",
    patterns: [
      /\bDES\.new/i,
      /\b3DES\b/i,
      /\bTripleDES\b/i,
      /\bDESede\b/i,
      /Cipher\.getInstance\s*\(\s*['"]DES/i,
      /des\.encrypt/i,
      /des\.decrypt/i,
      /createCipheriv\s*\(\s*['"]des/i,
      /createDecipheriv\s*\(\s*['"]des/i,
    ],
  },

  MD5: {
    severity: "MEDIUM",
    quantum_vulnerable: false,
    replacement: "SHA3-256 (NIST FIPS 202)",
    description: "MD5 produces a 128-bit hash that is cryptographically broken. Collision attacks (two different inputs producing the same hash) are computationally trivial on modern hardware. MD5 must never be used for security-sensitive operations.",
    why_quantum_risk: "MD5 is already classically broken. Grover's algorithm reduces its effective security from 128-bit to just 64-bit quantum security — making it completely unusable for any cryptographic purpose.",
    safe_replacement_code: {
      python: `# ✅ QUANTUM-SAFE REPLACEMENT for MD5
# SHA3-256 provides 128-bit quantum security (Grover-resistant)
import hashlib

def secure_hash(data: bytes) -> str:
    return hashlib.sha3_256(data).hexdigest()

def secure_hash_password(password: str, salt: bytes = None) -> tuple:
    import os
    if salt is None:
        salt = os.urandom(32)
    dk = hashlib.scrypt(password.encode(), salt=salt, n=2**14, r=8, p=1)
    return salt, dk.hex()`,
      javascript: `// ✅ QUANTUM-SAFE REPLACEMENT for MD5
// SHA3-256 — 128-bit quantum security
const crypto = require('crypto');

function secureHash(data) {
  return crypto.createHash('sha3-256').update(data).digest('hex');
}`,
    },
    complexity: "Easy",
    patterns: [
      /hashlib\.md5/i,
      /MD5\.new/i,
      /MessageDigest\.getInstance\s*\(\s*['"]MD5['"]/i,
      /crypto\.createHash\s*\(\s*['"]md5['"]/i,
      /\bmd5\s*\(/i,
      /require\s*\(\s*['"]md5['"]\s*\)/i,
    ],
  },

  SHA1: {
    severity: "MEDIUM",
    quantum_vulnerable: false,
    replacement: "SHA3-256 (NIST FIPS 202)",
    description: "SHA-1 produces a 160-bit hash that is cryptographically broken. The SHAttered attack (2017) demonstrated practical SHA-1 collision attacks. NIST deprecated SHA-1 for all digital signature uses in 2013 and fully disallowed it in 2030.",
    why_quantum_risk: "SHA-1 is classically broken by collision attacks. Grover's algorithm reduces its preimage resistance to 80-bit quantum security — far below the 128-bit minimum recommended by NIST for quantum resistance.",
    safe_replacement_code: {
      python: `# ✅ QUANTUM-SAFE REPLACEMENT for SHA-1
# SHA3-256 — NIST FIPS 202, 128-bit quantum security
import hashlib

def secure_hash(data: bytes) -> str:
    return hashlib.sha3_256(data).hexdigest()

def secure_hmac(key: bytes, message: bytes) -> bytes:
    import hmac
    return hmac.new(key, message, hashlib.sha3_256).digest()`,
    },
    complexity: "Easy",
    patterns: [
      /hashlib\.sha1/i,
      /SHA1\.new/i,
      /SHA\.new\s*\(/i,
      /MessageDigest\.getInstance\s*\(\s*['"]SHA-?1['"]/i,
      /crypto\.createHash\s*\(\s*['"]sha1['"]/i,
      /\bSHA-1\b/i,
      /HMAC.*SHA1/i,
    ],
  },

  SHA256: {
    severity: "LOW",
    quantum_vulnerable: false,
    replacement: "SHA3-256 preferred — SHA-256 acceptable for most uses",
    description: "SHA-256 is classically secure. However, Grover's algorithm reduces its quantum security from 256-bit to approximately 128-bit. For most applications this is acceptable, but SHA3-256 is preferred for new implementations.",
    why_quantum_risk: "Grover's algorithm provides a quadratic speedup for preimage attacks — effectively halving SHA-256's security from 256-bit to ~128-bit against quantum computers. Still acceptable per NIST guidelines for most use cases.",
    safe_replacement_code: {
      python: `# ✅ PREFERRED UPGRADE from SHA-256
# SHA3-256 provides stronger quantum resistance
import hashlib

# For most uses, SHA-256 remains acceptable:
sha256_hash = hashlib.sha256(data).hexdigest()

# Preferred: SHA3-256 for new implementations:
sha3_hash = hashlib.sha3_256(data).hexdigest()`,
    },
    complexity: "Easy",
    patterns: [
      /hashlib\.sha256/i,
      /SHA256\.new/i,
      /MessageDigest\.getInstance\s*\(\s*['"]SHA-?256['"]/i,
      /crypto\.createHash\s*\(\s*['"]sha256['"]/i,
      /\bHS256\b/,
      /\bSHA-256\b/i,
    ],
  },

  SHA512: {
    severity: "LOW",
    quantum_vulnerable: false,
    replacement: "SHA3-512 preferred — SHA-512 has acceptable quantum security",
    description: "SHA-512 has 256-bit quantum security via Grover's algorithm — meeting NIST's minimum quantum resistance requirements. It is generally safe to use, but SHA3-512 is recommended for new implementations.",
    why_quantum_risk: "Grover's algorithm reduces SHA-512's effective security to ~256-bit against quantum computers. This meets NIST's recommended quantum security threshold and is considered safe.",
    safe_replacement_code: {
      python: `# ✅ PREFERRED UPGRADE from SHA-512
# SHA3-512 for new implementations (same security, better design)
import hashlib

# SHA-512 is acceptable (256-bit quantum security):
sha512_hash = hashlib.sha512(data).hexdigest()

# Preferred for new code — SHA3-512:
sha3_512_hash = hashlib.sha3_512(data).hexdigest()`,
    },
    complexity: "Easy",
    patterns: [
      /hashlib\.sha512/i,
      /SHA512\.new/i,
      /MessageDigest\.getInstance\s*\(\s*['"]SHA-?512['"]/i,
      /crypto\.createHash\s*\(\s*['"]sha512['"]/i,
      /\bHS512\b/,
      /\bSHA-512\b/i,
    ],
  },

  AES: {
    severity: "LOW",
    quantum_vulnerable: false,
    replacement: "Keep AES-256-GCM — ensure 256-bit key size",
    description: "AES-256 is quantum-safe with approximately 128-bit quantum security. AES-128, however, has only 64-bit quantum security via Grover's algorithm — which falls below NIST's recommended minimum. Always use AES-256 with GCM mode.",
    why_quantum_risk: "Grover's algorithm provides a quadratic speedup for brute-force key search. AES-128 drops to 64-bit quantum security (borderline unsafe). AES-256 drops to 128-bit (safe). Always prefer AES-256-GCM.",
    safe_replacement_code: {
      python: `# ✅ QUANTUM-SAFE AES USAGE
# Use AES-256-GCM (NOT AES-128) — 128-bit quantum security
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
import os

key = os.urandom(32)   # ✅ 256-bit key (NOT 16 bytes/128-bit)
nonce = os.urandom(12) # 96-bit nonce for GCM

aesgcm = AESGCM(key)
ciphertext = aesgcm.encrypt(nonce, plaintext, aad)
decrypted  = aesgcm.decrypt(nonce, ciphertext, aad)`,
    },
    complexity: "Easy",
    patterns: [
      /AES\.new/i,
      /Cipher\.getInstance\s*\(\s*['"]AES/i,
      /createCipheriv\s*\(\s*['"]aes-128/i,
      /createDecipheriv\s*\(\s*['"]aes-128/i,
      /\bAES-128\b/i,
      /\baes-128\b/i,
      /AES_128/i,
    ],
  },

  TLS: {
    severity: "HIGH",
    quantum_vulnerable: true,
    replacement: "TLS 1.3 with ML-KEM hybrid key exchange",
    description: "Legacy TLS cipher suites using RSA or ECDH for key exchange are quantum-vulnerable. Any TLS session recorded today can be decrypted in the future when quantum computers become available — the 'Harvest Now, Decrypt Later' threat.",
    why_quantum_risk: "TLS handshakes using RSA or ECDH key exchange are retroactively vulnerable. An adversary recording your TLS traffic today can wait for a quantum computer and then decrypt all historical sessions — exposing credentials, API keys, and sensitive data.",
    safe_replacement_code: {
      python: `# ✅ QUANTUM-SAFE TLS CONFIGURATION
# Use TLS 1.3 with post-quantum hybrid key exchange
import ssl

context = ssl.SSLContext(ssl.PROTOCOL_TLS_CLIENT)
context.minimum_version = ssl.TLSVersion.TLSv1_3
# Enable hybrid PQC cipher suites (requires OQS-OpenSSL):
# TLS_AES_256_GCM_SHA384 with X25519Kyber768Draft00
context.set_ciphers('TLS_AES_256_GCM_SHA384')
context.load_cert_chain('cert.pem', 'key.pem')`,
    },
    complexity: "Hard",
    patterns: [
      /TLS_RSA_WITH/i,
      /TLS_ECDH_WITH/i,
      /TLS_DHE_RSA/i,
      /TLS_ECDHE_RSA/i,
      /TLS_ECDHE_ECDSA/i,
      /ssl\.PROTOCOL_TLSv1(?!\.3)/i,
      /ssl\.PROTOCOL_SSLv/i,
      /\bSSLv2\b/i,
      /\bSSLv3\b/i,
      /\bTLSv1\.0\b/i,
      /\bTLSv1\.1\b/i,
      /cipher.*ECDHE-RSA/i,
      /cipher.*DHE-RSA/i,
      /'TLSv1'/i,
      /"TLSv1"/i,
    ],
  },

  OPENSSL: {
    severity: "HIGH",
    quantum_vulnerable: true,
    replacement: "OpenSSL 3.x + OQS Provider for post-quantum cipher suites",
    description: "Standard OpenSSL uses classical algorithms (RSA, ECDSA, ECDH) for all key operations. Without the Open Quantum Safe (OQS) provider, OpenSSL provides zero post-quantum protection.",
    why_quantum_risk: "OpenSSL's default algorithms (RSA, EC, DH) are all quantum-vulnerable. Any certificates, TLS connections, or key operations using standard OpenSSL are susceptible to Harvest Now, Decrypt Later attacks.",
    safe_replacement_code: {
      python: `# ✅ QUANTUM-SAFE OPENSSL USAGE
# Install: pip install oqs-python
# Requires: liboqs + OQS-OpenSSL provider
import oqs

# Generate a quantum-safe keypair for TLS
sig = oqs.Signature("ML-DSA-65")
pub_key = sig.generate_keypair()

# For OpenSSL integration, use OQS provider:
# openssl req -x509 -newkey ML-DSA-65 -keyout key.pem -out cert.pem
# See: https://github.com/open-quantum-safe/oqs-provider`,
    },
    complexity: "Hard",
    patterns: [
      /openssl\s+genrsa/i,
      /openssl\s+ecparam/i,
      /openssl\s+req.*-newkey\s+rsa/i,
      /from\s+OpenSSL/i,
      /import\s+OpenSSL/i,
      /OpenSSL\.crypto/i,
      /OpenSSL\.SSL/i,
      /SSL\.Context/i,
      /pyOpenSSL/i,
    ],
  },

  ML_KEM: {
    severity: "SAFE",
    quantum_vulnerable: false,
    replacement: "Already quantum-safe ✓",
    description: "ML-KEM (Module Lattice Key Encapsulation Mechanism) is standardized in NIST FIPS 203. Based on the hardness of the Module Learning With Errors (MLWE) problem — which has no known quantum speedup.",
    why_quantum_risk: "NOT quantum-vulnerable. ML-KEM is resistant to both classical and quantum attacks. No known polynomial-time quantum algorithm can break lattice-based cryptography.",
    complexity: "None",
    patterns: [
      /\bML-KEM\b/i,
      /\bMLKEM\b/i,
      /\bkyber\b/i,
      /Kyber512/i,
      /Kyber768/i,
      /Kyber1024/i,
      /FIPS.?203/i,
      /oqs\.KEM/i,
      /ML_KEM/i,
      /KeyEncapsulation.*ML/i,
    ],
  },

  ML_DSA: {
    severity: "SAFE",
    quantum_vulnerable: false,
    replacement: "Already quantum-safe ✓",
    description: "ML-DSA (Module Lattice Digital Signature Algorithm, CRYSTALS-Dilithium) is standardized in NIST FIPS 204. Its security relies on the hardness of MLWE and Short Integer Solution (SIS) problems — resistant to quantum computers.",
    why_quantum_risk: "NOT quantum-vulnerable. ML-DSA is quantum-resistant. No known quantum algorithm provides a significant speedup against lattice-based problems like MLWE.",
    complexity: "None",
    patterns: [
      /\bML-DSA\b/i,
      /\bMLDSA\b/i,
      /\bdilithium\b/i,
      /Dilithium2/i,
      /Dilithium3/i,
      /Dilithium5/i,
      /FIPS.?204/i,
      /oqs\.Signature/i,
      /ML_DSA/i,
    ],
  },

  HYBRID: {
    severity: "SAFE",
    quantum_vulnerable: false,
    replacement: "Good practice — hybrid PQC mode detected ✓",
    description: "Hybrid classical+PQC usage detected. This is the recommended migration strategy per NIST, BSI, and ANSSI guidelines. It provides security against both classical and quantum attackers during the transition period.",
    why_quantum_risk: "NOT quantum-vulnerable. Hybrid mode is the gold standard migration approach — combining classical algorithms (for backward compatibility) with PQC algorithms (for quantum resistance).",
    complexity: "None",
    patterns: [
      /hybrid.*kyber/i,
      /hybrid.*mlkem/i,
      /hybrid.*dilithium/i,
      /X25519Kyber768/i,
      /p256_kyber512/i,
      /HybridKEM/i,
      /CombinedKEM/i,
      /classical.*pqc/i,
    ],
  },

};

const localScan = (code, fileName) => {
  const findings = [];
  const lines = code.split("\n");

  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (
      trimmed.startsWith("//") ||
      trimmed.startsWith("#") ||
      trimmed.startsWith("*") ||
      trimmed.startsWith("/*") ||
      trimmed === ""
    ) return;

    Object.entries(CRYPTO_PATTERNS).forEach(([algo, config]) => {
      config.patterns.forEach((pattern) => {
        if (pattern.test(line)) {
          const alreadyFound = findings.some(
            f => f.line === idx + 1 && f.algorithm === algo
          );
          if (!alreadyFound) {
            // Detect language from file extension or code content
            const ext = (fileName || "").split(".").pop().toLowerCase();
            const lang = 
              ext === "js" || ext === "ts" ? "javascript" :
              ext === "java" ? "java" :
              ext === "go" ? "go" :
              ext === "py" ? "python" : "python";

            // Pick best available replacement code for detected language
            const replacementCode =
              config.safe_replacement_code?.[lang] ||
              config.safe_replacement_code?.["python"] ||
              `# Use ${config.replacement} instead`;

            findings.push({
              file: fileName || "pasted_code",
              line: idx + 1,
              code_snippet: line.trim(),
              algorithm: algo.replace(/_/g, "-"),
              severity: config.severity,
              quantum_vulnerable: config.quantum_vulnerable,
              description: config.description,
              why_quantum_risk: config.why_quantum_risk,
              replacement: config.replacement,
              replacement_code: replacementCode,
              migration_steps: config.migration_steps || [],
              complexity: config.complexity,
            });
          }
        }
      });
    });
  });

  // Risk scoring
  const severityWeights = { CRITICAL: 25, HIGH: 15, MEDIUM: 8, LOW: 2, SAFE: 0 };
  const nonSafe = findings.filter(f => f.severity !== "SAFE");
  const safeFindings = findings.filter(f => f.severity === "SAFE");
  const totalDeduction = nonSafe.reduce((sum, f) => sum + (severityWeights[f.severity] || 0), 0);
  const score = Math.max(0, 100 - totalDeduction);
  const level = score >= 90 ? "SAFE" : score >= 70 ? "LOW" : score >= 50 ? "MEDIUM" : score >= 30 ? "HIGH" : "CRITICAL";
  const quantumCount = findings.filter(f => f.quantum_vulnerable).length;

  const algoSummary = {};
  findings.forEach(f => {
    if (!algoSummary[f.algorithm]) algoSummary[f.algorithm] = { count: 0, severity: f.severity };
    algoSummary[f.algorithm].count++;
  });

  return {
    findings,
    safeFindings,
    nonSafeFindings: nonSafe,
    risk: {
      score,
      level,
      quantum_exposure: Math.min(100, quantumCount * 20),
      total_findings: findings.length,
      critical_count: findings.filter(f => f.severity === "CRITICAL").length,
      high_count: findings.filter(f => f.severity === "HIGH").length,
      medium_count: findings.filter(f => f.severity === "MEDIUM").length,
      low_count: findings.filter(f => f.severity === "LOW").length,
      safe_count: safeFindings.length,
      quantum_vulnerable_count: quantumCount,
      algo_summary: algoSummary,
      summary: `${nonSafe.length} vulnerabilities found. Quantum exposure: ${Math.min(100, quantumCount * 20)}%.`,
    },
    total: findings.length,
    mode: "local",
  };
};

const Scanner = () => {
  const { updateScanContext } = useAIAssistant();
  const [code, setCode] = useState('// Paste your Python or JS code here to scan for cryptographic vulnerabilities...\n\nfrom Crypto.PublicKey import RSA\n\ndef generate_key():\n    key = RSA.generate(2048)\n    return key\n');
  const [isScanning, setIsScanning] = useState(false);
  const [results, setResults] = useState(null);
  const [selectedFinding, setSelectedFinding] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState(null);
  const [backendMode, setBackendMode] = useState("checking"); // checking, online, offline
  const [expandedCard, setExpandedCard] = useState(null);
  const [copiedIdx, setCopiedIdx] = useState(null);
  const [copiedReplacementIdx, setCopiedReplacementIdx] = useState(null);
  const [activeReplacementTab, setActiveReplacementTab] = useState(0);

  const copyCode = (code, idx) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 2500);
    });
  };

  const copyReplacementCode = (code, idx) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedReplacementIdx(idx);
      setTimeout(() => setCopiedReplacementIdx(null), 2500);
    });
  };

  const severityConfig = {
    CRITICAL: { bg: "rgba(255,68,68,0.08)",  border: "#ff4444", text: "#ff4444",  label: "CRITICAL" },
    HIGH:     { bg: "rgba(255,170,0,0.08)",  border: "#ffaa00", text: "#ffaa00",  label: "HIGH"     },
    MEDIUM:   { bg: "rgba(0,212,255,0.08)",  border: "#00d4ff", text: "#00d4ff",  label: "MEDIUM"   },
    LOW:      { bg: "rgba(168,85,247,0.08)", border: "#a855f7", text: "#a855f7",  label: "LOW"      },
    SAFE:     { bg: "rgba(0,255,136,0.08)",  border: "#00ff88", text: "#00ff88",  label: "SAFE ✓"   },
  };

  useEffect(() => {
    // Check backend status
    axios.get(`${API_BASE_URL}/api/dashboard/stats`, { timeout: 2000 })
      .then(() => setBackendMode("online"))
      .catch(() => setBackendMode("offline"));

  }, []);

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) readFile(file);
  };
  const handleFileInput = (e) => {
    const file = e.target.files[0];
    if (file) readFile(file);
  };
  const readFile = (file) => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      setCode(e.target.result);
      toast.success(`File ${file.name} loaded successfully.`);
    };
    reader.readAsText(file);
  };

  const runScan = async () => {
    if (!code.trim()) {
      toast.error("Please paste some code or upload a file first.");
      return;
    }
    setIsScanning(true);
    setResults(null);
    setSelectedFinding(null);


    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(`${API_BASE_URL}/api/scan/code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, filename: fileName || "pasted_code.py" }),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      
      if (response.ok) {
        const data = await response.json();
        // Normalize backend response to match local scan shape
        // so the results panel renders correctly in both modes
        const nonSafe = (data.findings || []).filter(f => f.severity !== "SAFE");
        const safe    = (data.findings || []).filter(f => f.severity === "SAFE");
        const normalized = {
          ...data,
          mode: "backend",
          nonSafeFindings: nonSafe,
          safeFindings: safe,
        };
        setResults(normalized);
        if (nonSafe.length > 0) setSelectedFinding(nonSafe[0]);
        else if (data.findings.length > 0) setSelectedFinding(data.findings[0]);
        setActiveReplacementTab(0);
        setCopiedReplacementIdx(null);
        // Give the AI assistant real scan data for context-aware responses
        updateScanContext(normalized);
        toast.success('Code scanned via backend!');
      } else {
        throw new Error("Backend error");
      }
    } catch (err) {
      console.log("Backend unavailable, running local scan...");
      await new Promise(r => setTimeout(r, 1500));
      const localResults = localScan(code, fileName);
      setResults(localResults);
      if(localResults.findings.length > 0) setSelectedFinding(localResults.findings[0]);
      setActiveReplacementTab(0);
      setCopiedReplacementIdx(null);
      setBackendMode("offline");
      // Give the AI assistant local scan data too
      updateScanContext({ ...localResults, filename: fileName || "pasted_code" });
      toast.success('Scan completed locally.');
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-8 max-w-7xl mx-auto flex flex-col gap-8 animate-[fadeIn_0.3s_ease-out]">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold font-sans">Crypto <span className="text-primary">Scanner</span></h1>
          <p className="text-gray-400 mt-2">Detect vulnerable algorithms and get PQC migration paths.</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-sm bg-black/40 px-3 py-1 rounded-full border border-gray-800">
          {backendMode === "online" ? (
            <><div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-glow" /><span className="text-primary">Backend Online</span></>
          ) : backendMode === "offline" ? (
            <><div className="w-2 h-2 rounded-full bg-warning animate-pulse shadow-glow-warning" /><span className="text-warning">Offline Mode — Local Analysis</span></>
          ) : (
             <><div className="w-2 h-2 rounded-full bg-gray-500 animate-pulse" /><span className="text-gray-400">Checking...</span></>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload and Editor Panel */}
        <div className="glass-card flex flex-col overflow-hidden h-[600px] p-4">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById('fileInput').click()}
            style={{
              border: isDragging ? "2px solid #00ff88" : "2px dashed rgba(0,255,136,0.3)",
              background: isDragging ? "rgba(0,255,136,0.05)" : "transparent",
              boxShadow: isDragging ? "0 0 20px rgba(0,255,136,0.3)" : "none",
              transition: "all 0.2s ease",
              borderRadius: "8px",
              padding: "24px",
              textAlign: "center",
              cursor: "pointer",
              marginBottom: "16px",
            }}
          >
            <div style={{ color: isDragging ? "#00ff88" : "rgba(255,255,255,0.4)", fontSize: "14px" }}>
              {fileName
                ? <span style={{ color: "#00ff88", fontWeight: "bold" }}>📄 {fileName} loaded — edit below or drop another file</span>
                : <>
                    <div style={{ fontSize: "32px", marginBottom: "8px" }}>📂</div>
                    <div>Drag & drop your file here, or <span style={{ color: "#00ff88", textDecoration: "underline" }}>click to browse</span></div>
                    <div style={{ color: "rgba(255,255,255,0.3)", fontSize: "12px", marginTop: "6px" }}>
                      Supports: .py .js .ts .java .go .c .cpp .pem .yaml .json .conf
                    </div>
                  </>
              }
            </div>
            <input id="fileInput" type="file" accept=".py,.js,.ts,.java,.go,.c,.cpp,.pem,.yaml,.json,.conf" onChange={handleFileInput} style={{ display: "none" }} />
          </div>

          <div className="flex-grow border border-gray-800 rounded-lg overflow-hidden">
            <Editor
              height="100%"
              theme="vs-dark"
              language="python"
              value={code}
              onChange={(value) => setCode(value)}
              options={{ minimap: { enabled: false }, fontSize: 14 }}
            />
          </div>
          <div className="mt-4 flex justify-end">
            <GlowButton variant="primary" onClick={runScan} disabled={isScanning} className="w-full sm:w-auto">
              {isScanning ? 'Scanning...' : 'Run Quantum Scan \u2192'}
            </GlowButton>
          </div>
        </div>

        {/* Scan Results Panel */}
        <div className="glass-card p-6 h-[600px] flex flex-col overflow-hidden">
          {isScanning && (
            <div className="h-full flex flex-col items-center justify-center">
              <div className="w-16 h-16 border-4 border-t-primary border-r-transparent border-b-secondary border-l-transparent rounded-full animate-spin"></div>
              <p className="mt-6 text-primary font-mono animate-pulse tracking-wide">Analyzing cryptographic signatures...</p>
            </div>
          )}
          
          {!isScanning && !results && (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 font-mono text-center opacity-50">
              <span className="text-4xl mb-4 text-gray-600">🛡️</span>
              Awaiting payload for analysis.<br/>Run scan to view results.
            </div>
          )}

          {!isScanning && results && (
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-800">
                <div className="flex items-center gap-4">
                   <div className={`w-14 h-14 rounded-full flex items-center justify-center border-4 shadow-lg ${results.risk.level === 'CRITICAL' || results.risk.level === 'HIGH' ? 'border-danger text-danger shadow-glow-danger' : 'border-primary text-primary shadow-glow'}`}>
                     <span className="text-xl font-bold">{results.risk.score}</span>
                   </div>
                   <div>
                     <h2 className="text-xl font-bold text-white">Scan Complete</h2>
                     <p className="text-sm text-gray-400">Risk Level: <span className={results.risk.level === 'CRITICAL' ? 'text-danger' : 'text-primary'}>{results.risk.level}</span></p>
                   </div>
                </div>
                {results.mode === 'local' && <span className="text-xs px-2 py-1 bg-warning/20 text-warning rounded-full border border-warning">⚡ Local Mode</span>}
              </div>
              
              <div className="flex-grow overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                {results.findings.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <span className="text-6xl mb-4">🎉</span>
                    <h3 className="text-2xl font-bold text-primary mb-2">Quantum-Safe</h3>
                    <p className="text-gray-400">No vulnerable cryptographic patterns detected in this module.</p>
                  </div>
                ) : (
                  <>
                    {/* Render vulnerability findings: */}
                    {results?.nonSafeFindings?.map((finding, idx) => {
                      const sc = severityConfig[finding.severity] || severityConfig.MEDIUM;
                      const isExpanded = expandedCard === idx;

                      return (
                        <div
                          key={idx}
                          style={{
                            background: "#0a0a0f",
                            border: `1px solid ${sc.border}44`,
                            borderLeft: `3px solid ${sc.border}`,
                            borderRadius: "10px",
                            marginBottom: "12px",
                            overflow: "hidden",
                            transition: "box-shadow 0.2s ease",
                            boxShadow: isExpanded ? `0 0 20px ${sc.border}22` : "none",
                          }}
                        >
                          {/* Card Header — always visible */}
                          <div
                            onClick={() => setExpandedCard(isExpanded ? null : idx)}
                            style={{
                              padding: "14px 16px",
                              cursor: "pointer",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "flex-start",
                              gap: "12px",
                            }}
                          >
                            <div style={{ flex: 1, minWidth: 0 }}>
                              {/* Top row: severity badge + algorithm + line */}
                              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", flexWrap: "wrap" }}>
                                <span style={{
                                  background: sc.bg,
                                  border: `1px solid ${sc.border}`,
                                  color: sc.text,
                                  padding: "2px 9px",
                                  borderRadius: "4px",
                                  fontSize: "10px",
                                  fontWeight: "800",
                                  letterSpacing: "1px",
                                  flexShrink: 0,
                                }}>
                                  {sc.label}
                                </span>
                                <span style={{ color: "#fff", fontWeight: "700", fontSize: "14px" }}>
                                  {finding.algorithm} Found
                                </span>
                                {finding.quantum_vulnerable && (
                                  <span style={{
                                    background: "rgba(255,68,68,0.1)",
                                    border: "1px solid rgba(255,68,68,0.3)",
                                    color: "#ff8888",
                                    fontSize: "9px", padding: "1px 7px",
                                    borderRadius: "3px", fontWeight: "600",
                                    letterSpacing: "0.5px",
                                  }}>
                                    ⚛ QUANTUM VULNERABLE
                                  </span>
                                )}
                                <span style={{
                                  marginLeft: "auto",
                                  color: "rgba(255,255,255,0.3)",
                                  fontSize: "11px",
                                  fontFamily: "monospace",
                                  flexShrink: 0,
                                }}>
                                  Line {finding.line}
                                </span>
                              </div>

                              {/* Code snippet */}
                              <div style={{
                                fontFamily: "'JetBrains Mono', monospace",
                                fontSize: "12px",
                                color: "#ff8888",
                                background: "rgba(255,68,68,0.05)",
                                border: "1px solid rgba(255,68,68,0.15)",
                                borderRadius: "5px",
                                padding: "8px 10px",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}>
                                {finding.code_snippet}
                              </div>
                            </div>

                            {/* Expand chevron */}
                            <div style={{
                              color: "rgba(255,255,255,0.3)",
                              fontSize: "16px",
                              transition: "transform 0.2s ease",
                              transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                              flexShrink: 0,
                              marginTop: "2px",
                            }}>
                              ▼
                            </div>
                          </div>

                          {/* Expanded content */}
                          {isExpanded && (
                            <div style={{ borderTop: `1px solid ${sc.border}22` }}>

                              {/* WHY IS THIS RISKY section */}
                              <div style={{ padding: "16px", background: "rgba(255,68,68,0.03)" }}>
                                <div style={{
                                  color: "#ff8888",
                                  fontSize: "10px",
                                  fontWeight: "800",
                                  letterSpacing: "1.5px",
                                  marginBottom: "8px",
                                }}>
                                  ⚠ WHY THIS IS A QUANTUM RISK
                                </div>
                                <p style={{
                                  color: "rgba(255,255,255,0.7)",
                                  fontSize: "13px",
                                  lineHeight: "1.65",
                                  margin: "0 0 8px 0",
                                }}>
                                  {finding.description}
                                </p>
                                <div style={{
                                  background: "rgba(255,100,100,0.06)",
                                  border: "1px solid rgba(255,100,100,0.2)",
                                  borderRadius: "6px",
                                  padding: "10px 12px",
                                  fontSize: "12px",
                                  color: "rgba(255,180,180,0.85)",
                                  lineHeight: "1.5",
                                }}>
                                  <strong style={{ color: "#ff8888" }}>Quantum Attack Vector: </strong>
                                  {finding.why_quantum_risk}
                                </div>
                              </div>

                              {/* Migration complexity + replacement label */}
                              <div style={{
                                padding: "10px 16px",
                                display: "flex", gap: "8px", flexWrap: "wrap",
                                borderTop: `1px solid rgba(255,255,255,0.05)`,
                              }}>
                                <span style={{
                                  background: "rgba(0,255,136,0.07)",
                                  border: "1px solid rgba(0,255,136,0.2)",
                                  color: "#00ff88",
                                  fontSize: "11px", padding: "3px 10px",
                                  borderRadius: "4px", fontWeight: "600",
                                }}>
                                  → Replace with: {finding.replacement}
                                </span>
                                {finding.complexity !== "None" && (
                                  <span style={{
                                    background: "rgba(255,255,255,0.05)",
                                    border: "1px solid rgba(255,255,255,0.1)",
                                    color: "rgba(255,255,255,0.5)",
                                    fontSize: "11px", padding: "3px 10px",
                                    borderRadius: "4px",
                                  }}>
                                    Migration Effort: {finding.complexity}
                                  </span>
                                )}
                              </div>

                              {/* Migration steps */}
                              {finding.migration_steps && finding.migration_steps.length > 0 && (
                                <div style={{ padding: "0 16px 14px" }}>
                                  <div style={{ color: "rgba(255,255,255,0.3)", fontSize: "10px", letterSpacing: "1px", marginBottom: "8px" }}>
                                    MIGRATION STEPS
                                  </div>
                                  {finding.migration_steps.map((step, si) => (
                                    <div key={si} style={{
                                      display: "flex", gap: "8px", alignItems: "flex-start",
                                      marginBottom: "5px",
                                    }}>
                                      <span style={{ color: "#00ff88", fontSize: "11px", flexShrink: 0 }}>▸</span>
                                      <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "12px" }}>{step}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* SAFE ALGORITHMS SECTION — shown separately below vulnerabilities */}
                    {results?.safeFindings?.length > 0 && (
                      <div style={{ marginTop: "20px" }}>
                        <div style={{
                          color: "#00ff88",
                          fontSize: "12px",
                          fontWeight: "700",
                          letterSpacing: "1px",
                          marginBottom: "10px",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}>
                          <span style={{
                            width: "8px", height: "8px", borderRadius: "50%",
                            background: "#00ff88", boxShadow: "0 0 8px #00ff88",
                            display: "inline-block",
                          }} />
                          QUANTUM-SAFE ALGORITHMS DETECTED ✓
                        </div>
                        {results.safeFindings.map((finding, idx) => (
                          <div key={idx} style={{
                            background: "rgba(0,255,136,0.03)",
                            border: "1px solid rgba(0,255,136,0.15)",
                            borderLeft: "3px solid #00ff88",
                            borderRadius: "8px",
                            padding: "12px 14px",
                            marginBottom: "8px",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: "12px",
                          }}>
                            <div>
                              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                                <span style={{
                                  background: "rgba(0,255,136,0.12)",
                                  border: "1px solid rgba(0,255,136,0.3)",
                                  color: "#00ff88",
                                  padding: "2px 8px", borderRadius: "4px",
                                  fontSize: "10px", fontWeight: "800",
                                }}>
                                  SAFE ✓
                                </span>
                                <span style={{ color: "#fff", fontWeight: "700", fontSize: "13px" }}>
                                  {finding.algorithm}
                                </span>
                                <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "11px", fontFamily: "monospace" }}>
                                  Line {finding.line}
                                </span>
                              </div>
                              <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "12px" }}>
                                {finding.description}
                              </div>
                            </div>
                            <span style={{ color: "#00ff88", fontSize: "20px", flexShrink: 0 }}>🛡️</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Generated Replacements Panel */}
      {results && results.nonSafeFindings && results.nonSafeFindings.length > 0 && (
        <div style={{
          marginTop: "32px",
          background: "#0a0a0f",
          border: "1px solid rgba(0,255,136,0.25)",
          borderTop: "3px solid #00ff88",
          borderRadius: "12px",
          overflow: "hidden",
        }}>

          {/* Panel Header */}
          <div style={{
            padding: "20px 24px 16px",
            background: "rgba(0,255,136,0.04)",
            borderBottom: "1px solid rgba(0,255,136,0.1)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
          }}>
            <div>
              <h3 style={{
                color: "#fff",
                fontSize: "18px",
                fontWeight: "800",
                margin: "0 0 4px 0",
              }}>
                ✅ Quantum-Safe{" "}
                <span style={{ color: "#00ff88" }}>Replacement Code</span>
              </h3>
              <p style={{
                color: "rgba(255,255,255,0.4)",
                fontSize: "12px",
                margin: 0,
              }}>
                Auto-generated replacements for all{" "}
                {results.nonSafeFindings.length} vulnerable algorithms found in your
                scan. Copy and use directly in your codebase.
              </p>
            </div>

            {/* Copy All button */}
            <button
              onClick={() => {
                const allCode = results.nonSafeFindings
                  .map(
                    (f, i) =>
                      `${"─".repeat(60)}\n` +
                      `// [${i + 1}] ${f.algorithm} → ${f.replacement}\n` +
                      `// File: ${f.file} | Line: ${f.line}\n` +
                      `// Vulnerable code: ${f.code_snippet}\n` +
                      `${"─".repeat(60)}\n\n` +
                      f.replacement_code +
                      "\n\n"
                  )
                  .join("\n");
                navigator.clipboard.writeText(allCode).then(() => {
                  setCopiedReplacementIdx("all");
                  setTimeout(() => setCopiedReplacementIdx(null), 2500);
                });
              }}
              style={{
                background:
                  copiedReplacementIdx === "all"
                    ? "#00ff88"
                    : "rgba(0,255,136,0.1)",
                border: `1px solid ${
                  copiedReplacementIdx === "all"
                    ? "#00ff88"
                    : "rgba(0,255,136,0.3)"
                }`,
                color: copiedReplacementIdx === "all" ? "#000" : "#00ff88",
                borderRadius: "8px",
                padding: "9px 18px",
                fontSize: "12px",
                fontWeight: "700",
                cursor: "pointer",
                transition: "all 0.2s ease",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                whiteSpace: "nowrap",
              }}
            >
              {copiedReplacementIdx === "all"
                ? "✓ All Copied!"
                : "📋 Copy All Replacements"}
            </button>
          </div>

          {/* Tab row — one tab per vulnerable finding */}
          <div style={{
            display: "flex",
            overflowX: "auto",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            scrollbarWidth: "none",
            background: "rgba(0,0,0,0.2)",
          }}>
            {results.nonSafeFindings.map((finding, idx) => {
              const tabColors = {
                CRITICAL: "#ff4444",
                HIGH: "#ffaa00",
                MEDIUM: "#00d4ff",
                LOW: "#a855f7",
              };
              const tabColor = tabColors[finding.severity] || "#00d4ff";
              const isActive = activeReplacementTab === idx;

              return (
                <button
                  key={idx}
                  onClick={() => setActiveReplacementTab(idx)}
                  style={{
                    background: isActive
                      ? "rgba(0,255,136,0.07)"
                      : "transparent",
                    border: "none",
                    borderBottom: isActive
                      ? "2px solid #00ff88"
                      : "2px solid transparent",
                    color: isActive ? "#fff" : "rgba(255,255,255,0.4)",
                    padding: "12px 18px",
                    fontSize: "12px",
                    fontWeight: isActive ? "700" : "400",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    transition: "all 0.2s ease",
                    display: "flex",
                    alignItems: "center",
                    gap: "7px",
                    flexShrink: 0,
                  }}
                >
                  {/* Severity dot */}
                  <span style={{
                    width: "7px",
                    height: "7px",
                    borderRadius: "50%",
                    background: tabColor,
                    boxShadow: isActive ? `0 0 6px ${tabColor}` : "none",
                    flexShrink: 0,
                  }} />
                  {finding.algorithm}
                  <span style={{
                    background: isActive
                      ? `${tabColor}22`
                      : "rgba(255,255,255,0.05)",
                    border: `1px solid ${isActive ? tabColor + "44" : "rgba(255,255,255,0.1)"}`,
                    color: isActive ? tabColor : "rgba(255,255,255,0.3)",
                    borderRadius: "3px",
                    padding: "0px 5px",
                    fontSize: "9px",
                    fontWeight: "700",
                  }}>
                    L{finding.line}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active tab content */}
          {results.nonSafeFindings[activeReplacementTab] && (() => {
            const finding = results.nonSafeFindings[activeReplacementTab];
            const sc = {
              CRITICAL: { color: "#ff4444", bg: "rgba(255,68,68,0.08)" },
              HIGH:     { color: "#ffaa00", bg: "rgba(255,170,0,0.08)" },
              MEDIUM:   { color: "#00d4ff", bg: "rgba(0,212,255,0.08)" },
              LOW:      { color: "#a855f7", bg: "rgba(168,85,247,0.08)" },
            }[finding.severity] || { color: "#00d4ff", bg: "rgba(0,212,255,0.08)" };

            return (
              <div>

                {/* Finding context bar */}
                <div style={{
                  padding: "14px 24px",
                  background: sc.bg,
                  borderBottom: "1px solid rgba(255,255,255,0.05)",
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "16px",
                  alignItems: "center",
                }}>
                  {/* Vulnerable snippet */}
                  <div style={{ flex: 1, minWidth: "200px" }}>
                    <div style={{
                      color: "rgba(255,255,255,0.35)",
                      fontSize: "9px",
                      letterSpacing: "1.5px",
                      marginBottom: "5px",
                    }}>
                      VULNERABLE CODE — {finding.file} : Line {finding.line}
                    </div>
                    <div style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: "12px",
                      color: "#ff8888",
                      background: "rgba(255,0,0,0.06)",
                      border: "1px solid rgba(255,68,68,0.2)",
                      borderRadius: "5px",
                      padding: "7px 10px",
                      display: "inline-block",
                      maxWidth: "100%",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}>
                      ❌ {finding.code_snippet}
                    </div>
                  </div>

                  {/* Arrow */}
                  <div style={{
                    color: "#00ff88",
                    fontSize: "20px",
                    fontWeight: "900",
                    flexShrink: 0,
                  }}>
                    →
                  </div>

                  {/* Replacement label */}
                  <div style={{ flex: 1, minWidth: "200px" }}>
                    <div style={{
                      color: "rgba(255,255,255,0.35)",
                      fontSize: "9px",
                      letterSpacing: "1.5px",
                      marginBottom: "5px",
                    }}>
                      QUANTUM-SAFE REPLACEMENT
                    </div>
                    <div style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: "12px",
                      color: "#00ff88",
                      background: "rgba(0,255,136,0.06)",
                      border: "1px solid rgba(0,255,136,0.2)",
                      borderRadius: "5px",
                      padding: "7px 10px",
                      display: "inline-block",
                    }}>
                      ✅ {finding.replacement}
                    </div>
                  </div>
                </div>

                {/* Code block */}
                <div style={{ position: "relative" }}>

                  {/* Copy button — top right of code */}
                  <button
                    onClick={() =>
                      copyReplacementCode(finding.replacement_code, activeReplacementTab)
                    }
                    style={{
                      position: "absolute",
                      top: "12px",
                      right: "16px",
                      zIndex: 10,
                      background:
                        copiedReplacementIdx === activeReplacementTab
                          ? "#00ff88"
                          : "rgba(0,255,136,0.12)",
                      border: `1px solid ${
                        copiedReplacementIdx === activeReplacementTab
                          ? "#00ff88"
                          : "rgba(0,255,136,0.3)"
                      }`,
                      color:
                        copiedReplacementIdx === activeReplacementTab
                          ? "#000"
                          : "#00ff88",
                      borderRadius: "7px",
                      padding: "6px 16px",
                      fontSize: "11px",
                      fontWeight: "700",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                    }}
                  >
                    {copiedReplacementIdx === activeReplacementTab
                      ? "✓ Copied!"
                      : "📋 Copy Safe Code"}
                  </button>

                  {/* The actual code */}
                  <pre style={{
                    margin: 0,
                    padding: "48px 24px 24px",
                    background: "#060a06",
                    fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                    fontSize: "13px",
                    color: "#a8ff78",
                    lineHeight: "1.7",
                    overflowX: "auto",
                    overflowY: "auto",
                    maxHeight: "420px",
                    whiteSpace: "pre",
                    tabSize: 2,
                  }}>
                    {finding.replacement_code}
                  </pre>
                </div>

                {/* Bottom bar: navigation between findings */}
                <div style={{
                  padding: "12px 24px",
                  borderTop: "1px solid rgba(255,255,255,0.05)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  background: "rgba(0,0,0,0.15)",
                }}>
                  <button
                    onClick={() =>
                      setActiveReplacementTab((prev) => Math.max(0, prev - 1))
                    }
                    disabled={activeReplacementTab === 0}
                    style={{
                      background: "transparent",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color:
                        activeReplacementTab === 0
                          ? "rgba(255,255,255,0.15)"
                          : "rgba(255,255,255,0.6)",
                      borderRadius: "6px",
                      padding: "7px 16px",
                      fontSize: "12px",
                      cursor: activeReplacementTab === 0 ? "not-allowed" : "pointer",
                      transition: "all 0.2s ease",
                    }}
                  >
                    ← Previous
                  </button>

                  <span style={{
                    color: "rgba(255,255,255,0.3)",
                    fontSize: "12px",
                  }}>
                    {activeReplacementTab + 1} of{" "}
                    {results.nonSafeFindings.length} replacements
                  </span>

                  <button
                    onClick={() =>
                      setActiveReplacementTab((prev) =>
                        Math.min(results.nonSafeFindings.length - 1, prev + 1)
                      )
                    }
                    disabled={
                      activeReplacementTab === results.nonSafeFindings.length - 1
                    }
                    style={{
                      background: "transparent",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color:
                        activeReplacementTab === results.nonSafeFindings.length - 1
                          ? "rgba(255,255,255,0.15)"
                          : "rgba(255,255,255,0.6)",
                      borderRadius: "6px",
                      padding: "7px 16px",
                      fontSize: "12px",
                      cursor:
                        activeReplacementTab === results.nonSafeFindings.length - 1
                          ? "not-allowed"
                          : "pointer",
                      transition: "all 0.2s ease",
                    }}
                  >
                    Next →
                  </button>
                </div>

              </div>
            );
          })()}

        </div>
      )}
    </div>
  );
};

export default Scanner;
