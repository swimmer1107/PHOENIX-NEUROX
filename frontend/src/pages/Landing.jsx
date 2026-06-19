import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import GlowButton from '../components/GlowButton';
import QuantumClock from '../components/QuantumClock';

const Landing = () => {
  const navigate = useNavigate();
  const [typingText, setTypingText] = useState('Detecting.');
  const phrases = ['Detecting.', 'Analyzing.', 'Migrating.', 'Protecting.'];
  const [showEnterpriseModal, setShowEnterpriseModal] = useState(false);
  const [showGovModal, setShowGovModal] = useState(false);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % phrases.length;
      setTypingText(phrases[i]);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen pt-20 pb-20 relative animate-[fadeIn_0.3s_ease-out]">
      {/* Section 1 - Hero */}
      <section className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-6xl max-w-4xl font-bold font-sans mb-8 leading-tight"
        >
          <span className="text-primary italic drop-shadow-[0_0_15px_rgba(0,255,136,0.5)]">
            "The quantum threat isn't coming. It's already here — in every byte of encrypted data waiting to be harvested."
          </span>
        </motion.h1>
        
        <div className="h-10 mb-12 flex items-center justify-center">
          <span className="text-2xl font-mono text-secondary animate-pulse">
            &gt; {typingText}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-6">
          <GlowButton variant="primary" onClick={() => navigate('/scanner')}>
            Scan Your Code &rarr;
          </GlowButton>
          <GlowButton variant="secondary" onClick={() => navigate('/dashboard')}>
            View Dashboard
          </GlowButton>
        </div>

        <div style={{
          marginTop: "64px",
          display: "flex",
          justifyContent: "center",
          padding: "0 24px",
        }}>
          <div style={{
            maxWidth: "780px",
            width: "100%",
            position: "relative",
            borderRadius: "16px",
            overflow: "hidden",
            background: "linear-gradient(135deg, rgba(0,255,136,0.04) 0%, rgba(0,212,255,0.03) 100%)",
            border: "1px solid rgba(0,255,136,0.2)",
            boxShadow: "0 0 40px rgba(0,255,136,0.06), 0 0 80px rgba(0,212,255,0.04)",
          }}>

            {/* Animated background glow blobs */}
            <div style={{
              position: "absolute", top: "-60px", left: "-60px",
              width: "220px", height: "220px",
              background: "radial-gradient(circle, rgba(0,255,136,0.08) 0%, transparent 70%)",
              pointerEvents: "none", zIndex: 0,
              animation: "slowPulse 4s ease-in-out infinite alternate",
            }} />
            <div style={{
              position: "absolute", bottom: "-40px", right: "-40px",
              width: "180px", height: "180px",
              background: "radial-gradient(circle, rgba(0,212,255,0.07) 0%, transparent 70%)",
              pointerEvents: "none", zIndex: 0,
              animation: "slowPulse 5s ease-in-out infinite alternate-reverse",
            }} />

            {/* Top accent line */}
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0,
              height: "2px",
              background: "linear-gradient(90deg, transparent, #00ff88, #00d4ff, transparent)",
              zIndex: 1,
            }} />

            {/* Content */}
            <div style={{ position: "relative", zIndex: 2, padding: "32px 36px 28px" }}>

              {/* Label row */}
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "20px",
              }}>
                {/* Animated lock icon */}
                <div style={{
                  width: "36px", height: "36px",
                  borderRadius: "8px",
                  background: "linear-gradient(135deg, rgba(0,255,136,0.15), rgba(0,212,255,0.1))",
                  border: "1px solid rgba(0,255,136,0.3)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "18px",
                  boxShadow: "0 0 12px rgba(0,255,136,0.2)",
                  flexShrink: 0,
                }}>
                  🔒
                </div>
                <div>
                  <div style={{
                    color: "#00ff88",
                    fontSize: "10px",
                    fontWeight: "800",
                    letterSpacing: "3px",
                    textTransform: "uppercase",
                    textShadow: "0 0 10px rgba(0,255,136,0.5)",
                  }}>
                    Zero-Knowledge Architecture
                  </div>
                  <div style={{
                    color: "rgba(255,255,255,0.3)",
                    fontSize: "10px",
                    letterSpacing: "1px",
                    marginTop: "2px",
                  }}>
                    Privacy-First Security Analysis
                  </div>
                </div>

                {/* Right side verified badge */}
                <div style={{
                  marginLeft: "auto",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  background: "rgba(0,255,136,0.06)",
                  border: "1px solid rgba(0,255,136,0.2)",
                  borderRadius: "20px",
                  padding: "4px 12px",
                  flexShrink: 0,
                }}>
                  <div style={{
                    width: "6px", height: "6px", borderRadius: "50%",
                    background: "#00ff88",
                    boxShadow: "0 0 8px #00ff88",
                    animation: "statusPulse 2s ease-in-out infinite",
                  }} />
                  <span style={{ color: "#00ff88", fontSize: "10px", fontWeight: "700" }}>
                    Verified Private
                  </span>
                </div>
              </div>

              {/* Quote */}
              <div style={{
                position: "relative",
                padding: "20px 24px",
                background: "rgba(0,0,0,0.25)",
                borderRadius: "10px",
                border: "1px solid rgba(255,255,255,0.06)",
                marginBottom: "24px",
              }}>
                {/* Large quote mark */}
                <div style={{
                  position: "absolute",
                  top: "-2px", left: "16px",
                  fontSize: "60px",
                  color: "#00ff88",
                  opacity: 0.15,
                  fontFamily: "Georgia, serif",
                  lineHeight: 1,
                  pointerEvents: "none",
                  userSelect: "none",
                }}>
                  "
                </div>
                <p style={{
                  color: "rgba(255,255,255,0.82)",
                  fontSize: "15px",
                  lineHeight: "1.8",
                  fontStyle: "italic",
                  fontWeight: "300",
                  margin: 0,
                  paddingLeft: "20px",
                  letterSpacing: "0.2px",
                }}>
                  Your code never leaves your machine. QuantumBridge performs all
                  cryptographic analysis locally — no source code is transmitted,
                  stored, or logged. Zero knowledge of your codebase means zero
                  risk of exposure.
                </p>
              </div>

              {/* Three pillars */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "12px",
              }}>
                {[
                  {
                    icon: "🧠",
                    label: "Local Analysis",
                    desc: "All scanning runs in your browser",
                    color: "#00ff88",
                  },
                  {
                    icon: "📡",
                    label: "No Data Sent",
                    desc: "Zero code transmission to servers",
                    color: "#00d4ff",
                  },
                  {
                    icon: "🛡️",
                    label: "Private by Design",
                    desc: "No logs, no storage, no tracking",
                    color: "#a855f7",
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: `1px solid ${item.color}22`,
                      borderRadius: "10px",
                      padding: "16px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      textAlign: "center",
                      gap: "8px",
                      transition: "all 0.3s ease",
                      cursor: "default",
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = `${item.color}08`;
                      e.currentTarget.style.border = `1px solid ${item.color}44`;
                      e.currentTarget.style.boxShadow = `0 0 20px ${item.color}11`;
                      e.currentTarget.style.transform = "translateY(-2px)";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                      e.currentTarget.style.border = `1px solid ${item.color}22`;
                      e.currentTarget.style.boxShadow = "none";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    {/* Icon circle */}
                    <div style={{
                      width: "44px", height: "44px",
                      borderRadius: "50%",
                      background: `linear-gradient(135deg, ${item.color}18, ${item.color}08)`,
                      border: `1px solid ${item.color}33`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "20px",
                      boxShadow: `0 0 12px ${item.color}15`,
                    }}>
                      {item.icon}
                    </div>
                    <div style={{
                      color: "#fff",
                      fontSize: "13px",
                      fontWeight: "700",
                    }}>
                      {item.label}
                    </div>
                    <div style={{
                      color: "rgba(255,255,255,0.4)",
                      fontSize: "11px",
                      lineHeight: "1.4",
                    }}>
                      {item.desc}
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom note */}
              <div style={{
                marginTop: "18px",
                paddingTop: "16px",
                borderTop: "1px solid rgba(255,255,255,0.05)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "16px",
                flexWrap: "wrap",
              }}>
                {[
                  "⚡ Instant local scanning",
                  "🔐 End-to-end privacy",
                  "✅ NIST-aligned analysis",
                ].map((tag, i) => (
                  <span key={i} style={{
                    color: "rgba(255,255,255,0.25)",
                    fontSize: "11px",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <style>{`
          @keyframes slowPulse {
            from { opacity: 0.5; transform: scale(1); }
            to { opacity: 1; transform: scale(1.15); }
          }
        `}</style>
      </section>

      {/* Section 2 - Problem Statement */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: '🔓', title: 'RSA & ECC Are Quantum-Vulnerable', body: 'Classical encryption algorithms will be broken by quantum computers within this decade.' },
            { icon: '⏳', title: 'Harvest Now, Decrypt Later', body: "Attackers are already collecting encrypted data today to decrypt it once quantum computers arrive." },
            { icon: '🌐', title: 'Billions of Systems at Risk', body: 'Banking, defense, cloud, and enterprise systems all need urgent cryptographic migration.' }
          ].map((card, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.2 }}
              className="glass-card p-8 glass-card-hover"
            >
              <div className="text-4xl mb-4">{card.icon}</div>
              <h3 className="text-xl font-bold text-white mb-3">{card.title}</h3>
              <p className="text-gray-400">{card.body}</p>
            </motion.div>
          ))}
        </div>
      </section>
      
      {/* ═══════════════════════════════════════════════
          SUBSCRIPTION / DEPLOYMENT MODELS SECTION
          Place this directly below the 3 problem cards
          ═══════════════════════════════════════════════ */}

      <section style={{
        padding: "80px 24px",
        maxWidth: "1200px",
        margin: "0 auto",
      }}>

        {/* Section heading */}
        <div style={{ textAlign: "center", marginBottom: "56px" }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: "rgba(0,255,136,0.06)",
            border: "1px solid rgba(0,255,136,0.2)",
            borderRadius: "20px",
            padding: "5px 16px",
            marginBottom: "16px",
          }}>
            <div style={{
              width: "6px", height: "6px", borderRadius: "50%",
              background: "#00ff88",
              boxShadow: "0 0 8px #00ff88",
              animation: "statusPulse 2s ease-in-out infinite",
            }} />
            <span style={{
              color: "#00ff88",
              fontSize: "11px",
              fontWeight: "700",
              letterSpacing: "2px",
              textTransform: "uppercase",
            }}>
              Deployment Options
            </span>
          </div>

          <h2 style={{
            color: "#fff",
            fontSize: "clamp(28px, 4vw, 42px)",
            fontWeight: "800",
            margin: "0 0 14px 0",
            letterSpacing: "-0.5px",
            lineHeight: 1.2,
          }}>
            Subscription
          </h2>
          <p style={{
            color: "rgba(255,255,255,0.4)",
            fontSize: "16px",
            maxWidth: "520px",
            margin: "0 auto",
            lineHeight: 1.6,
          }}>
            Choose the deployment model that fits your organization's
            security requirements and infrastructure.
          </p>
        </div>

        {/* Three model cards */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "24px",
          alignItems: "stretch",
        }}>

          {/* ── MODEL 1: For Company (SaaS) ── */}
          <div
            style={{
              background: "linear-gradient(160deg, rgba(0,255,136,0.06) 0%, rgba(0,0,0,0) 60%)",
              border: "1px solid rgba(0,255,136,0.25)",
              borderRadius: "16px",
              padding: "32px 28px",
              position: "relative",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              transition: "all 0.3s ease",
              cursor: "default",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.border = "1px solid rgba(0,255,136,0.5)";
              e.currentTarget.style.boxShadow = "0 0 30px rgba(0,255,136,0.1), 0 0 60px rgba(0,255,136,0.05)";
              e.currentTarget.style.transform = "translateY(-4px)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.border = "1px solid rgba(0,255,136,0.25)";
              e.currentTarget.style.boxShadow = "none";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            {/* Top glow */}
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0,
              height: "2px",
              background: "linear-gradient(90deg, transparent, #00ff88, transparent)",
            }} />

            {/* Most Popular badge */}
            <div style={{
              position: "absolute", top: "16px", right: "16px",
              background: "rgba(0,255,136,0.12)",
              border: "1px solid rgba(0,255,136,0.3)",
              borderRadius: "10px",
              padding: "3px 10px",
              fontSize: "9px",
              fontWeight: "800",
              color: "#00ff88",
              letterSpacing: "1px",
            }}>
              MOST POPULAR
            </div>

            {/* Icon */}
            <div style={{
              width: "52px", height: "52px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, rgba(0,255,136,0.15), rgba(0,255,136,0.05))",
              border: "1px solid rgba(0,255,136,0.25)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "24px",
              marginBottom: "20px",
              boxShadow: "0 0 16px rgba(0,255,136,0.15)",
            }}>
              🌐
            </div>

            {/* Model label */}
            <div style={{
              color: "#00ff88",
              fontSize: "10px",
              fontWeight: "800",
              letterSpacing: "2px",
              textTransform: "uppercase",
              marginBottom: "6px",
            }}>
              Model 1 — SaaS
            </div>

            {/* Heading */}
            <h3 style={{
              color: "#fff",
              fontSize: "22px",
              fontWeight: "800",
              margin: "0 0 12px 0",
            }}>
              For Company
            </h3>

            {/* Description */}
            <p style={{
              color: "rgba(255,255,255,0.5)",
              fontSize: "14px",
              lineHeight: "1.65",
              margin: "0 0 24px 0",
              flex: 1,
            }}>
              The simplest way to get started. Visit our platform, create an account,
              upload your code or connect your GitHub — everything runs on our
              secure cloud infrastructure with zero setup required.
            </p>

            {/* Feature list */}
            <div style={{ marginBottom: "24px" }}>
              {[
                "Instant access — no installation",
                "GitHub & GitLab integration",
                "Cloud-hosted scan engine",
                "Dashboard & reports included",
                "Auto-updates & new detections",
              ].map((feature, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "flex-start", gap: "10px",
                  marginBottom: "9px",
                }}>
                  <span style={{
                    color: "#00ff88", fontSize: "12px",
                    flexShrink: 0, marginTop: "1px",
                    textShadow: "0 0 8px rgba(0,255,136,0.5)",
                  }}>✓</span>
                  <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "13px" }}>
                    {feature}
                  </span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <button
              onClick={() => navigate('/scanner')}
              style={{
                background: "linear-gradient(135deg, #00ff88, #00cc6a)",
                color: "#000",
                border: "none",
                borderRadius: "9px",
                padding: "13px",
                fontSize: "14px",
                fontWeight: "800",
                cursor: "pointer",
                width: "100%",
                boxShadow: "0 4px 20px rgba(0,255,136,0.3)",
                transition: "all 0.2s ease",
                letterSpacing: "0.3px",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = "scale(1.02)";
                e.currentTarget.style.boxShadow = "0 4px 30px rgba(0,255,136,0.5)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,255,136,0.3)";
              }}
            >
              Start Scanning Free →
            </button>
          </div>

          {/* ── MODEL 2: For Enterprises (On-Premise) ── */}
          <div
            style={{
              background: "linear-gradient(160deg, rgba(0,212,255,0.05) 0%, rgba(0,0,0,0) 60%)",
              border: "1px solid rgba(0,212,255,0.2)",
              borderRadius: "16px",
              padding: "32px 28px",
              position: "relative",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              transition: "all 0.3s ease",
              cursor: "default",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.border = "1px solid rgba(0,212,255,0.45)";
              e.currentTarget.style.boxShadow = "0 0 30px rgba(0,212,255,0.1), 0 0 60px rgba(0,212,255,0.04)";
              e.currentTarget.style.transform = "translateY(-4px)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.border = "1px solid rgba(0,212,255,0.2)";
              e.currentTarget.style.boxShadow = "none";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            {/* Top glow */}
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0,
              height: "2px",
              background: "linear-gradient(90deg, transparent, #00d4ff, transparent)",
            }} />

            {/* Icon */}
            <div style={{
              width: "52px", height: "52px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, rgba(0,212,255,0.15), rgba(0,212,255,0.05))",
              border: "1px solid rgba(0,212,255,0.25)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "24px",
              marginBottom: "20px",
              boxShadow: "0 0 16px rgba(0,212,255,0.15)",
            }}>
              🏢
            </div>

            {/* Model label */}
            <div style={{
              color: "#00d4ff",
              fontSize: "10px",
              fontWeight: "800",
              letterSpacing: "2px",
              textTransform: "uppercase",
              marginBottom: "6px",
            }}>
              Model 2 — On-Premise
            </div>

            {/* Heading */}
            <h3 style={{
              color: "#fff",
              fontSize: "22px",
              fontWeight: "800",
              margin: "0 0 12px 0",
            }}>
              For Enterprises
            </h3>

            {/* Description */}
            <p style={{
              color: "rgba(255,255,255,0.5)",
              fontSize: "14px",
              lineHeight: "1.65",
              margin: "0 0 24px 0",
              flex: 1,
            }}>
              Download and deploy QuantumBridge entirely within your own
              infrastructure. Runs inside your firewall — your code never
              leaves your network. Built for organizations with strict
              data residency requirements.
            </p>

            {/* Enterprise Pricing Display */}
            <div style={{
              display: "flex",
              alignItems: "flex-end",
              gap: "6px",
              marginBottom: "20px",
              padding: "16px 20px",
              background: "rgba(0,212,255,0.05)",
              border: "1px solid rgba(0,212,255,0.15)",
              borderRadius: "10px",
            }}>
              <div style={{
                color: "#00d4ff",
                fontSize: "42px",
                fontWeight: "900",
                lineHeight: 1,
                textShadow: "0 0 20px rgba(0,212,255,0.4)",
              }}>
                $9
              </div>
              <div style={{ paddingBottom: "6px" }}>
                <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "14px", fontWeight: "600" }}>
                  / month
                </div>
                <div style={{ color: "rgba(255,255,255,0.3)", fontSize: "11px" }}>
                  per organization
                </div>
              </div>
              <div style={{
                marginLeft: "auto",
                background: "rgba(0,212,255,0.1)",
                border: "1px solid rgba(0,212,255,0.25)",
                borderRadius: "6px",
                padding: "4px 10px",
                fontSize: "10px",
                fontWeight: "700",
                color: "#00d4ff",
                letterSpacing: "0.5px",
              }}>
                BILLED MONTHLY
              </div>
            </div>

            {/* Feature list */}
            <div style={{ marginBottom: "24px" }}>
              {[
                "Deployed on your own servers",
                "Runs inside your firewall",
                "You never share code externally",
                "Full audit log & SIEM integration",
                "Enterprise SLA & support",
              ].map((feature, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "flex-start", gap: "10px",
                  marginBottom: "9px",
                }}>
                  <span style={{
                    color: "#00d4ff", fontSize: "12px",
                    flexShrink: 0, marginTop: "1px",
                    textShadow: "0 0 8px rgba(0,212,255,0.5)",
                  }}>✓</span>
                  <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "13px" }}>
                    {feature}
                  </span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <button
              onClick={() => setShowEnterpriseModal(true)}
              style={{
                background: "transparent",
                color: "#00d4ff",
                border: "1px solid rgba(0,212,255,0.4)",
                borderRadius: "9px",
                padding: "13px",
                fontSize: "14px",
                fontWeight: "700",
                cursor: "pointer",
                width: "100%",
                transition: "all 0.2s ease",
                letterSpacing: "0.3px",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = "rgba(0,212,255,0.08)";
                e.currentTarget.style.borderColor = "rgba(0,212,255,0.7)";
                e.currentTarget.style.boxShadow = "0 0 20px rgba(0,212,255,0.2)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.borderColor = "rgba(0,212,255,0.4)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              Get Enterprise Plan — $9/mo →
            </button>
          </div>

          {/* ── MODEL 3: For Government/Defense (Air-Gapped) ── */}
          <div
            style={{
              background: "linear-gradient(160deg, rgba(168,85,247,0.05) 0%, rgba(0,0,0,0) 60%)",
              border: "1px solid rgba(168,85,247,0.2)",
              borderRadius: "16px",
              padding: "32px 28px",
              position: "relative",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              transition: "all 0.3s ease",
              cursor: "default",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.border = "1px solid rgba(168,85,247,0.45)";
              e.currentTarget.style.boxShadow = "0 0 30px rgba(168,85,247,0.1), 0 0 60px rgba(168,85,247,0.04)";
              e.currentTarget.style.transform = "translateY(-4px)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.border = "1px solid rgba(168,85,247,0.2)";
              e.currentTarget.style.boxShadow = "none";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            {/* Top glow */}
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0,
              height: "2px",
              background: "linear-gradient(90deg, transparent, #a855f7, transparent)",
            }} />

            {/* Classified badge */}
            <div style={{
              position: "absolute", top: "16px", right: "16px",
              background: "rgba(168,85,247,0.1)",
              border: "1px solid rgba(168,85,247,0.3)",
              borderRadius: "10px",
              padding: "3px 10px",
              fontSize: "9px",
              fontWeight: "800",
              color: "#a855f7",
              letterSpacing: "1px",
            }}>
              AIR-GAPPED
            </div>

            {/* Icon */}
            <div style={{
              width: "52px", height: "52px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, rgba(168,85,247,0.15), rgba(168,85,247,0.05))",
              border: "1px solid rgba(168,85,247,0.25)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "24px",
              marginBottom: "20px",
              boxShadow: "0 0 16px rgba(168,85,247,0.15)",
            }}>
              🛡️
            </div>

            {/* Model label */}
            <div style={{
              color: "#a855f7",
              fontSize: "10px",
              fontWeight: "800",
              letterSpacing: "2px",
              textTransform: "uppercase",
              marginBottom: "6px",
            }}>
              Model 3 — Air-Gapped
            </div>

            {/* Heading */}
            <h3 style={{
              color: "#fff",
              fontSize: "22px",
              fontWeight: "800",
              margin: "0 0 12px 0",
            }}>
              For Government / Defense
            </h3>

            {/* Description */}
            <p style={{
              color: "rgba(255,255,255,0.5)",
              fontSize: "14px",
              lineHeight: "1.65",
              margin: "0 0 24px 0",
              flex: 1,
            }}>
              Maximum isolation for classified environments. Runs on a completely
              isolated network with zero internet connectivity. No phone-home,
              no telemetry, no external dependencies — ever. Offline license
              verification included.
            </p>

            {/* Government Pricing Display */}
            <div style={{
              display: "flex",
              alignItems: "flex-end",
              gap: "6px",
              marginBottom: "20px",
              padding: "16px 20px",
              background: "rgba(168,85,247,0.05)",
              border: "1px solid rgba(168,85,247,0.15)",
              borderRadius: "10px",
            }}>
              <div style={{
                color: "#a855f7",
                fontSize: "42px",
                fontWeight: "900",
                lineHeight: 1,
                textShadow: "0 0 20px rgba(168,85,247,0.4)",
              }}>
                $99
              </div>
              <div style={{ paddingBottom: "6px" }}>
                <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "14px", fontWeight: "600" }}>
                  / month
                </div>
                <div style={{ color: "rgba(255,255,255,0.3)", fontSize: "11px" }}>
                  per deployment
                </div>
              </div>
              <div style={{
                marginLeft: "auto",
                background: "rgba(168,85,247,0.1)",
                border: "1px solid rgba(168,85,247,0.25)",
                borderRadius: "6px",
                padding: "4px 10px",
                fontSize: "10px",
                fontWeight: "700",
                color: "#a855f7",
                letterSpacing: "0.5px",
              }}>
                AIR-GAPPED
              </div>
            </div>

            {/* Feature list */}
            <div style={{ marginBottom: "24px" }}>
              {[
                "Zero internet connection required",
                "Completely isolated network deployment",
                "No telemetry or phone-home",
                "Offline license verification",
                "FISMA / NIST 800-53 aligned",
              ].map((feature, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "flex-start", gap: "10px",
                  marginBottom: "9px",
                }}>
                  <span style={{
                    color: "#a855f7", fontSize: "12px",
                    flexShrink: 0, marginTop: "1px",
                    textShadow: "0 0 8px rgba(168,85,247,0.5)",
                  }}>✓</span>
                  <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "13px" }}>
                    {feature}
                  </span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <button
              onClick={() => setShowGovModal(true)}
              style={{
                background: "transparent",
                color: "#a855f7",
                border: "1px solid rgba(168,85,247,0.4)",
                borderRadius: "9px",
                padding: "13px",
                fontSize: "14px",
                fontWeight: "700",
                cursor: "pointer",
                width: "100%",
                transition: "all 0.2s ease",
                letterSpacing: "0.3px",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = "rgba(168,85,247,0.08)";
                e.currentTarget.style.borderColor = "rgba(168,85,247,0.7)";
                e.currentTarget.style.boxShadow = "0 0 20px rgba(168,85,247,0.2)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.borderColor = "rgba(168,85,247,0.4)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              Request Deployment — $99/mo →
            </button>
          </div>

        </div>

        {/* Bottom comparison note */}
        <div style={{
          marginTop: "40px",
          padding: "20px 28px",
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: "12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "32px",
          flexWrap: "wrap",
        }}>
          {[
            { icon: "🌐", label: "SaaS", desc: "Runs on our cloud", color: "#00ff88" },
            { icon: "🏢", label: "On-Premise", desc: "Runs on your servers", color: "#00d4ff" },
            { icon: "🛡️", label: "Air-Gapped", desc: "Runs on isolated network", color: "#a855f7" },
          ].map((item, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: "10px",
            }}>
              <span style={{ fontSize: "16px" }}>{item.icon}</span>
              <div>
                <span style={{ color: item.color, fontWeight: "700", fontSize: "13px" }}>
                  {item.label}
                </span>
                <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "12px", marginLeft: "6px" }}>
                  — {item.desc}
                </span>
              </div>
              {i < 2 && (
                <span style={{
                  color: "rgba(255,255,255,0.1)",
                  fontSize: "20px",
                  marginLeft: "16px",
                }}>
                  |
                </span>
              )}
            </div>
          ))}
        </div>

      </section>

      {/* Section 5 - Quantum Clock */}
      <QuantumClock />

      {showEnterpriseModal && (
        <div
          onClick={() => setShowEnterpriseModal(false)}
          style={{
            position: "fixed", inset: 0,
            background: "rgba(0,0,0,0.85)",
            backdropFilter: "blur(8px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 9999, padding: "20px",
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: "linear-gradient(160deg, #0d1117 0%, #0a0f14 100%)",
              border: "1px solid rgba(0,212,255,0.2)",
              borderRadius: "20px",
              width: "100%", maxWidth: "500px",
              boxShadow: "0 0 80px rgba(0,212,255,0.12), 0 30px 60px rgba(0,0,0,0.7)",
              animation: "modalSlideIn 0.3s cubic-bezier(0.16,1,0.3,1)",
              overflow: "hidden",
              position: "relative",
            }}
          >
            {/* Animated top accent line */}
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0, height: "2px",
              background: "linear-gradient(90deg, transparent, #00d4ff, #00ff88, transparent)",
              zIndex: 2,
            }} />

            {/* Background glow blobs */}
            <div style={{
              position: "absolute", top: "-60px", right: "-60px",
              width: "200px", height: "200px",
              background: "radial-gradient(circle, rgba(0,212,255,0.08) 0%, transparent 70%)",
              pointerEvents: "none", zIndex: 0,
            }} />
            <div style={{
              position: "absolute", bottom: "-40px", left: "-40px",
              width: "160px", height: "160px",
              background: "radial-gradient(circle, rgba(0,255,136,0.05) 0%, transparent 70%)",
              pointerEvents: "none", zIndex: 0,
            }} />

            {/* Header */}
            <div style={{
              padding: "28px 28px 0",
              position: "relative", zIndex: 1,
            }}>
              <div style={{
                display: "flex", justifyContent: "space-between",
                alignItems: "flex-start", marginBottom: "20px",
              }}>
                {/* Left: icon + label */}
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{
                    width: "48px", height: "48px", borderRadius: "12px",
                    background: "linear-gradient(135deg, rgba(0,212,255,0.2), rgba(0,212,255,0.05))",
                    border: "1px solid rgba(0,212,255,0.3)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "22px",
                    boxShadow: "0 0 20px rgba(0,212,255,0.15)",
                  }}>
                    🏢
                  </div>
                  <div>
                    <div style={{
                      color: "#00d4ff", fontSize: "10px", fontWeight: "800",
                      letterSpacing: "2.5px", textTransform: "uppercase",
                      textShadow: "0 0 10px rgba(0,212,255,0.5)",
                    }}>
                      Enterprise Plan
                    </div>
                    <div style={{ color: "#fff", fontSize: "18px", fontWeight: "800", marginTop: "2px" }}>
                      On-Premise Deployment
                    </div>
                  </div>
                </div>

                {/* Close button */}
                <button
                  onClick={() => setShowEnterpriseModal(false)}
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "rgba(255,255,255,0.4)",
                    width: "34px", height: "34px", borderRadius: "9px",
                    fontSize: "16px", cursor: "pointer", flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "#fff"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "rgba(255,255,255,0.4)"; }}
                >✕</button>
              </div>

              {/* Price hero block */}
              <div style={{
                background: "linear-gradient(135deg, rgba(0,212,255,0.08), rgba(0,212,255,0.03))",
                border: "1px solid rgba(0,212,255,0.15)",
                borderRadius: "14px",
                padding: "20px 24px",
                display: "flex", alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "24px",
                flexWrap: "wrap", gap: "12px",
              }}>
                <div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
                    <span style={{
                      color: "#00d4ff", fontSize: "52px", fontWeight: "900",
                      lineHeight: 1, textShadow: "0 0 30px rgba(0,212,255,0.6)",
                      fontVariantNumeric: "tabular-nums",
                    }}>$9</span>
                    <div style={{ paddingBottom: "8px" }}>
                      <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "16px", fontWeight: "600" }}>
                        / month
                      </div>
                      <div style={{ color: "rgba(255,255,255,0.3)", fontSize: "11px" }}>
                        per organization
                      </div>
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", alignItems: "flex-end" }}>
                  <div style={{
                    background: "rgba(0,212,255,0.12)",
                    border: "1px solid rgba(0,212,255,0.25)",
                    borderRadius: "8px", padding: "5px 12px",
                    fontSize: "10px", fontWeight: "800",
                    color: "#00d4ff", letterSpacing: "1px",
                  }}>
                    BILLED MONTHLY
                  </div>
                  <div style={{
                    background: "rgba(0,255,136,0.08)",
                    border: "1px solid rgba(0,255,136,0.2)",
                    borderRadius: "8px", padding: "5px 12px",
                    fontSize: "10px", fontWeight: "700",
                    color: "#00ff88",
                  }}>
                    ✓ No commitment
                  </div>
                </div>
              </div>
            </div>

            {/* Features list */}
            <div style={{ padding: "0 28px 20px", position: "relative", zIndex: 1 }}>
              <div style={{
                color: "rgba(255,255,255,0.3)", fontSize: "9px",
                fontWeight: "800", letterSpacing: "2px",
                textTransform: "uppercase", marginBottom: "12px",
              }}>
                Everything Included
              </div>
              <div style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.05)",
                borderRadius: "12px",
                overflow: "hidden",
              }}>
                {[
                  { icon: "🖥️", text: "Deploy on your own servers — full control" },
                  { icon: "🔒", text: "Runs inside your firewall — data stays private" },
                  { icon: "📊", text: "Full dashboard, scanner & migration tools" },
                  { icon: "🔄", text: "Unlimited scans across all repositories" },
                  { icon: "📋", text: "Compliance certificates & PDF reports" },
                  { icon: "🤖", text: "QuantumShield AI assistant included" },
                  { icon: "📞", text: "Priority email support & onboarding" },
                ].map((item, i, arr) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", gap: "14px",
                    padding: "13px 18px",
                    borderBottom: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                    transition: "background 0.15s ease",
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(0,212,255,0.03)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <span style={{ fontSize: "17px", flexShrink: 0, width: "24px", textAlign: "center" }}>
                      {item.icon}
                    </span>
                    <span style={{
                      color: "rgba(255,255,255,0.75)", fontSize: "13px",
                      flex: 1, lineHeight: 1.4,
                    }}>
                      {item.text}
                    </span>
                    <div style={{
                      width: "20px", height: "20px", borderRadius: "50%",
                      background: "rgba(0,212,255,0.12)",
                      border: "1px solid rgba(0,212,255,0.3)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
                    }}>
                      <span style={{ color: "#00d4ff", fontSize: "11px", fontWeight: "800" }}>✓</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA footer */}
            <div style={{
              padding: "16px 28px 28px",
              borderTop: "1px solid rgba(255,255,255,0.05)",
              position: "relative", zIndex: 1,
            }}>
              <button
                onClick={() => {
                  window.open(
                    "mailto:phoenix.cyberonites@gla.ac.in?subject=Enterprise Plan Inquiry — QuantumBridge ($9/month)&body=Hello Team Phoenix,%0A%0AI am interested in the QuantumBridge Enterprise On-Premise Plan ($9/month).%0A%0AOrganization:%0ATeam Size:%0AUse Case:%0A%0APlease get in touch.",
                    "_blank"
                  );
                }}
                style={{
                  background: "linear-gradient(135deg, #00d4ff, #0099cc)",
                  color: "#000", border: "none", borderRadius: "11px",
                  padding: "15px", fontSize: "15px", fontWeight: "800",
                  cursor: "pointer", width: "100%",
                  boxShadow: "0 4px 24px rgba(0,212,255,0.35)",
                  transition: "all 0.2s ease", letterSpacing: "0.4px",
                  display: "flex", alignItems: "center",
                  justifyContent: "center", gap: "8px",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,212,255,0.5)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 24px rgba(0,212,255,0.35)";
                }}
              >
                <span style={{ fontSize: "16px" }}>✉</span>
                Contact Us — $9/month
                <span style={{ fontSize: "16px" }}>→</span>
              </button>
              <p style={{
                color: "rgba(255,255,255,0.2)", fontSize: "11px",
                textAlign: "center", margin: "10px 0 0 0", lineHeight: 1.5,
              }}>
                No commitment · Cancel anytime · Setup in under 30 minutes
              </p>
            </div>
          </div>
        </div>
      )}

      {showGovModal && (
        <div
          onClick={() => setShowGovModal(false)}
          style={{
            position: "fixed", inset: 0,
            background: "rgba(0,0,0,0.88)",
            backdropFilter: "blur(8px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 9999, padding: "20px",
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: "linear-gradient(160deg, #0f0d14 0%, #0a0a0f 100%)",
              border: "1px solid rgba(168,85,247,0.2)",
              borderRadius: "20px",
              width: "100%", maxWidth: "500px",
              boxShadow: "0 0 80px rgba(168,85,247,0.12), 0 30px 60px rgba(0,0,0,0.75)",
              animation: "modalSlideIn 0.3s cubic-bezier(0.16,1,0.3,1)",
              overflow: "hidden",
              position: "relative",
            }}
          >
            {/* Animated top accent line */}
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0, height: "2px",
              background: "linear-gradient(90deg, transparent, #a855f7, #6366f1, transparent)",
              zIndex: 2,
            }} />

            {/* Background glow blobs */}
            <div style={{
              position: "absolute", top: "-60px", right: "-60px",
              width: "200px", height: "200px",
              background: "radial-gradient(circle, rgba(168,85,247,0.08) 0%, transparent 70%)",
              pointerEvents: "none", zIndex: 0,
            }} />
            <div style={{
              position: "absolute", bottom: "-40px", left: "-40px",
              width: "160px", height: "160px",
              background: "radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)",
              pointerEvents: "none", zIndex: 0,
            }} />

            {/* Header */}
            <div style={{
              padding: "28px 28px 0",
              position: "relative", zIndex: 1,
            }}>
              <div style={{
                display: "flex", justifyContent: "space-between",
                alignItems: "flex-start", marginBottom: "20px",
              }}>
                {/* Left: icon + label */}
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{
                    width: "48px", height: "48px", borderRadius: "12px",
                    background: "linear-gradient(135deg, rgba(168,85,247,0.2), rgba(168,85,247,0.05))",
                    border: "1px solid rgba(168,85,247,0.3)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "22px",
                    boxShadow: "0 0 20px rgba(168,85,247,0.15)",
                  }}>
                    🛡️
                  </div>
                  <div>
                    <div style={{
                      color: "#a855f7", fontSize: "10px", fontWeight: "800",
                      letterSpacing: "2.5px", textTransform: "uppercase",
                      textShadow: "0 0 10px rgba(168,85,247,0.5)",
                    }}>
                      Government / Defense
                    </div>
                    <div style={{ color: "#fff", fontSize: "18px", fontWeight: "800", marginTop: "2px" }}>
                      Air-Gapped Deployment
                    </div>
                  </div>
                </div>

                {/* Close button */}
                <button
                  onClick={() => setShowGovModal(false)}
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "rgba(255,255,255,0.4)",
                    width: "34px", height: "34px", borderRadius: "9px",
                    fontSize: "16px", cursor: "pointer", flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "#fff"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "rgba(255,255,255,0.4)"; }}
                >✕</button>
              </div>

              {/* Price hero block */}
              <div style={{
                background: "linear-gradient(135deg, rgba(168,85,247,0.08), rgba(168,85,247,0.03))",
                border: "1px solid rgba(168,85,247,0.15)",
                borderRadius: "14px",
                padding: "20px 24px",
                display: "flex", alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "24px",
                flexWrap: "wrap", gap: "12px",
              }}>
                <div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
                    <span style={{
                      color: "#a855f7", fontSize: "52px", fontWeight: "900",
                      lineHeight: 1, textShadow: "0 0 30px rgba(168,85,247,0.6)",
                      fontVariantNumeric: "tabular-nums",
                    }}>$99</span>
                    <div style={{ paddingBottom: "8px" }}>
                      <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "16px", fontWeight: "600" }}>
                        / month
                      </div>
                      <div style={{ color: "rgba(255,255,255,0.3)", fontSize: "11px" }}>
                        per deployment
                      </div>
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", alignItems: "flex-end" }}>
                  <div style={{
                    background: "rgba(168,85,247,0.12)",
                    border: "1px solid rgba(168,85,247,0.25)",
                    borderRadius: "8px", padding: "5px 12px",
                    fontSize: "10px", fontWeight: "800",
                    color: "#a855f7", letterSpacing: "1px",
                  }}>
                    AIR-GAPPED
                  </div>
                  <div style={{
                    background: "rgba(255,68,68,0.08)",
                    border: "1px solid rgba(255,68,68,0.2)",
                    borderRadius: "8px", padding: "5px 12px",
                    fontSize: "10px", fontWeight: "700",
                    color: "#ff6666",
                  }}>
                    🔒 Classified Ready
                  </div>
                </div>
              </div>
            </div>

            {/* Features list */}
            <div style={{ padding: "0 28px 16px", position: "relative", zIndex: 1 }}>
              <div style={{
                color: "rgba(255,255,255,0.3)", fontSize: "9px",
                fontWeight: "800", letterSpacing: "2px",
                textTransform: "uppercase", marginBottom: "12px",
              }}>
                Everything Included
              </div>
              <div style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.05)",
                borderRadius: "12px",
                overflow: "hidden",
              }}>
                {[
                  { icon: "🔌", text: "Zero internet required — fully air-gapped" },
                  { icon: "🚫", text: "No telemetry, no phone-home, ever" },
                  { icon: "🔑", text: "Offline license verification system" },
                  { icon: "📋", text: "FISMA / NIST 800-53 compliance aligned" },
                  { icon: "🏛️", text: "Cleared personnel support available" },
                  { icon: "🔐", text: "Full source audit rights on request" },
                  { icon: "⚙️", text: "Custom integration & dedicated deployment" },
                ].map((item, i, arr) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", gap: "14px",
                    padding: "13px 18px",
                    borderBottom: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                    transition: "background 0.15s ease",
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(168,85,247,0.04)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <span style={{ fontSize: "17px", flexShrink: 0, width: "24px", textAlign: "center" }}>
                      {item.icon}
                    </span>
                    <span style={{
                      color: "rgba(255,255,255,0.75)", fontSize: "13px",
                      flex: 1, lineHeight: 1.4,
                    }}>
                      {item.text}
                    </span>
                    <div style={{
                      width: "20px", height: "20px", borderRadius: "50%",
                      background: "rgba(168,85,247,0.12)",
                      border: "1px solid rgba(168,85,247,0.3)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
                    }}>
                      <span style={{ color: "#a855f7", fontSize: "11px", fontWeight: "800" }}>✓</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Security note */}
            <div style={{
              margin: "0 28px 16px",
              padding: "14px 18px",
              background: "linear-gradient(135deg, rgba(168,85,247,0.06), rgba(99,102,241,0.04))",
              border: "1px solid rgba(168,85,247,0.2)",
              borderLeft: "3px solid #a855f7",
              borderRadius: "10px",
              display: "flex", gap: "12px", alignItems: "flex-start",
              position: "relative", zIndex: 1,
            }}>
              <span style={{ fontSize: "18px", flexShrink: 0, marginTop: "1px" }}>⚠️</span>
              <div>
                <div style={{
                  color: "#a855f7", fontSize: "10px", fontWeight: "800",
                  letterSpacing: "1.5px", marginBottom: "5px",
                }}>
                  SECURITY NOTE
                </div>
                <div style={{
                  color: "rgba(255,255,255,0.5)", fontSize: "12px", lineHeight: 1.6,
                }}>
                  Designed for classified and sensitive environments. All communications
                  are handled through secure government procurement channels.
                </div>
              </div>
            </div>

            {/* CTA footer */}
            <div style={{
              padding: "16px 28px 28px",
              borderTop: "1px solid rgba(255,255,255,0.05)",
              position: "relative", zIndex: 1,
            }}>
              <button
                onClick={() => {
                  window.open(
                    "mailto:phoenix.cyberonites@gla.ac.in?subject=Government/Defense Deployment Inquiry — QuantumBridge ($99/month)&body=Hello Team Phoenix,%0A%0AI am interested in the QuantumBridge Air-Gapped Government/Defense Deployment ($99/month).%0A%0AOrganization / Agency:%0AClassification Level:%0ADeployment Environment:%0ANumber of Users:%0AUse Case:%0A%0APlease contact us through secure channels.",
                    "_blank"
                  );
                }}
                style={{
                  background: "linear-gradient(135deg, #a855f7, #7c3aed)",
                  color: "#fff", border: "none", borderRadius: "11px",
                  padding: "15px", fontSize: "15px", fontWeight: "800",
                  cursor: "pointer", width: "100%",
                  boxShadow: "0 4px 24px rgba(168,85,247,0.35)",
                  transition: "all 0.2s ease", letterSpacing: "0.4px",
                  display: "flex", alignItems: "center",
                  justifyContent: "center", gap: "8px",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 8px 32px rgba(168,85,247,0.5)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 24px rgba(168,85,247,0.35)";
                }}
              >
                <span style={{ fontSize: "16px" }}>🛡️</span>
                Request Classified Deployment — $99/mo
                <span style={{ fontSize: "16px" }}>→</span>
              </button>
              <p style={{
                color: "rgba(255,255,255,0.2)", fontSize: "11px",
                textAlign: "center", margin: "10px 0 0 0", lineHeight: 1.5,
              }}>
                Procurement through official government channels available
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Landing;
