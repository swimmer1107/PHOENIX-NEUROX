import React from "react";

const bubbles = [
  { label: "At Risk", count: 3652, color: "#ff4444", x: 38, y: 42, size: 72 },
  { label: "New Detections", count: 1786, color: "#a855f7", x: 72, y: 22, size: 54 },
  { label: "Breached", count: 989, color: "#f97316", x: 82, y: 62, size: 42 },
  { label: "Dormant", count: 1945, color: "#00d4ff", x: 20, y: 68, size: 58 },
  { label: "Monitored", count: 828, color: "#00ff88", x: 60, y: 72, size: 38 },
  { label: "Idle", count: 1289, color: "#6366f1", x: 55, y: 38, size: 46 },
];

export default function RiskBubbleChart() {
  return (
    <div style={{ position: "relative", width: "100%", height: "320px", overflow: "hidden" }}>
      {/* Subtle grid lines */}
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.06 }}>
        {[20,40,60,80].map(p => (
          <g key={p}>
            <line x1={`${p}%`} y1="0" x2={`${p}%`} y2="100%" stroke="#00ff88" strokeWidth="1"/>
            <line x1="0" y1={`${p}%`} x2="100%" y2={`${p}%`} stroke="#00ff88" strokeWidth="1"/>
          </g>
        ))}
      </svg>

      {/* Bubbles */}
      {bubbles.map((b, i) => (
        <div
          key={i}
          title={`${b.label}: ${b.count.toLocaleString()}`}
          style={{
            position: "absolute",
            left: `${b.x}%`,
            top: `${b.y}%`,
            width: `${b.size * 2}px`,
            height: `${b.size * 2}px`,
            transform: "translate(-50%, -50%)",
            borderRadius: "50%",
            background: `radial-gradient(circle at 35% 35%, ${b.color}cc, ${b.color}44)`,
            border: `2px solid ${b.color}88`,
            boxShadow: `0 0 ${b.size * 0.6}px ${b.color}55, inset 0 0 ${b.size * 0.3}px ${b.color}22`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "transform 0.3s ease, box-shadow 0.3s ease",
            animation: `bubbleFloat${i} ${3 + i * 0.4}s ease-in-out infinite alternate`,
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = "translate(-50%, -50%) scale(1.12)";
            e.currentTarget.style.boxShadow = `0 0 ${b.size}px ${b.color}99, inset 0 0 ${b.size * 0.5}px ${b.color}33`;
            e.currentTarget.style.zIndex = "10";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = "translate(-50%, -50%) scale(1)";
            e.currentTarget.style.boxShadow = `0 0 ${b.size * 0.6}px ${b.color}55, inset 0 0 ${b.size * 0.3}px ${b.color}22`;
            e.currentTarget.style.zIndex = "1";
          }}
        >
          <span style={{ color: "#fff", fontWeight: "800", fontSize: `${Math.max(11, b.size * 0.28)}px`, lineHeight: 1 }}>
            {b.count >= 1000 ? `${(b.count/1000).toFixed(1)}k` : b.count}
          </span>
          <span style={{ color: "rgba(255,255,255,0.7)", fontSize: `${Math.max(8, b.size * 0.17)}px`, marginTop: "2px", textAlign: "center", padding: "0 4px" }}>
            {b.label}
          </span>
        </div>
      ))}

      {/* Legend row */}
      <div style={{
        position: "absolute", bottom: "0", left: "0", right: "0",
        display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap", padding: "4px"
      }}>
        {bubbles.map((b, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: b.color, boxShadow: `0 0 6px ${b.color}` }} />
            <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "11px" }}>{b.label}</span>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes bubbleFloat0 { from { margin-top: 0px } to { margin-top: -8px } }
        @keyframes bubbleFloat1 { from { margin-top: 0px } to { margin-top: -10px } }
        @keyframes bubbleFloat2 { from { margin-top: 0px } to { margin-top: -6px } }
        @keyframes bubbleFloat3 { from { margin-top: 0px } to { margin-top: -12px } }
        @keyframes bubbleFloat4 { from { margin-top: 0px } to { margin-top: -7px } }
        @keyframes bubbleFloat5 { from { margin-top: 0px } to { margin-top: -9px } }
      `}</style>
    </div>
  );
}
