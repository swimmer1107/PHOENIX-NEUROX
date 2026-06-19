import React, { useState, useEffect } from "react";

const TARGET_DATE = new Date("2030-01-01T00:00:00Z");

export default function QuantumClock() {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft());

  function getTimeLeft() {
    const now = new Date();
    const diff = TARGET_DATE - now;
    if (diff <= 0) return { years: 0, months: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
    const totalSeconds = Math.floor(diff / 1000);
    const years = Math.floor(totalSeconds / (365.25 * 24 * 3600));
    const remainder1 = totalSeconds % (365.25 * 24 * 3600);
    const months = Math.floor(remainder1 / (30.44 * 24 * 3600));
    const remainder2 = Math.floor(remainder1 % (30.44 * 24 * 3600));
    const days = Math.floor(remainder2 / (24 * 3600));
    const remainder3 = remainder2 % (24 * 3600);
    const hours = Math.floor(remainder3 / 3600);
    const minutes = Math.floor((remainder3 % 3600) / 60);
    const seconds = remainder3 % 60;
    return { years, months, days, hours, minutes, seconds };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const pad = (n) => String(n).padStart(2, "0");

  return (
    <section style={{ background: "radial-gradient(ellipse at center, #1a0000 0%, #0a0a0f 70%)" }}
      className="py-24 px-4 text-center">
      <h2 className="text-2xl md:text-3xl font-bold mb-2 tracking-widest"
        style={{ color: "#ff4444", textShadow: "0 0 30px rgba(255,68,68,0.8)" }}>
        TIME UNTIL RSA-2048 IS BROKEN BY QUANTUM COMPUTERS
      </h2>
      <p className="text-gray-400 mb-10 text-sm">
        Based on current quantum computing progress reports (Target: Jan 1, 2030). Every second counts.
      </p>

      {/* Main countdown display */}
      <div className="flex justify-center items-center gap-2 md:gap-6 flex-wrap mb-6">
        {[
          { label: "YEARS", value: timeLeft.years },
          { label: "MONTHS", value: timeLeft.months },
          { label: "DAYS", value: timeLeft.days },
          { label: "HOURS", value: timeLeft.hours },
          { label: "MINUTES", value: timeLeft.minutes },
          { label: "SECONDS", value: timeLeft.seconds },
        ].map((unit, i) => (
          <div key={i} className="flex flex-col items-center">
            <div style={{
              background: "#0f0000",
              border: "1px solid rgba(255,68,68,0.4)",
              boxShadow: "0 0 20px rgba(255,68,68,0.3), inset 0 0 10px rgba(255,68,68,0.05)",
              fontFamily: "'JetBrains Mono', monospace",
              color: "#ff4444",
              textShadow: "0 0 20px rgba(255,68,68,1)",
              fontSize: "clamp(2rem, 5vw, 4rem)",
              fontWeight: "bold",
              padding: "16px 24px",
              borderRadius: "8px",
              minWidth: "80px",
              letterSpacing: "4px",
              animation: unit.label === "SECONDS" ? "pulse 1s ease-in-out infinite" : "none"
            }}>
              {pad(unit.value)}
            </div>
            <span className="text-xs mt-2 tracking-widest" style={{ color: "rgba(255,68,68,0.7)" }}>
              {unit.label}
            </span>
          </div>
        ))}
      </div>

      <p className="text-gray-500 text-xs mt-4">
        ⚠️ Every second of inaction increases your organization's quantum exposure risk
      </p>
    </section>
  );
}
