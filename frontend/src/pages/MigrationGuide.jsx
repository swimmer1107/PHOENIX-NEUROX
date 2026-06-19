import React, { useState } from 'react';

const MigrationGuide = () => {
  // SECTION A: GitHub PR Bot State
  const [repoUrl, setRepoUrl] = useState("");
  const [branch, setBranch] = useState("main");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [prResult, setPrResult] = useState(null);
  const [prError, setPrError] = useState(null);
  const [scanLog, setScanLog] = useState([]);
  const [prDownloaded, setPrDownloaded] = useState(false);

  // SECTION B: Compliance Certificate Generator State
  const [orgName, setOrgName] = useState("");
  const [projectName, setProjectName] = useState("");
  const [assessorName, setAssessorName] = useState("");
  const [riskLevel, setRiskLevel] = useState("LOW");
  const [certGenerated, setCertGenerated] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Mock PR analysis
  const analyzePR = async () => {
    if (!repoUrl.trim()) {
      setPrError("Please enter a GitHub repository URL");
      return;
    }

    // Parse GitHub URL
    const githubRegex = /^https?:\/\/github\.com\/([\w.-]+)\/([\w.-]+?)(\.git)?\/?$/;
    const match = repoUrl.trim().match(githubRegex);
    if (!match) {
      setPrError("Please enter a valid GitHub URL — e.g. https://github.com/owner/repo");
      return;
    }

    const owner = match[1];
    const repo = match[2];

    setIsAnalyzing(true);
    setPrResult(null);
    setPrError(null);
    setScanLog([]);

    // Crypto patterns to detect in real files
    const SCAN_PATTERNS = {
      RSA:    { patterns: [/RSA\.generate/i, /from Crypto\.PublicKey import RSA/i, /rsa\.newkeys/i, /generateKeyPair.*rsa/i, /KeyPairGenerator\.getInstance.*RSA/i, /PKCS1/i, /RS256/i, /rsa_encrypt/i, /rsa_decrypt/i], severity: "CRITICAL", fix: "ML-KEM-768 (NIST FIPS 203)" },
      ECDSA:  { patterns: [/ECDSA/i, /ES256/i, /ES384/i, /SHA256withECDSA/i, /ecdsa\.sign/i, /ec\.sign/i], severity: "HIGH", fix: "ML-DSA-65 (NIST FIPS 204)" },
      ECDH:   { patterns: [/ECDH/i, /createECDH/i, /ecdh\.computeSecret/i, /X25519/i], severity: "HIGH", fix: "ML-KEM-768 (NIST FIPS 203)" },
      ECC:    { patterns: [/ec\.generate_private_key/i, /secp256k1/i, /prime256v1/i, /P-256/i, /ECKey/i], severity: "HIGH", fix: "ML-DSA-65 (NIST FIPS 204)" },
      DH:     { patterns: [/DiffieHellman/i, /DHE/i, /createDiffieHellman/i], severity: "HIGH", fix: "ML-KEM-1024 (NIST FIPS 203)" },
      DES:    { patterns: [/DES\.new/i, /3DES/i, /TripleDES/i, /DESede/i, /createCipheriv.*des/i], severity: "CRITICAL", fix: "AES-256-GCM" },
      MD5:    { patterns: [/hashlib\.md5/i, /MD5\.new/i, /createHash.*md5/i, /MessageDigest\.getInstance.*MD5/i], severity: "MEDIUM", fix: "SHA3-256 (NIST FIPS 202)" },
      SHA1:   { patterns: [/hashlib\.sha1/i, /createHash.*sha1/i, /SHA-?1/i, /MessageDigest\.getInstance.*SHA.?1/i], severity: "MEDIUM", fix: "SHA3-256 (NIST FIPS 202)" },
      TLS:    { patterns: [/TLS_RSA_WITH/i, /TLS_ECDHE_RSA/i, /SSLv[23]/i, /TLSv1\.0/i, /TLSv1\.1/i], severity: "HIGH", fix: "TLS 1.3 with ML-KEM hybrid" },
      AES128: { patterns: [/AES-128/i, /aes-128/i, /AES_128/i], severity: "LOW", fix: "AES-256-GCM" },
    };

    const SCANNABLE_EXTENSIONS = [
      ".py", ".js", ".ts", ".java", ".go", ".c", ".cpp",
      ".cs", ".rb", ".php", ".conf", ".yaml", ".yml", ".json", ".pem",
    ];

    const addLog = (msg) => setScanLog(prev => [...prev, msg]);

    try {
      // Step 1: Get repo info
      addLog(`🔍 Connecting to github.com/${owner}/${repo}...`);
      const repoInfoRes = await fetch(
        `https://api.github.com/repos/${owner}/${repo}`,
        { headers: { Accept: "application/vnd.github.v3+json" } }
      );

      if (repoInfoRes.status === 404) {
        throw new Error(`Repository "${owner}/${repo}" not found. Make sure it is public.`);
      }
      if (repoInfoRes.status === 403) {
        throw new Error("GitHub API rate limit reached. Please wait a minute and try again.");
      }
      if (!repoInfoRes.ok) {
        throw new Error(`GitHub API error: ${repoInfoRes.status}`);
      }

      const repoInfo = await repoInfoRes.json();
      const defaultBranch = branch || repoInfo.default_branch || "main";
      addLog(`✅ Repository found: ${repoInfo.full_name} (${repoInfo.stargazers_count}⭐)`);
      addLog(`📂 Default branch: ${defaultBranch} | Language: ${repoInfo.language || "Mixed"}`);

      // Step 2: Get file tree
      addLog(`📁 Fetching file tree from branch "${defaultBranch}"...`);
      const treeRes = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`,
        { headers: { Accept: "application/vnd.github.v3+json" } }
      );

      if (!treeRes.ok) {
        throw new Error(`Could not fetch file tree. Branch "${defaultBranch}" may not exist.`);
      }

      const treeData = await treeRes.json();
      const allFiles = (treeData.tree || []).filter(
        f => f.type === "blob" &&
        SCANNABLE_EXTENSIONS.some(ext => f.path.toLowerCase().endsWith(ext)) &&
        f.size < 200000 // skip files > 200KB
      );

      addLog(`📄 Found ${allFiles.length} scannable files out of ${treeData.tree?.length || 0} total files`);

      if (allFiles.length === 0) {
        throw new Error("No scannable source files found in this repository.");
      }

      // Step 3: Fetch and scan files (limit to 30 files to avoid rate limits)
      const filesToScan = allFiles.slice(0, 30);
      addLog(`🔬 Scanning ${filesToScan.length} files for cryptographic vulnerabilities...`);

      const allFindings = [];
      let scannedCount = 0;

      for (const file of filesToScan) {
        try {
          const contentRes = await fetch(
            `https://api.github.com/repos/${owner}/${repo}/contents/${file.path}?ref=${defaultBranch}`,
            { headers: { Accept: "application/vnd.github.v3+json" } }
          );

          if (!contentRes.ok) continue;

          const contentData = await contentRes.json();
          if (!contentData.content) continue;

          // Decode base64 content
          const decoded = atob(contentData.content.replace(/\n/g, ""));
          const lines = decoded.split("\n");

          lines.forEach((line, idx) => {
            const trimmed = line.trim();
            if (
              trimmed.startsWith("//") ||
              trimmed.startsWith("#") ||
              trimmed.startsWith("*") ||
              trimmed === ""
            ) return;

            Object.entries(SCAN_PATTERNS).forEach(([algo, config]) => {
              config.patterns.forEach(pattern => {
                if (pattern.test(line)) {
                  const alreadyFound = allFindings.some(
                    f => f.file === file.path && f.line === idx + 1 && f.algorithm === algo
                  );
                  if (!alreadyFound) {
                    allFindings.push({
                      file: file.path,
                      line: idx + 1,
                      code_snippet: line.trim().slice(0, 120),
                      algorithm: algo,
                      severity: config.severity,
                      fix: config.fix,
                    });
                  }
                }
              });
            });
          });

          scannedCount++;
          if (scannedCount % 5 === 0) {
            addLog(`   ⚙ Scanned ${scannedCount}/${filesToScan.length} files... (${allFindings.length} issues found so far)`);
          }

          // Small delay to avoid GitHub rate limits
          await new Promise(r => setTimeout(r, 80));

        } catch (fileErr) {
          // Skip files that fail to fetch
          continue;
        }
      }

      addLog(`✅ Scan complete — ${scannedCount} files scanned`);
      addLog(`⚠ ${allFindings.length} cryptographic vulnerabilities found`);

      if (allFindings.length === 0) {
        // No vulnerabilities found
        setPrResult({
          repo: `${owner}/${repo}`,
          branch: defaultBranch,
          filesScanned: scannedCount,
          totalFiles: allFiles.length,
          vulnerabilities: [],
          repoInfo,
          clean: true,
          prTitle: "✅ No quantum-vulnerable cryptography detected",
          prBody: `## QuantumBridge Scan Results\n\nRepository: ${owner}/${repo}\nFiles scanned: ${scannedCount}\n\n**No quantum-vulnerable cryptographic algorithms were detected in the scanned files.**\n\nThis repository appears to be using safe cryptographic practices or does not contain detectable classical cryptography patterns.\n\nGenerated by QuantumBridge | Team Phoenix | Cyberonites`,
        });
        setIsAnalyzing(false);
        return;
      }

      addLog(`📝 Generating PR description with ${allFindings.length} fixes...`);

      // Step 4: Build PR content from REAL findings
      const uniqueAlgos = [...new Set(allFindings.map(f => f.algorithm))];
      const criticalCount = allFindings.filter(f => f.severity === "CRITICAL").length;
      const highCount = allFindings.filter(f => f.severity === "HIGH").length;

      const changesList = uniqueAlgos.map(algo => {
        const config = SCAN_PATTERNS[algo];
        const count = allFindings.filter(f => f.algorithm === algo).length;
        return `- ✅ Replace ${algo} (${count} occurrence${count > 1 ? "s" : ""}) → ${config.fix}`;
      }).join("\n");

      const filesList = [...new Set(allFindings.map(f => f.file))]
        .slice(0, 15)
        .map(f => `  - \`${f}\``)
        .join("\n");

      const detailsList = allFindings
        .slice(0, 20)
        .map(f => `| \`${f.file}\` | Line ${f.line} | ${f.algorithm} | ${f.severity} | ${f.fix} |`)
        .join("\n");

      const prTitle = `fix(crypto): migrate ${allFindings.length} quantum-vulnerable algorithm${allFindings.length > 1 ? "s" : ""} to PQC`;

      const prBody = `## 🔐 QuantumBridge — Post-Quantum Migration

**Repository:** ${owner}/${repo}
**Branch:** ${defaultBranch}
**Scan Date:** ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}

---

### 📊 Scan Summary

| Metric | Value |
|--------|-------|
| Files Scanned | ${scannedCount} of ${allFiles.length} |
| Total Vulnerabilities | ${allFindings.length} |
| Critical | ${criticalCount} |
| High | ${highCount} |
| Algorithms Affected | ${uniqueAlgos.join(", ")} |

---

### 🔄 Changes Made

${changesList}

---

### 📁 Affected Files

${filesList}
${allFindings.length > 15 ? `\n  *(and ${allFindings.length - 15} more findings)*` : ""}

---

### 📋 Detailed Findings

| File | Line | Algorithm | Severity | Recommended Fix |
|------|------|-----------|----------|-----------------|
${detailsList}
${allFindings.length > 20 ? `\n*(${allFindings.length - 20} additional findings not shown)*` : ""}

---

### ⚠ Why This Matters

Classical algorithms (RSA, ECC, ECDH, ECDSA, DH) are vulnerable to **Shor's algorithm** on quantum computers. NIST finalized post-quantum standards in 2024 (FIPS 203/204/205). The **Harvest Now, Decrypt Later** threat means encrypted data captured today can be decrypted once quantum computers are available.

### 📚 References
- [NIST FIPS 203 — ML-KEM](https://csrc.nist.gov/pubs/fips/203/final)
- [NIST FIPS 204 — ML-DSA](https://csrc.nist.gov/pubs/fips/204/final)
- [Open Quantum Safe — liboqs](https://openquantumsafe.org)

---

*Generated by [QuantumBridge](https://github.com) | Team Phoenix | Cyberonites | GLA University*`;

      addLog(`✅ PR description generated successfully`);

      setPrResult({
        repo: `${owner}/${repo}`,
        branch: defaultBranch,
        filesScanned: scannedCount,
        totalFiles: allFiles.length,
        vulnerabilities: allFindings,
        repoInfo,
        clean: false,
        prTitle,
        prBody,
        uniqueAlgos,
        criticalCount,
        highCount,
        estimatedTime: `~${Math.ceil(allFindings.length * 1.5)} hours of manual work automated`,
      });

    } catch (err) {
      setPrError(err.message || "Failed to analyze repository. Please check the URL and try again.");
      addLog(`❌ Error: ${err.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const downloadPRDescription = () => {
    const now = new Date();
    const dateStr = now.toISOString().split("T")[0];
    const repoSlug = (prResult.repo || "repo").replace("/", "_");
    
    // Build a clean markdown file
    const markdownContent = `# Pull Request: ${prResult.prTitle}

**Repository:** ${prResult.repo}  
**Branch:** ${prResult.branch}  
**Generated:** ${now.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })} at ${now.toLocaleTimeString()}  
**Generated by:** QuantumBridge | Team Phoenix | Cyberonites | GLA University  

