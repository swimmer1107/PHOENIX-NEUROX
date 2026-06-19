import { useState, useEffect, useRef } from "react";
import { useAIAssistant } from "../hooks/useAIAssistant.jsx";
import API_BASE_URL from "../apiConfig.js";

const SUGGESTED_PROMPTS = [
  "Is RSA-2048 still safe to use?",
  "What is Harvest Now, Decrypt Later?",
  "How do I migrate from ECDSA to ML-DSA?",
  "Explain ML-KEM in simple terms",
  "How urgent is post-quantum migration?",
];

export default function AIAssistantDrawer({ isOpen, onClose }) {
  const { scanContext } = useAIAssistant();
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "[SAFE] Hello! I'm **QuantumShield**, your post-quantum security AI.\n\nI can help you:\n• Assess cryptographic vulnerabilities\n• Plan your PQC migration strategy\n• Explain NIST standards (FIPS 203/204/205)\n• Evaluate your quantum readiness\n\nWhat would you like to analyze today?",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape" && isOpen) onClose(); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  const sendMessage = async (text) => {
    const messageText = text || input.trim();
    if (!messageText || isLoading) return;
    setInput("");

    const userMsg = {
      role: "user",
      content: messageText,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      // Build conversation history (exclude the welcome message from API history)
      const history = messages
        .filter(m => m.role !== "assistant" || messages.indexOf(m) > 0)
        .map(m => ({ role: m.role, content: m.content }));

      // Route through backend — passes real scan context for context-aware responses
      const response = await fetch(`${API_BASE_URL}/api/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: messageText,
          history,
          scan_context: scanContext || null,  // real scan data from last scan
        }),
      });

      if (!response.ok) throw new Error("Backend error");
      const data = await response.json();
      const aiText = data.response || "I encountered an issue. Please try again.";

      setMessages(prev => [...prev, {
        role: "assistant",
        content: aiText,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }]);
    } catch (err) {
      // Graceful fallback — never show a crash, give useful offline message
      const offlineMsg = scanContext
        ? `[MEDIUM] I'm temporarily offline but your last scan showed: **${scanContext.risk?.level || "UNKNOWN"}** risk (${scanContext.risk?.score ?? "N/A"}/100) for **${scanContext.repo_name || "your file"}**. Check the Scanner page for full details.`
        : "[SAFE] I'm temporarily offline. Run a scan on the Scanner page and I'll analyze your repository's vulnerabilities, risk score, and migration recommendations once I reconnect.";

      setMessages(prev => [...prev, {
        role: "assistant",
        content: offlineMsg,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Format message with basic markdown-like rendering
  const formatMessage = (content) => {
    const lines = content.split("\n");
    return lines.map((line, i) => {
      // Risk badge line
      if (line.match(/^\[(CRITICAL|HIGH|MEDIUM|LOW|SAFE)\]/)) {
        const badge = line.match(/^\[(CRITICAL|HIGH|MEDIUM|LOW|SAFE)\]/)[1];
        const badgeColors = { CRITICAL: "#ff4444", HIGH: "#ffaa00", MEDIUM: "#00d4ff", LOW: "#a855f7", SAFE: "#00ff88" };
        const rest = line.replace(/^\[(CRITICAL|HIGH|MEDIUM|LOW|SAFE)\]/, "").trim();
        return (
          <div key={i} style={{ marginBottom: "6px" }}>
            <span style={{
              background: `${badgeColors[badge]}22`,
              border: `1px solid ${badgeColors[badge]}`,
              color: badgeColors[badge],
              padding: "2px 8px", borderRadius: "4px",
              fontSize: "10px", fontWeight: "800",
              letterSpacing: "1px", marginRight: "8px",
            }}>
              {badge}
            </span>
            <span style={{ color: "#fff", fontWeight: "600" }}>{rest}</span>
          </div>
        );
      }
      // Bold text **...**
      const boldFormatted = line.replace(/\*\*(.*?)\*\*/g, (_, text) => `<strong style="color:#fff">${text}</strong>`);
      // Bullet points
      if (line.startsWith("•") || line.startsWith("-")) {
        return (
          <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "3px", paddingLeft: "4px" }}>
            <span style={{ color: "#00ff88", flexShrink: 0 }}>•</span>
            <span style={{ color: "rgba(255,255,255,0.8)", fontSize: "13px" }}
              dangerouslySetInnerHTML={{ __html: boldFormatted.replace(/^[•-]\s*/, "") }} />
          </div>
        );
      }
      if (line.trim() === "") return <br key={i} />;
      return (
        <div key={i} style={{ color: "rgba(255,255,255,0.8)", fontSize: "13px", marginBottom: "2px" }}
          dangerouslySetInnerHTML={{ __html: boldFormatted }} />
      );
    });
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0,
          background: "rgba(0,0,0,0.4)",
          backdropFilter: "blur(2px)",
          zIndex: 9998,
        }}
      />

      {/* Drawer */}
      <div style={{
        position: "fixed",
        top: 0, right: 0, bottom: 0,
        width: "100%", maxWidth: "420px",
        background: "#0a0a0f",
        borderLeft: "1px solid rgba(0,255,136,0.15)",
        boxShadow: "-20px 0 60px rgba(0,0,0,0.6)",
        display: "flex", flexDirection: "column",
        zIndex: 9999,
        animation: "drawerSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
      }}>

        {/* Header */}
        <div style={{
          padding: "20px",
          borderBottom: "1px solid rgba(0,255,136,0.1)",
          background: "rgba(0,255,136,0.03)",
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              {/* AI Avatar */}
              <div style={{
                width: "42px", height: "42px", borderRadius: "50%",
                background: "linear-gradient(135deg, #00ff88, #00d4ff)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "20px", flexShrink: 0,
                boxShadow: "0 0 15px rgba(0,255,136,0.4)",
              }}>
                🛡️
              </div>
              <div>
                <div style={{ color: "#fff", fontWeight: "800", fontSize: "16px" }}>
                  QuantumShield <span style={{ color: "#00ff88" }}>AI</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "2px" }}>
                  <div style={{
                    width: "7px", height: "7px", borderRadius: "50%",
                    background: "#00ff88",
                    boxShadow: "0 0 8px #00ff88",
                    animation: "statusPulse 2s ease-in-out infinite",
                  }} />
                  <span style={{ color: "#00ff88", fontSize: "11px", fontWeight: "500" }}>Online — PQC Expert Mode</span>
                </div>
              </div>
            </div>

            {/* Clear + Close buttons */}
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={() => setMessages([{
                  role: "assistant",
                  content: "[SAFE] Chat cleared. How can I help you with your quantum security today?",
                  time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                }])}
                title="Clear chat"
                style={{
                  background: "transparent",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.4)",
                  width: "32px", height: "32px",
                  borderRadius: "8px", fontSize: "14px",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "#fff"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.4)"; }}
              >
                🗑
              </button>
              <button
                onClick={onClose}
                style={{
                  background: "transparent",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.4)",
                  width: "32px", height: "32px",
                  borderRadius: "8px", fontSize: "16px",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "#fff"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.4)"; }}
              >
                ✕
              </button>
            </div>
          </div>
        </div>

        {/* Messages area */}
        <div style={{
          flex: 1, overflowY: "auto",
          padding: "20px",
          display: "flex", flexDirection: "column", gap: "16px",
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(0,255,136,0.2) transparent",
        }}>
          {messages.map((msg, i) => (
            <div key={i} style={{
              display: "flex",
              flexDirection: msg.role === "user" ? "row-reverse" : "row",
              alignItems: "flex-start",
              gap: "10px",
              animation: "fadeSlideUp 0.3s ease",
            }}>
              {/* Avatar */}
              <div style={{
                width: "32px", height: "32px", borderRadius: "50%",
                background: msg.role === "user"
                  ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
                  : "linear-gradient(135deg, #00ff88, #00d4ff)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "14px", flexShrink: 0,
              }}>
                {msg.role === "user" ? "👤" : "🛡️"}
              </div>

              {/* Bubble */}
              <div style={{ maxWidth: "80%" }}>
                <div style={{
                  background: msg.role === "user"
                    ? "linear-gradient(135deg, rgba(99,102,241,0.3), rgba(139,92,246,0.2))"
                    : "rgba(255,255,255,0.04)",
                  border: msg.role === "user"
                    ? "1px solid rgba(99,102,241,0.4)"
                    : "1px solid rgba(0,255,136,0.1)",
                  borderRadius: msg.role === "user" ? "16px 4px 16px 16px" : "4px 16px 16px 16px",
                  padding: "12px 16px",
                  lineHeight: "1.55",
                }}>
                  {msg.role === "user"
                    ? <span style={{ color: "#fff", fontSize: "13px" }}>{msg.content}</span>
                    : formatMessage(msg.content)
                  }
                </div>
                <div style={{
                  color: "rgba(255,255,255,0.25)", fontSize: "10px",
                  marginTop: "4px",
                  textAlign: msg.role === "user" ? "right" : "left",
                  paddingLeft: msg.role === "assistant" ? "4px" : "0",
                }}>
                  {msg.time}
                </div>
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", animation: "fadeSlideUp 0.3s ease" }}>
              <div style={{
                width: "32px", height: "32px", borderRadius: "50%",
                background: "linear-gradient(135deg, #00ff88, #00d4ff)",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px",
              }}>🛡️</div>
              <div style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(0,255,136,0.1)",
                borderRadius: "4px 16px 16px 16px",
                padding: "14px 18px",
                display: "flex", gap: "5px", alignItems: "center",
              }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{
                    width: "7px", height: "7px", borderRadius: "50%",
                    background: "#00ff88",
                    animation: `dotBounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                  }} />
                ))}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested prompts — show only if 1 message */}
        {messages.length === 1 && (
          <div style={{ padding: "0 20px 12px", flexShrink: 0 }}>
            <div style={{ color: "rgba(255,255,255,0.3)", fontSize: "10px", letterSpacing: "1px", marginBottom: "8px" }}>
              QUICK QUESTIONS
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {SUGGESTED_PROMPTS.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(prompt)}
                  style={{
                    background: "rgba(0,255,136,0.06)",
                    border: "1px solid rgba(0,255,136,0.2)",
                    color: "rgba(255,255,255,0.7)",
                    borderRadius: "20px",
                    padding: "5px 12px",
                    fontSize: "11px",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(0,255,136,0.12)"; e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "rgba(0,255,136,0.4)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(0,255,136,0.06)"; e.currentTarget.style.color = "rgba(255,255,255,0.7)"; e.currentTarget.style.borderColor = "rgba(0,255,136,0.2)"; }}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input area */}
        <div style={{
          padding: "16px 20px",
          borderTop: "1px solid rgba(0,255,136,0.1)",
          background: "rgba(0,0,0,0.3)",
          flexShrink: 0,
        }}>
          <div style={{
            display: "flex", gap: "10px", alignItems: "flex-end",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(0,255,136,0.2)",
            borderRadius: "12px",
            padding: "10px 14px",
            transition: "border-color 0.2s ease",
          }}
            onFocusCapture={e => e.currentTarget.style.borderColor = "rgba(0,255,136,0.5)"}
            onBlurCapture={e => e.currentTarget.style.borderColor = "rgba(0,255,136,0.2)"}
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about quantum security..."
              disabled={isLoading}
              rows={1}
              style={{
                flex: 1, background: "transparent",
                border: "none", outline: "none",
                color: "#fff", fontSize: "14px",
                resize: "none", lineHeight: "1.5",
                maxHeight: "100px", overflowY: "auto",
                scrollbarWidth: "none",
                fontFamily: "Inter, sans-serif",
              }}
              onInput={e => {
                e.target.style.height = "auto";
                e.target.style.height = Math.min(e.target.scrollHeight, 100) + "px";
              }}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || isLoading}
              style={{
                background: input.trim() && !isLoading ? "#00ff88" : "rgba(0,255,136,0.2)",
                border: "none",
                borderRadius: "8px",
                width: "34px", height: "34px", flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: input.trim() && !isLoading ? "pointer" : "not-allowed",
                transition: "all 0.2s ease",
                fontSize: "15px",
              }}
            >
              {isLoading ? "⏳" : "↑"}
            </button>
          </div>
          <div style={{ color: "rgba(255,255,255,0.2)", fontSize: "10px", textAlign: "center", marginTop: "8px" }}>
            Enter to send · Shift+Enter for new line · Esc to close
          </div>
        </div>
      </div>

      <style>{`
        @keyframes drawerSlideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes dotBounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.3; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </>
  );
}
