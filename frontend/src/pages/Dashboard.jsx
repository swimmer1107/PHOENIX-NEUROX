import React, { useState, useEffect } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, Area 
} from 'recharts';
import GlowButton from '../components/GlowButton';
import RiskBubbleChart from '../components/RiskBubbleChart';
import IntegrityGauge from '../components/IntegrityGauge';
import TopThreatsTable from '../components/TopThreatsTable';
import API_BASE_URL from '../apiConfig';

const Dashboard = () => {
  const [reportDownloaded, setReportDownloaded] = useState(false);
  const [stats, setStats] = useState({
    total_threats: 0,
    defended: 0,
    failed: 0,
    total_scans: 0,
    integrity_score: 0,
    critical: 0,
    suspicious: 0,
    safe: 0,
    history: [],
    findings_list: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const fetchStats = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/dashboard/stats`);
        if (response.ok) {
          const data = await response.json();
          if (active) {
            setStats(data);
            setLoading(false);
          }
        }
      } catch (err) {
        console.error("Error fetching stats:", err);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 3000); // Polling every 3 seconds

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  const getDelta = (current, previous) => {
    if (previous === undefined || previous === null || previous === 0) {
      if (current > 0) return `+100% ▲`;
      return "0% —";
    }
    const diff = current - previous;
    if (diff === 0) return "0% —";
    const percent = ((diff / previous) * 100).toFixed(1);
    if (diff > 0) return `+${percent}% ▲`;
    return `${percent}% ▼`;
  };

  const historyLen = stats.history?.length || 0;
  const prevThreats = historyLen >= 2 ? stats.history[historyLen - 2].v : 0;
  const prevScans = historyLen >= 2 ? historyLen - 1 : 0;

  const threatsDelta = getDelta(stats.total_threats, prevThreats);
  const scansDelta = getDelta(stats.total_scans, prevScans);

  const threatsDeltaColor = prevThreats === stats.total_threats ? 'text-gray-500' : 'text-[#00ff88]';
  const scansDeltaColor = prevScans === stats.total_scans ? 'text-gray-500' : 'text-[#00ff88]';

  const threatSpark = stats.history.map(h => ({ v: h.v }));
  const defendedSpark = stats.history.map(() => ({ v: 0 }));
  const failedSpark = stats.history.map(h => ({ v: h.v }));
  const scansSpark = stats.history.map((h, i) => ({ v: i + 1 }));

  const kpiData = [
    { title: 'Total Threats Detected', value: stats.total_threats, delta: threatsDelta, deltaColor: threatsDeltaColor, color: 'text-danger', border: 'border-danger/30', fill: '#ff4444', spark: threatSpark },
    { title: 'Defended (Patched)', value: stats.defended, delta: '0% —', deltaColor: 'text-gray-500', color: 'text-primary', border: 'border-primary/30', fill: '#00ff88', spark: defendedSpark },
    { title: 'Failed / Vulnerable', value: stats.failed, delta: threatsDelta, deltaColor: threatsDeltaColor, color: 'text-danger', border: 'border-danger/30', fill: '#ff4444', spark: failedSpark },
    { title: 'Total Files Scanned', value: stats.total_scans, delta: scansDelta, deltaColor: scansDeltaColor, color: 'text-secondary', border: 'border-secondary/30', fill: '#00d4ff', spark: scansSpark },
  ];

  const downloadDashboardReport = () => {
    const now = new Date();
    const dateStr = now.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    const timeStr = now.toLocaleTimeString("en-US");
    const reportId = `QB-RPT-${Date.now().toString(36).toUpperCase()}`;

    const report = `
╔══════════════════════════════════════════════════════════════════════════╗
║                  QUANTUMBRIDGE — SECURITY DASHBOARD REPORT              ║
╚══════════════════════════════════════════════════════════════════════════╝

Report ID   : ${reportId}
Generated   : ${dateStr} at ${timeStr}
Platform    : QuantumBridge v1.0 | Team Phoenix | Cyberonites | GLA University

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EXECUTIVE SUMMARY
─────────────────
Total Threats Detected    :  ${stats.total_threats}
Defended / Patched        :  ${stats.defended}
Failed / Vulnerable       :  ${stats.failed}
Total Files Scanned       :  ${stats.total_scans}

SECURITY INTEGRITY SCORE  :  ${stats.integrity_score} / 10000
  Critical Components     :  ${stats.critical}
  Suspicious Components   :  ${stats.suspicious}
  Safe Components         :  ${stats.safe}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

RISK DISTRIBUTION
─────────────────
  At Risk          :  ${stats.suspicious} components  (HIGH PRIORITY)
  New Detections   :  ${stats.history.length > 0 ? stats.history[stats.history.length - 1].new_findings : 0} components
  Breached         :  ${stats.critical} components  (CRITICAL)
  Dormant          :  ${stats.safe} components
  Monitored        :  ${stats.failed} components
  Idle             :  ${Math.max(0, stats.total_scans - stats.critical - stats.suspicious)} components

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TOP CRITICAL THREATS
────────────────────
${stats.findings_list.length === 0 ? "No critical threats detected." : stats.findings_list.slice(0, 5).map((threat, idx) => `
${idx + 1}. ${threat.name}
   Algorithm : ${threat.algorithm}          Severity : ${threat.level} (${threat.score}/100)
   File      : ${threat.sourceFile}
   Status    : ${threat.status}
   Action    : ${threat.action}
`).join('\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

RECOMMENDED IMMEDIATE ACTIONS
──────────────────────────────
${stats.findings_list.length === 0 ? "No immediate actions required." : stats.findings_list.slice(0, 5).map((threat, idx) => `
${idx + 1}. [${threat.level}] Migrate ${threat.algorithm} in ${threat.sourceFile} → ${threat.action.split('→')[1]?.trim() || 'Quantum-Safe alternative'}
`).join('')}

NIST COMPLIANCE STATUS
──────────────────────
  NIST FIPS 203 (ML-KEM) — Key Encapsulation   :  ${stats.history.some(h => h.new_findings === 0) ? "COMPLIANT" : "PARTIAL"}
  NIST FIPS 204 (ML-DSA) — Digital Signatures  :  PARTIAL
  NIST FIPS 205 (SLH-DSA) — Hash Signatures    :  NON-COMPLIANT
  CNSA 2.0 Suite                                :  NON-COMPLIANT
  BSI Recommendations                           :  PARTIAL

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Generated by QuantumBridge Security Platform
Team Phoenix | Cyberonites | GLA University | IntrusionX Second Edition
Verify at: quantumbridge.io/verify/${reportId}
  `.trim();

    const blob = new Blob([report], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `QuantumBridge_Dashboard_Report_${now.toISOString().split("T")[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Show success feedback on the button
    setReportDownloaded(true);
    setTimeout(() => setReportDownloaded(false), 3000);
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-8 max-w-7xl mx-auto animate-[fadeIn_0.3s_ease-out]">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold font-sans">Security <span className="text-secondary">Dashboard</span></h1>
        <button
          onClick={downloadDashboardReport}
          style={{
            background: reportDownloaded ? "#00ff88" : "transparent",
            border: `1px solid ${reportDownloaded ? "#00ff88" : "#00d4ff"}`,
            color: reportDownloaded ? "#000" : "#00d4ff",
            borderRadius: "8px",
            padding: "10px 20px",
            fontSize: "13px",
            fontWeight: "700",
            cursor: "pointer",
            transition: "all 0.3s ease",
            letterSpacing: "0.5px",
            boxShadow: reportDownloaded ? "0 0 20px rgba(0,255,136,0.4)" : "0 0 10px rgba(0,212,255,0.15)",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
          onMouseEnter={e => {
            if (!reportDownloaded) {
              e.currentTarget.style.background = "rgba(0,212,255,0.08)";
              e.currentTarget.style.boxShadow = "0 0 20px rgba(0,212,255,0.3)";
            }
          }}
          onMouseLeave={e => {
            if (!reportDownloaded) {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.boxShadow = "0 0 10px rgba(0,212,255,0.15)";
            }
          }}
        >
          {reportDownloaded ? "✓ Downloaded!" : "⬇ Download Report"}
        </button>
      </div>

      {/* KPI Row (4x CSS grid) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {kpiData.map((kpi, i) => (
          <div key={i} className={`glass-card p-4 border-t-4 ${kpi.border} flex flex-col justify-between`}>
            <div>
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider">{kpi.title}</h3>
                <span className={`text-xs font-bold ${kpi.deltaColor}`}>{kpi.delta}</span>
              </div>
              <div className={`text-4xl font-mono font-bold ${kpi.color}`}>{kpi.value}</div>
            </div>
            <div className="h-12 w-full mt-4">
              {kpi.spark.length >= 2 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={kpi.spark}>
                    <Area type="monotone" dataKey="v" stroke="none" fill={kpi.fill} fillOpacity={0.2} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full w-full flex items-center justify-center border border-dashed border-gray-850/50 rounded bg-black/10">
                  <span className="text-[10px] text-gray-500 font-mono">Insufficient history</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Middle Row Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        
        {/* Security Integrity Gauge */}
        <div className="glass-card p-6 min-h-[380px] flex flex-col">
          <h2 className="text-xl font-bold mb-6">Security Integrity Gauge</h2>
          <IntegrityGauge 
            critical={stats.critical} 
            suspicious={stats.suspicious} 
            safe={stats.safe} 
            score={stats.integrity_score} 
          />
        </div>

        {/* Risk Distribution Bubble Chart */}
        <div className="glass-card p-6 min-h-[380px] flex flex-col">
          <h2 className="text-xl font-bold mb-6">Risk Distribution</h2>
          <RiskBubbleChart 
            critical={stats.critical} 
            suspicious={stats.suspicious} 
            failed={stats.failed} 
            safe={stats.safe} 
            total_scans={stats.total_scans} 
            new_detections={stats.history.length > 0 ? stats.history[stats.history.length - 1].new_findings : 0} 
          />
        </div>

      </div>

      {/* Bottom Table */}
      <div className="glass-card p-6 overflow-hidden flex flex-col">
        <TopThreatsTable threats={stats.findings_list} />
      </div>
    </div>
  );
};

export default Dashboard;