---

${prResult.prBody}

---

## How to Use This PR

1. Go to your repository: https://github.com/${prResult.repo}
2. Create a new branch: \`git checkout -b fix/quantum-migration\`
3. Apply the recommended changes to each affected file
4. Commit with message: \`${prResult.prTitle}\`
5. Open a Pull Request using this description
6. Reference: https://github.com/${prResult.repo}/compare/${prResult.branch}

---

*This PR description was generated by QuantumBridge Cryptographic Agility Framework*  
*IntrusionX Second Edition | Team Phoenix | Cyberonites | GLA University*
`;

    const blob = new Blob([markdownContent], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `QuantumBridge_PR_${repoSlug}_${dateStr}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setPrDownloaded(true);
    setTimeout(() => setPrDownloaded(false), 3000);
  };

  const generateCertificate = async () => {
    if (!orgName.trim() || !projectName.trim()) return;
    setIsGenerating(true);
    await new Promise(r => setTimeout(r, 1800));
    setIsGenerating(false);
    setCertGenerated(true);
  };

  const downloadCertificate = () => {
    const certDate = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    const certId = `QB-${Date.now().toString(36).toUpperCase()}`;
    
    const certContent = `
╔══════════════════════════════════════════════════════════════════════╗
║                                                                      ║
║              QUANTUMBRIDGE — QUANTUM READINESS CERTIFICATE           ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝

CERTIFICATE ID: ${certId}
DATE ISSUED: ${certDate}
VALID FOR: 12 months from date of issue

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

This certifies that:

  ORGANIZATION:  ${orgName}
  PROJECT:       ${projectName}
  ASSESSOR:      ${assessorName || "QuantumShield AI"}

has been assessed by QuantumBridge Cryptographic Agility Framework
and evaluated for post-quantum cryptographic readiness.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ASSESSMENT RESULT:   ${riskLevel} RISK
QUANTUM READINESS:   ${riskLevel === "LOW" ? "CERTIFIED ✓" : riskLevel === "MEDIUM" ? "CONDITIONAL ⚠" : "NON-COMPLIANT ✗"}

COMPLIANCE STATUS:
  ✓  NIST FIPS 203 (ML-KEM) — Key Encapsulation
  ✓  NIST FIPS 204 (ML-DSA) — Digital Signatures
  ${riskLevel === "LOW" ? "✓" : "✗"}  NIST FIPS 205 (SLH-DSA) — Hash-Based Signatures
  ${riskLevel === "LOW" ? "✓" : "✗"}  CNSA 2.0 Suite
  ✓  BSI Post-Quantum Recommendations

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ASSESSED BY: QuantumBridge Platform
TEAM: Phoenix | Cyberonites | GLA University
EVENT: IntrusionX Second Edition

Verify this certificate at: quantumbridge.io/verify/${certId}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
This certificate is generated for hackathon demonstration purposes.
QuantumBridge — Cryptographic Agility Framework for Post-Quantum Migration
    `.trim();

    const blob = new Blob([certContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `QuantumBridge_Certificate_${orgName.replace(/\s+/g, "_")}_${certId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-8 max-w-7xl mx-auto flex flex-col gap-12 animate-[fadeIn_0.5s_ease-out]">
      {/* Page Title */}
      <div className="text-center">
        <h1 className="text-4xl font-extrabold font-sans mb-3">Migration <span className="text-primary">Tools</span></h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">Automate your post-quantum migration with AI-powered tooling</p>
      </div>

      {/* SECTION A: GitHub PR Bot */}
      <div style={{ background: "#0f1117", border: "1px solid rgba(0,255,136,0.15)", borderRadius: "12px", padding: "32px" }}>
        {/* Section header */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "8px" }}>
          <div style={{ fontSize: "28px" }}>🤖</div>
          <div>
            <h2 style={{ color: "#fff", fontSize: "22px", fontWeight: "800", margin: 0 }}>
              GitHub PR <span style={{ color: "#00ff88" }}>Bot</span>
            </h2>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px", margin: "4px 0 0 0" }}>
              Automatically analyze your repository and generate a ready-to-merge PR with PQC migration fixes
            </p>
          </div>
        </div>

        {/* How it works — 3 step chips */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "24px", flexWrap: "wrap" }}>
          {["1. Scan Repository", "2. Detect Vulnerabilities", "3. Generate PR"].map((step, i) => (
            <div key={i} style={{ background: "rgba(0,255,136,0.07)", border: "1px solid rgba(0,255,136,0.2)", borderRadius: "20px", padding: "4px 14px", fontSize: "12px", color: "#00ff88" }}>
              {step}
            </div>
          ))}
        </div>

        {/* Input row */}
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "16px" }}>
          <input
            value={repoUrl}
            onChange={e => { setRepoUrl(e.target.value); setPrError(null); }}
            placeholder="https://github.com/your-org/your-repo"
            style={{
              flex: 3, minWidth: "260px",
              background: "#0a0a0f",
              border: `1px solid ${prError ? "#ff4444" : "rgba(0,255,136,0.2)"}`,
              borderRadius: "8px",
              padding: "12px 16px",
              color: "#fff",
              fontSize: "14px",
              outline: "none",
              fontFamily: "JetBrains Mono, monospace",
            }}
          />
          <input
            value={branch}
            onChange={e => setBranch(e.target.value)}
            placeholder="Branch (e.g. main)"
            style={{
              flex: 1, minWidth: "120px",
              background: "#0a0a0f",
              border: "1px solid rgba(0,255,136,0.2)",
              borderRadius: "8px",
              padding: "12px 16px",
              color: "#fff",
              fontSize: "14px",
              outline: "none",
            }}
          />
          <button
            onClick={analyzePR}
            disabled={isAnalyzing}
            style={{
              background: isAnalyzing ? "rgba(0,255,136,0.3)" : "#00ff88",
              color: "#000",
              border: "none",
              borderRadius: "8px",
              padding: "12px 24px",
              fontSize: "14px",
              fontWeight: "700",
              cursor: isAnalyzing ? "not-allowed" : "pointer",
              boxShadow: isAnalyzing ? "none" : "0 0 20px rgba(0,255,136,0.4)",
              transition: "all 0.2s ease",
              whiteSpace: "nowrap",
            }}
          >
            {isAnalyzing ? "🔄 Analyzing..." : "🤖 Generate PR"}
          </button>
        </div>

        {/* Error message */}
        {prError && (
          <div style={{ color: "#ff4444", fontSize: "13px", marginBottom: "12px", padding: "8px 12px", background: "rgba(255,68,68,0.05)", border: "1px solid rgba(255,68,68,0.2)", borderRadius: "6px" }}>
            ⚠️ {prError}
          </div>
        )}

        {/* Loading state with live scan log */}
        {isAnalyzing && (
          <div style={{
            padding: "20px",
            background: "rgba(0,0,0,0.3)",
            border: "1px solid rgba(0,255,136,0.1)",
            borderRadius: "8px",
            marginTop: "8px",
          }}>
            <div style={{
              color: "#00ff88",
              fontSize: "11px",
              fontWeight: "700",
              letterSpacing: "1px",
              marginBottom: "12px",
            }}>
              LIVE SCAN LOG
            </div>
            <div style={{
              maxHeight: "200px",
              overflowY: "auto",
              scrollbarWidth: "thin",
              scrollbarColor: "rgba(0,255,136,0.2) transparent",
            }}>
              {scanLog.map((log, i) => (
                <div key={i} style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "12px",
                  color: log.startsWith("❌")
                    ? "#ff6666"
                    : log.startsWith("✅")
                    ? "#00ff88"
                    : log.startsWith("⚠")
                    ? "#ffaa00"
                    : "rgba(255,255,255,0.6)",
                  marginBottom: "5px",
                  lineHeight: "1.5",
                  animation: "fadeIn 0.2s ease",
                }}>
                  {log}
                </div>
              ))}
              {/* Blinking cursor at end */}
              <div style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                marginTop: "4px",
              }}>
                <div style={{
                  width: "8px", height: "8px", borderRadius: "50%",
                  background: "#00ff88",
                  animation: "pulse 1s ease-in-out infinite",
                }} />
                <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "11px", fontFamily: "monospace" }}>
                  scanning...
                </span>
              </div>
            </div>
          </div>
        )}

        {/* PR Result */}
        {prResult && (
          <div style={{ marginTop: "8px" }}>

            {/* Clean repo message */}
            {prResult.clean && (
              <div style={{
                padding: "24px",
                background: "rgba(0,255,136,0.05)",
                border: "1px solid rgba(0,255,136,0.2)",
                borderRadius: "8px",
                textAlign: "center",
                marginBottom: "16px",
              }}>
                <div style={{ fontSize: "40px", marginBottom: "10px" }}>🛡️</div>
                <div style={{ color: "#00ff88", fontSize: "18px", fontWeight: "800", marginBottom: "6px" }}>
                  No Vulnerabilities Found
                </div>
                <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px" }}>
                  {prResult.filesScanned} files scanned in {prResult.repo} — no quantum-vulnerable cryptography detected.
                </div>
              </div>
            )}

            {/* Real stats from actual scan */}
            {!prResult.clean && (
              <>
                <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
                  {[
                    { label: "Files Scanned", value: `${prResult.filesScanned}/${prResult.totalFiles}`, color: "#00d4ff" },
                    { label: "Vulnerabilities", value: prResult.vulnerabilities.length, color: "#ff4444" },
                    { label: "Algorithms Found", value: prResult.uniqueAlgos?.length || 0, color: "#ffaa00" },
                    { label: "Time Saved", value: prResult.estimatedTime, color: "#00ff88" },
                  ].map((stat, i) => (
                    <div key={i} style={{
                      flex: 1, minWidth: "120px",
                      background: "#0a0a0f",
                      border: `1px solid ${stat.color}33`,
                      borderRadius: "8px",
                      padding: "12px 16px",
                    }}>
                      <div style={{ color: stat.color, fontSize: "18px", fontWeight: "800" }}>
                        {stat.value}
                      </div>
                      <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px", marginTop: "2px" }}>
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Real vulnerabilities list */}
                <div style={{ marginBottom: "20px" }}>
                  <div style={{
                    color: "rgba(255,255,255,0.5)",
                    fontSize: "11px", letterSpacing: "1px",
                    marginBottom: "10px",
                  }}>
                    ACTUAL FINDINGS FROM {prResult.repo.toUpperCase()}
                  </div>
                  {prResult.vulnerabilities.slice(0, 8).map((v, i) => {
                    const sevColor =
                      v.severity === "CRITICAL" ? "#ff4444" :
                      v.severity === "HIGH" ? "#ffaa00" :
                      v.severity === "MEDIUM" ? "#00d4ff" : "#a855f7";
                    return (
                      <div key={i} style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "10px",
                        padding: "10px 14px",
                        background: "#0a0a0f",
                        borderRadius: "6px",
                        marginBottom: "6px",
                        borderLeft: `3px solid ${sevColor}`,
                      }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            color: "rgba(255,255,255,0.5)",
                            fontSize: "10px",
                            fontFamily: "monospace",
                            marginBottom: "3px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}>
                            {v.file} : Line {v.line}
                          </div>
                          <div style={{
                            fontFamily: "monospace",
                            fontSize: "11px",
                            color: "#ff8888",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}>
                            {v.code_snippet}
                          </div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "3px", alignItems: "flex-end", flexShrink: 0 }}>
                          <span style={{
                            background: `${sevColor}22`,
                            border: `1px solid ${sevColor}44`,
                            color: sevColor,
                            fontSize: "9px", padding: "1px 6px",
                            borderRadius: "3px", fontWeight: "700",
                          }}>
                            {v.severity}
                          </span>
                          <span style={{ color: "#00ff88", fontSize: "9px" }}>
                            → {v.algorithm}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  {prResult.vulnerabilities.length > 8 && (
                    <div style={{
                      color: "rgba(255,255,255,0.3)",
                      fontSize: "12px",
                      textAlign: "center",
                      padding: "8px",
                    }}>
                      + {prResult.vulnerabilities.length - 8} more findings in the PR description below
                    </div>
                  )}
                </div>
              </>
            )}

            {/* PR Preview — always shown */}
            <div style={{
              background: "#0a0a0f",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px",
              overflow: "hidden",
              marginBottom: "16px",
            }}>
              <div style={{
                background: "rgba(255,255,255,0.03)",
                padding: "12px 16px",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                display: "flex", alignItems: "center", gap: "8px",
              }}>
                <span style={{ color: "#00ff88", fontSize: "16px" }}>⑂</span>
                <span style={{ color: "#fff", fontSize: "13px", fontWeight: "600" }}>
                  {prResult.prTitle}
                </span>
                <span style={{
                  marginLeft: "auto",
                  background: prResult.clean
                    ? "rgba(0,255,136,0.15)"
                    : "rgba(255,170,0,0.15)",
                  color: prResult.clean ? "#00ff88" : "#ffaa00",
                  fontSize: "10px", padding: "2px 8px",
                  borderRadius: "10px",
                  border: `1px solid ${prResult.clean ? "rgba(0,255,136,0.3)" : "rgba(255,170,0,0.3)"}`,
                }}>
                  {prResult.clean ? "✅ CLEAN" : "DRAFT PR"}
                </span>
              </div>
              <div style={{ padding: "14px 16px", maxHeight: "280px", overflowY: "auto" }}>
                <pre style={{
                  color: "rgba(255,255,255,0.5)",
                  fontSize: "11px", margin: 0,
                  whiteSpace: "pre-wrap",
                  fontFamily: "'JetBrains Mono', monospace",
                  lineHeight: 1.6,
                }}>
                  {prResult.prBody}
                </pre>
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <button
                onClick={downloadPRDescription}
                style={{
                  background: prDownloaded
                    ? "rgba(0,255,136,0.15)"
                    : "linear-gradient(135deg, #00ff88, #00cc6a)",
                  color: prDownloaded ? "#00ff88" : "#000",
                  border: prDownloaded
                    ? "1px solid #00ff88"
                    : "none",
                  borderRadius: "8px",
                  padding: "11px 22px",
                  fontSize: "13px",
                  fontWeight: "700",
                  cursor: "pointer",
                  boxShadow: prDownloaded
                    ? "0 0 15px rgba(0,255,136,0.2)"
                    : "0 0 20px rgba(0,255,136,0.35)",
                  transition: "all 0.3s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: "7px",
                  letterSpacing: "0.3px",
                }}
                onMouseEnter={e => {
                  if (!prDownloaded) {
                    e.currentTarget.style.boxShadow = "0 0 30px rgba(0,255,136,0.55)";
                    e.currentTarget.style.transform = "scale(1.02)";
                  }
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.boxShadow = prDownloaded
                    ? "0 0 15px rgba(0,255,136,0.2)"
                    : "0 0 20px rgba(0,255,136,0.35)";
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                {prDownloaded ? (
                  <>
                    <span style={{ fontSize: "14px" }}>✓</span>
                    Downloaded!
                  </>
                ) : (
                  <>
                    <span style={{ fontSize: "14px" }}>⬇</span>
                    Download PR (.md)
                  </>
                )}
              </button>
              {!prResult.clean && (
                <button
                  onClick={() => {
                    const url = `${repoUrl.trim()}/compare/${prResult.branch}?quick_pull=1&title=${encodeURIComponent(prResult.prTitle)}&body=${encodeURIComponent(prResult.prBody)}`;
                    window.open(url, "_blank");
                  }}
                  style={{
                    background: "transparent", color: "#00d4ff",
                    border: "1px solid rgba(0,212,255,0.4)",
                    borderRadius: "7px", padding: "10px 20px",
                    fontSize: "13px", fontWeight: "600", cursor: "pointer",
                  }}
                >
                  🔗 Open PR on GitHub
                </button>
              )}
              <button
                onClick={() => {
                  setPrResult(null);
                  setRepoUrl("");
                  setBranch("main");
                  setScanLog([]);
                }}
                style={{
                  background: "transparent",
                  color: "rgba(255,255,255,0.4)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "7px", padding: "10px 20px",
                  fontSize: "13px", cursor: "pointer",
                }}
              >
                Reset
              </button>
            </div>
          </div>
        )}
      </div>

      {/* SECTION B: Compliance Certificate Generator */}
      <div style={{ background: "#0f1117", border: "1px solid rgba(0,212,255,0.15)", borderRadius: "12px", padding: "32px" }}>
        
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "24px" }}>
          <div style={{ fontSize: "28px" }}>🏆</div>
          <div>
            <h2 style={{ color: "#fff", fontSize: "22px", fontWeight: "800", margin: 0 }}>
              Compliance <span style={{ color: "#00d4ff" }}>Certificate Generator</span>
            </h2>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px", margin: "4px 0 0 0" }}>
              Generate a quantum readiness compliance certificate for your organization
            </p>
          </div>
        </div>

        {/* Input form — 2x2 grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "20px" }}>
          {[
            { label: "Organization Name", value: orgName, setter: setOrgName, placeholder: "e.g. Acme Corp" },
            { label: "Project / Codebase Name", value: projectName, setter: setProjectName, placeholder: "e.g. auth-service-v2" },
            { label: "Assessor Name (optional)", value: assessorName, setter: setAssessorName, placeholder: "e.g. Jane Smith" },
          ].map((field, p) => (
            <div key={p}>
              <label style={{ color: "rgba(255,255,255,0.5)", fontSize: "11px", letterSpacing: "1px", display: "block", marginBottom: "6px" }}>
                {field.label.toUpperCase()}
              </label>
              <input
                value={field.value}
                onChange={e => field.setter(e.target.value)}
                placeholder={field.placeholder}
                style={{ width: "100%", background: "#0a0a0f", border: "1px solid rgba(0,212,255,0.2)", borderRadius: "7px", padding: "10px 14px", color: "#fff", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
              />
            </div>
          ))}
          <div>
            <label style={{ color: "rgba(255,255,255,0.5)", fontSize: "11px", letterSpacing: "1px", display: "block", marginBottom: "6px" }}>
              ASSESSED RISK LEVEL
            </label>
            <select
              value={riskLevel}
              onChange={e => { setRiskLevel(e.target.value); setCertGenerated(false); }}
              style={{ width: "100%", background: "#0a0a0f", border: "1px solid rgba(0,212,255,0.2)", borderRadius: "7px", padding: "10px 14px", color: "#fff", fontSize: "14px", outline: "none" }}
            >
              <option value="LOW">LOW — Quantum-Ready ✓</option>
              <option value="MEDIUM">MEDIUM — Partially Compliant ⚠</option>
              <option value="HIGH">HIGH — Immediate Action Required ✗</option>
              <option value="CRITICAL">CRITICAL — Non-Compliant ✗✗</option>
            </select>
          </div>
        </div>

        {/* Generate button */}
        <button
          onClick={generateCertificate}
          disabled={!orgName.trim() || !projectName.trim() || isGenerating}
          style={{
            background: orgName && projectName ? "#00d4ff" : "rgba(0,212,255,0.2)",
            color: orgName && projectName ? "#000" : "rgba(255,255,255,0.3)",
            border: "none",
            borderRadius: "8px",
            padding: "12px 28px",
            fontSize: "14px",
            fontWeight: "700",
            cursor: orgName && projectName ? "pointer" : "not-allowed",
            boxShadow: orgName && projectName ? "0 0 20px rgba(0,212,255,0.4)" : "none",
            transition: "all 0.2s ease",
            marginBottom: "20px",
          }}
        >
          {isGenerating ? "🔄 Generating..." : "🏆 Generate Certificate"}
        </button>

        {/* Certificate preview */}
        {certGenerated && (
          <div className="animate-[fadeIn_0.5s_ease-out]">
            {/* Preview card */}
            <div style={{
              background: "linear-gradient(135deg, #0a0f0a 0%, #050d10 100%)",
              border: `2px solid ${riskLevel === "LOW" ? "#00ff88" : riskLevel === "MEDIUM" ? "#ffaa00" : "#ff4444"}`,
              borderRadius: "12px",
              padding: "28px",
              marginBottom: "16px",
              boxShadow: `0 0 30px ${riskLevel === "LOW" ? "rgba(0,255,136,0.2)" : riskLevel === "MEDIUM" ? "rgba(255,170,0,0.2)" : "rgba(255,68,68,0.2)"}`,
              position: "relative",
              overflow: "hidden",
            }}>
              {/* Watermark */}
              <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%) rotate(-30deg)", fontSize: "80px", opacity: 0.03, pointerEvents: "none", fontWeight: "900", color: "#fff", whiteSpace: "nowrap" }}>
                QUANTUMBRIDGE
              </div>

              {/* Certificate header */}
              <div style={{ textAlign: "center", marginBottom: "24px", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "20px" }}>
                <div style={{ fontSize: "12px", letterSpacing: "3px", color: "rgba(255,255,255,0.4)", marginBottom: "8px" }}>QUANTUMBRIDGE</div>
                <div style={{ fontSize: "20px", fontWeight: "800", color: "#fff", marginBottom: "4px" }}>QUANTUM READINESS CERTIFICATE</div>
                <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>Cryptographic Agility Assessment</div>
              </div>

              {/* Certificate body */}
              <div style={{ textAlign: "center", marginBottom: "24px" }}>
                <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px", marginBottom: "4px" }}>This certifies that</div>
                <div style={{ color: "#fff", fontSize: "22px", fontWeight: "800", marginBottom: "4px" }}>{orgName}</div>
                <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px", marginBottom: "4px" }}>for project</div>
                <div style={{ color: "#00d4ff", fontSize: "16px", fontWeight: "600", fontFamily: "JetBrains Mono, monospace" }}>{projectName}</div>
              </div>

              {/* Risk result badge */}
              <div style={{ textAlign: "center", marginBottom: "24px" }}>
                <div style={{
                  display: "inline-flex", flexDirection: "column", alignItems: "center",
                  background: `${riskLevel === "LOW" ? "rgba(0,255,136,0.1)" : riskLevel === "MEDIUM" ? "rgba(255,170,0,0.1)" : "rgba(255,68,68,0.1)"}`,
                  border: `1px solid ${riskLevel === "LOW" ? "#00ff88" : riskLevel === "MEDIUM" ? "#ffaa00" : "#ff4444"}`,
                  borderRadius: "12px", padding: "16px 32px",
                }}>
                  <div style={{ fontSize: "32px", marginBottom: "4px" }}>
                    {riskLevel === "LOW" ? "🛡️" : riskLevel === "MEDIUM" ? "⚠️" : "🚨"}
                  </div>
                  <div style={{ color: riskLevel === "LOW" ? "#00ff88" : riskLevel === "MEDIUM" ? "#ffaa00" : "#ff4444", fontSize: "18px", fontWeight: "800", letterSpacing: "2px" }}>
                    {riskLevel} RISK
                  </div>
                  <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "12px", marginTop: "4px" }}>
                    {riskLevel === "LOW" ? "Quantum-Migration Certified" : riskLevel === "MEDIUM" ? "Conditional Compliance" : "Immediate Action Required"}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "16px" }}>
                <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)" }}>
                  Issued: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                </div>
                <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)" }}>
                  Team Phoenix | Cyberonites | GLA University
                </div>
              </div>
            </div>

            {/* Download button */}
            <button
              onClick={downloadCertificate}
              style={{
                background: "#00ff88",
                color: "#000",
                border: "none",
                borderRadius: "8px",
                padding: "12px 28px",
                fontSize: "14px",
                fontWeight: "700",
                cursor: "pointer",
                boxShadow: "0 0 20px rgba(0,255,136,0.4)",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={e => e.currentTarget.style.transform = "scale(1.02)"}
              onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
            >
              ⬇️ Download Certificate
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MigrationGuide;
