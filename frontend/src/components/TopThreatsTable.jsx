import { useState } from "react";
import { createPortal } from "react-dom";

const threats = [
  { id: 1, name: "Sequential Breach",    level: "CRITICAL", score: 92, sourceFile: "auth/rsa_handler.py",    sourceIP: "45.249.971.52", algorithm: "RSA-2048",    status: "ACTIVE",      scanned: "2 min ago",  action: "Patch RSA → ML-KEM-768" },
  { id: 2, name: "Global Disruption",    level: "HIGH",     score: 74, sourceFile: "crypto/ecdsa_sign.js",   sourceIP: "65.321.917.53", algorithm: "ECDSA P-256", status: "MONITORING",  scanned: "8 min ago",  action: "Replace ECDSA → ML-DSA-65" },
  { id: 3, name: "Analytical Deduction", level: "HIGH",     score: 68, sourceFile: "config/ssl.conf",        sourceIP: "223.001.91.52", algorithm: "DHE-RSA",     status: "FLAGGED",     scanned: "15 min ago", action: "Migrate DHE → ML-KEM-1024" },
  { id: 4, name: "Key Exposure Vector",  level: "CRITICAL", score: 88, sourceFile: "services/tls_config.py", sourceIP: "192.168.4.21",  algorithm: "RSA-1024",    status: "ACTIVE",      scanned: "1 min ago",  action: "Immediate: RSA-1024 is critically weak" },
  { id: 5, name: "Legacy Hash Collision",level: "MEDIUM",   score: 45, sourceFile: "utils/checksum.go",      sourceIP: "10.0.0.88",     algorithm: "MD5",         status: "RESOLVED",    scanned: "1 hr ago",   action: "Upgrade MD5 → SHA3-256" },
];

const levelColors  = { CRITICAL: "#ff4444", HIGH: "#ffaa00", MEDIUM: "#00d4ff", LOW: "#00ff88" };
const statusColors = { ACTIVE: "#ff4444", MONITORING: "#ffaa00", FLAGGED: "#f97316", RESOLVED: "#00ff88" };

const securityNotes = {
  CRITICAL: "⚠️ This algorithm is critically vulnerable to Shor's algorithm on quantum computers. Immediate migration is required. Any data encrypted with this algorithm is at risk of \"Harvest Now, Decrypt Later\" attacks.",
  HIGH:     "⚠️ High-priority vulnerability. This algorithm is quantum-vulnerable and should be migrated as part of your PQC transition plan. Schedule remediation within the next sprint.",
  MEDIUM:   "ℹ️ This algorithm is classically weak and should be upgraded. While not immediately quantum-critical, it represents a security debt that must be addressed in your migration roadmap.",
  LOW:      "ℹ️ Low-priority finding. Plan migration as part of your next scheduled security review.",
};

// ── Section label helper ──────────────────────────────────────────────────────
function SectionLabel({ children }) {
  return (
    <div style={{
      color: "rgba(255,255,255,0.3)", fontSize: "10px",
      fontWeight: "700", letterSpacing: "2px", marginBottom: "14px",
      display: "flex", alignItems: "center", gap: "8px",
    }}>
      <span style={{ width: "20px", height: "1px", background: "rgba(255,255,255,0.2)", display: "inline-block" }} />
      {children}
    </div>
  );
}

