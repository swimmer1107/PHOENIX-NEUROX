import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

export default function IntegrityGauge({ critical = 0, suspicious = 0, safe = 0, score = 0 }) {
  const gaugeData = [
    { name: "Critical", value: critical, color: "#ff4444" },
    { name: "Suspicious", value: suspicious, color: "#ffaa00" },
    { name: "Safe", value: safe, color: "#00ff88" },
  ];

  return (
    <div style={{ position: "relative", width: "100%", height: "300px" }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={gaugeData}
            cx="50%"
            cy="50%"
            innerRadius={90}
            outerRadius={130}
            paddingAngle={3}
            dataKey="value"
            startAngle={90}
            endAngle={-270}
            stroke="none"
          >
            {gaugeData.map((entry, index) => (
              <Cell
                key={index}
                fill={entry.color}
                style={{ filter: `drop-shadow(0 0 8px ${entry.color}88)`, outline: "none" }}
              />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      {/* Centered overlay text — perfectly centered using absolute positioning */}
      <div style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -58%)",
        textAlign: "center",
        pointerEvents: "none",
      }}>
        <div style={{
          fontSize: "42px",
          fontWeight: "800",
          color: "#ffffff",
          letterSpacing: "-1px",
          lineHeight: 1,
          textShadow: "0 0 20px rgba(0,255,136,0.4)",
        }}>
          {score}
        </div>
        <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", marginTop: "4px", letterSpacing: "1px" }}>
          TOTAL INTEGRITY
        </div>
      </div>

      {/* Legend below chart */}
      <div style={{
        display: "flex",
        justifyContent: "center",
        gap: "24px",
        marginTop: "-8px",
        flexWrap: "wrap",
      }}>
        {gaugeData.map((item, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div style={{
              width: "10px", height: "10px", borderRadius: "50%",
              background: item.color,
              boxShadow: `0 0 8px ${item.color}`
            }} />
            <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "12px" }}>
              {item.name}
            </span>
            <span style={{ color: item.color, fontSize: "12px", fontWeight: "600" }}>
              ({item.value.toLocaleString()})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