// ── Vulnerability Detail Modal (rendered via portal onto document.body) ───────
function VulnModal({ threat, onClose }) {
  const lc = levelColors[threat.level]  || "#00d4ff";
  const sc = statusColors[threat.status] || "#888";

  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,0.85)",
        backdropFilter: "blur(10px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 99999,
        padding: "20px",
        animation: "backdropFadeIn 0.2s ease",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "linear-gradient(145deg, #0d1117 0%, #0a0d14 100%)",
          border: `1px solid ${lc}33`,
          borderTop: `3px solid ${lc}`,
          borderRadius: "18px",
          width: "100%",
          maxWidth: "920px",
          maxHeight: "88vh",
          overflowY: "auto",
          boxShadow: `0 0 100px ${lc}18, 0 40px 80px rgba(0,0,0,0.8)`,
          animation: "modalSlideUp 0.28s cubic-bezier(0.16,1,0.3,1)",
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(0,255,136,0.2) transparent",
        }}
      >
        {/* ── Sticky Header ── */}
        <div style={{
          padding: "24px 28px 20px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex", justifyContent: "space-between", alignItems: "flex-start",
          background: `linear-gradient(135deg, ${lc}08 0%, transparent 60%)`,
          position: "sticky", top: 0, zIndex: 10,
          backdropFilter: "blur(24px)",
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px", flexWrap: "wrap" }}>
              {/* Severity badge */}
              <span style={{
                background: `${lc}20`, border: `1px solid ${lc}`,
                color: lc, padding: "4px 12px", borderRadius: "6px",
                fontSize: "11px", fontWeight: "800", letterSpacing: "1.5px",
              }}>
                {threat.level}
              </span>
              {/* Status */}
              <span style={{ display: "flex", alignItems: "center", gap: "6px", color: sc, fontSize: "12px", fontWeight: "600" }}>
                <span style={{
                  width: "8px", height: "8px", borderRadius: "50%",
                  background: sc, boxShadow: `0 0 8px ${sc}`,
                  animation: threat.status === "ACTIVE" ? "dotPulse 1.5s ease-in-out infinite" : "none",
                }} />
                {threat.status}
              </span>
              <span style={{
                background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                color: "rgba(255,255,255,0.4)", padding: "3px 10px",
                borderRadius: "20px", fontSize: "11px",
              }}>
                🕐 {threat.scanned}
              </span>
            </div>
            <h3 style={{ color: "#fff", fontSize: "26px", fontWeight: "800", margin: 0, letterSpacing: "-0.5px" }}>
              {threat.name}
            </h3>
          </div>
          {/* Close button */}
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.4)", width: "36px", height: "36px",
              borderRadius: "10px", fontSize: "18px", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0, marginLeft: "20px", transition: "all 0.2s ease",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.12)"; e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "rgba(255,255,255,0.4)"; }}
          >
            ✕
          </button>
        </div>

        {/* ── Body: 2-column grid ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))" }}>

          {/* LEFT COLUMN */}
          <div style={{ padding: "24px 28px", borderRight: "1px solid rgba(255,255,255,0.05)" }}>

            {/* Threat Overview */}
            <div style={{ marginBottom: "24px" }}>
              <SectionLabel>THREAT OVERVIEW</SectionLabel>

              {/* Score card */}
              <div style={{
                background: `linear-gradient(135deg, ${lc}12, ${lc}06)`,
                border: `1px solid ${lc}30`, borderRadius: "12px",
                padding: "20px", marginBottom: "12px",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "12px", letterSpacing: "1px" }}>THREAT SCORE</span>
                  <span style={{
                    color: lc, fontSize: "34px", fontWeight: "900",
                    fontFamily: "monospace", textShadow: `0 0 24px ${lc}66`,
                  }}>
                    {threat.score}<span style={{ fontSize: "16px", opacity: 0.5 }}>/100</span>
                  </span>
                </div>
                <div style={{ height: "6px", background: "rgba(255,255,255,0.08)", borderRadius: "3px" }}>
                  <div style={{
                    width: `${threat.score}%`, height: "100%",
                    background: `linear-gradient(90deg, ${lc}66, ${lc})`,
                    borderRadius: "3px", boxShadow: `0 0 10px ${lc}88`,
                    transition: "width 0.8s cubic-bezier(0.16,1,0.3,1)",
                  }} />
                </div>
              </div>

              {/* Algorithm badge */}
              <div style={{
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "10px", padding: "14px 16px",
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px" }}>🔐 Algorithm Detected</span>
                <span style={{
                  background: `${lc}18`, border: `1px solid ${lc}55`,
                  color: lc, padding: "5px 14px", borderRadius: "6px",
                  fontSize: "13px", fontWeight: "800",
                  fontFamily: "'JetBrains Mono', monospace",
                }}>
                  {threat.algorithm}
                </span>
              </div>
            </div>

            {/* Source Information */}
            <div style={{ marginBottom: "24px" }}>
              <SectionLabel>SOURCE INFORMATION</SectionLabel>
              <div style={{
                background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: "10px", overflow: "hidden",
              }}>
                {[
                  { icon: "📄", label: "Source File",     value: threat.sourceFile },
                  { icon: "🌐", label: "Source IP",       value: threat.sourceIP },
                  { icon: "🕐", label: "Detection Time",  value: threat.scanned },
                ].map((row, i, arr) => (
                  <div key={i} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "13px 16px",
                    borderBottom: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                  }}>
                    <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px", display: "flex", alignItems: "center", gap: "8px" }}>
                      {row.icon} {row.label}
                    </span>
                    <span style={{
                      color: "#e0e0e0", fontSize: "12px",
                      fontFamily: "'JetBrains Mono', monospace",
                      maxWidth: "200px", overflow: "hidden",
                      textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Audit & Compliance */}
            <div>
              <SectionLabel>AUDIT &amp; COMPLIANCE</SectionLabel>
              <div style={{
                background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: "10px", overflow: "hidden",
              }}>
                <div style={{
                  padding: "14px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                }}>
                  <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px" }}>🛡️ ArmorIQ Verification</span>
                  <span style={{
                    background: "rgba(255,170,0,0.1)", border: "1px solid rgba(255,170,0,0.3)",
                    color: "#ffaa00", padding: "3px 10px", borderRadius: "5px",
                    fontSize: "11px", fontWeight: "700",
                  }}>POLICY CHECK</span>
                </div>
                <div style={{
                  padding: "14px 16px",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                }}>
                  <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px" }}>📋 Audit Log Entry</span>
                  <span style={{
                    background: "rgba(0,255,136,0.08)", border: "1px solid rgba(0,255,136,0.2)",
                    color: "#00ff88", padding: "3px 10px", borderRadius: "5px",
                    fontSize: "11px", fontWeight: "700",
                  }}>LOGGED ✓</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div style={{ padding: "24px 28px" }}>

            {/* Recommended Action */}
            <div style={{ marginBottom: "24px" }}>
              <SectionLabel>RECOMMENDED ACTION</SectionLabel>
              <div style={{
                background: "rgba(0,255,136,0.04)", border: "1px solid rgba(0,255,136,0.2)",
                borderLeft: "3px solid #00ff88", borderRadius: "10px", padding: "18px 20px",
              }}>
                <div style={{
                  color: "#00ff88", fontSize: "10px", fontWeight: "800",
                  letterSpacing: "2px", marginBottom: "10px",
                }}>
                  ⚡ MIGRATION RECOMMENDATION
                </div>
                <div style={{ color: "#e8ffe8", fontSize: "15px", lineHeight: "1.6", fontWeight: "500" }}>
                  {threat.action}
                </div>
              </div>
            </div>

            {/* Security Notes */}
            <div style={{ marginBottom: "24px" }}>
              <SectionLabel>SECURITY NOTES</SectionLabel>
              <div style={{
                background: `${lc}08`, border: `1px solid ${lc}22`,
                borderRadius: "10px", padding: "16px 20px",
              }}>
                <p style={{ color: "rgba(240,240,240,0.82)", fontSize: "13px", lineHeight: "1.7", margin: 0 }}>
                  {securityNotes[threat.level] || securityNotes.LOW}
                </p>
              </div>
            </div>

            {/* Generated Fix */}
            <div>
              <SectionLabel>GENERATED FIX</SectionLabel>
              <div style={{
                background: "#060a06", border: "1px solid rgba(0,255,136,0.15)",
                borderRadius: "10px", overflow: "hidden",
              }}>
                <div style={{
                  padding: "10px 16px", background: "rgba(0,255,136,0.05)",
                  borderBottom: "1px solid rgba(0,255,136,0.1)",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                }}>
                  <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px" }}>
                    Corrected Code — {threat.action.split("→")[1]?.trim() || "PQC Migration"}
                  </span>
                  <button
                    onClick={() => navigator.clipboard.writeText(`# Migrate: ${threat.action}\n# See Scanner page for full quantum-safe replacement code.`)}
                    style={{
                      color: "#00ff88", fontSize: "11px", fontWeight: "600",
                      cursor: "pointer", background: "rgba(0,255,136,0.08)",
                      border: "1px solid rgba(0,255,136,0.2)",
                      padding: "3px 10px", borderRadius: "5px",
                    }}
                  >
                    📋 Copy
                  </button>
                </div>
                <pre style={{
                  margin: 0, padding: "16px",
                  fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                  fontSize: "12px", color: "#a8ff78",
                  lineHeight: "1.7", overflowX: "auto",
                  maxHeight: "160px", overflowY: "auto",
                  scrollbarWidth: "thin",
                  scrollbarColor: "rgba(0,255,136,0.2) transparent",
                }}>
{`# ✅ Recommended migration for ${threat.algorithm}
# Open the Scanner page for the full quantum-safe
# replacement code and step-by-step migration guide.

# Quick reference:
# ${threat.action}`}
                </pre>
              </div>
            </div>
          </div>
        </div>

        {/* ── Footer Buttons ── */}
        <div style={{
          padding: "18px 28px", display: "flex", gap: "12px",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          background: "rgba(0,0,0,0.2)", flexWrap: "wrap",
        }}>
          <button
            onClick={() => { onClose(); window.location.hash = "#scanner"; }}
            style={{
              flex: 1, minWidth: "160px",
              background: "linear-gradient(135deg, #00ff88, #00cc6a)",
              color: "#000", border: "none", borderRadius: "10px",
              padding: "14px 20px", fontSize: "14px", fontWeight: "800",
              cursor: "pointer", boxShadow: "0 4px 20px rgba(0,255,136,0.3)",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 8px 30px rgba(0,255,136,0.45)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)";    e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,255,136,0.3)"; }}
          >
            🔍 Run Full Scan
          </button>
          <button
            onClick={onClose}
            style={{
              flex: 1, minWidth: "120px",
              background: "transparent", color: "rgba(255,255,255,0.6)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: "10px", padding: "14px 20px",
              fontSize: "14px", fontWeight: "500", cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent";            e.currentTarget.style.color = "rgba(255,255,255,0.6)"; }}
          >
            Dismiss
          </button>
        </div>
      </div>

      <style>{`
        @keyframes backdropFadeIn {
          from { opacity: 0; } to { opacity: 1; }
        }
        @keyframes modalSlideUp {
          from { opacity: 0; transform: translateY(28px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
        @keyframes dotPulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }
      `}</style>
    </div>,
    document.body
  );
}

// ── Main table component ──────────────────────────────────────────────────────
export default function TopThreatsTable() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  const filtered = threats.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.algorithm.toLowerCase().includes(search.toLowerCase()) ||
    t.level.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ marginTop: "24px" }}>
      {/* Header + Search */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <h2 style={{ color: "#fff", fontSize: "18px", fontWeight: "700" }}>
          Top Critical <span style={{ color: "#00ff88" }}>Threats</span>
        </h2>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search threats..."
          style={{
            background: "#0f1117", border: "1px solid rgba(0,255,136,0.2)",
            borderRadius: "6px", padding: "8px 14px", color: "#fff",
            fontSize: "13px", outline: "none", width: "220px",
          }}
        />
      </div>

      {/* Table */}
      <div style={{ overflowX: "auto", borderRadius: "10px", border: "1px solid rgba(0,255,136,0.1)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "rgba(0,255,136,0.05)", borderBottom: "1px solid rgba(0,255,136,0.15)" }}>
              {["Detection", "Algorithm", "Threat Level", "Status", "Last Scanned", "Source File", "Action"].map(h => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "11px", color: "rgba(255,255,255,0.4)", letterSpacing: "1px", fontWeight: "600", textTransform: "uppercase" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(threat => (
              <tr
                key={threat.id}
                style={{
                  borderLeft: `3px solid ${levelColors[threat.level] || "#888"}`,
                  borderBottom: "1px solid rgba(255,255,255,0.05)",
                  transition: "background 0.2s ease", cursor: "default",
                }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(0,255,136,0.03)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <td style={{ padding: "14px 16px", color: "#fff", fontSize: "13px", fontWeight: "600" }}>{threat.name}</td>
                <td style={{ padding: "14px 16px" }}>
                  <span style={{
                    background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "4px", padding: "3px 8px",
                    fontSize: "11px", color: "rgba(255,255,255,0.7)",
                    fontFamily: "JetBrains Mono, monospace",
                  }}>
                    {threat.algorithm}
                  </span>
                </td>
                <td style={{ padding: "14px 16px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <span style={{
                      display: "inline-block",
                      background: `${levelColors[threat.level]}22`, border: `1px solid ${levelColors[threat.level]}55`,
                      color: levelColors[threat.level], borderRadius: "4px",
                      padding: "2px 8px", fontSize: "10px", fontWeight: "700", letterSpacing: "0.5px",
                    }}>
                      {threat.level}
                    </span>
                    <div style={{ width: "80px", height: "3px", background: "rgba(255,255,255,0.1)", borderRadius: "2px" }}>
                      <div style={{ width: `${threat.score}%`, height: "100%", background: levelColors[threat.level], borderRadius: "2px", boxShadow: `0 0 4px ${levelColors[threat.level]}` }} />
                    </div>
                  </div>
                </td>
                <td style={{ padding: "14px 16px" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "11px", color: statusColors[threat.status] }}>
                    <span style={{
                      width: "6px", height: "6px", borderRadius: "50%",
                      background: statusColors[threat.status], boxShadow: `0 0 6px ${statusColors[threat.status]}`,
                      animation: threat.status === "ACTIVE" ? "dotPulse 1.5s ease-in-out infinite" : "none",
                    }} />
                    {threat.status}
                  </span>
                </td>
                <td style={{ padding: "14px 16px", color: "rgba(255,255,255,0.4)", fontSize: "12px" }}>🕐 {threat.scanned}</td>
                <td style={{ padding: "14px 16px", color: "rgba(255,255,255,0.5)", fontSize: "11px", fontFamily: "monospace" }}>{threat.sourceFile}</td>
                <td style={{ padding: "14px 16px" }}>
                  <button
                    onClick={() => setSelected(threat)}
                    style={{
                      background: "transparent", border: "1px solid rgba(0,212,255,0.4)",
                      color: "#00d4ff", borderRadius: "5px", padding: "5px 14px",
                      fontSize: "11px", fontWeight: "600", cursor: "pointer",
                      transition: "all 0.2s ease", letterSpacing: "0.5px",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(0,212,255,0.1)"; e.currentTarget.style.boxShadow = "0 0 10px rgba(0,212,255,0.3)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.boxShadow = "none"; }}
                  >
                    VIEW →
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Portal modal — renders directly on document.body, escapes all containers */}
      {selected && <VulnModal threat={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
