import React, { useState } from 'react';
import { motion } from 'framer-motion';
import GlowButton from '../components/GlowButton';

const RiskAnalyzer = () => {
  const [isSimulating, setIsSimulating] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [keyInput, setKeyInput] = useState('');
  const [selectedSetup, setSelectedSetup] = useState('');

  const timelineSteps = [
    { year: "2024", icon: "📡", title: "Data Intercepted", desc: "Your RSA-encrypted network traffic is silently captured by a nation-state adversary using passive interception. You are completely unaware.", color: "#ff4444" },
    { year: "2025", icon: "💾", title: "Data Archived", desc: "Encrypted packets are stored in adversary quantum-ready cold storage vaults. Storage costs are negligible. They can wait indefinitely.", color: "#ff6644" },
    { year: "2027", icon: "⚡", title: "Quantum Supremacy", desc: "A cryptographically relevant quantum computer (4000+ logical qubits) becomes operational. Shor's algorithm is now weaponized at scale.", color: "#ffaa00" },
    { year: "2029", icon: "🔓", title: "RSA-2048 Broken", desc: "Your private keys are fully recovered in under 8 hours. All archived encrypted communications from 2024 onwards are now readable.", color: "#ff8800" },
    { year: "2030+", icon: "☠️", title: "Full Data Exposure", desc: "Financial records, credentials, classified communications, PII — all decrypted and weaponized. The breach you didn't know started in 2024 is now catastrophic.", color: "#ff4444" },
  ];

  const simulateAttack = () => {
    setIsSimulating(true);
    setCurrentStep(-1);
    setShowResults(false);
    
    const steps = [0, 1, 2, 3, 4];
    steps.forEach((step, i) => {
      setTimeout(() => {
        setCurrentStep(step);
        if (i === steps.length - 1) {
          setTimeout(() => {
            setIsSimulating(false);
            setShowResults(true);
          }, 400);
        }
      }, i * 600);
    });
  };

  return (
    <div className="min-h-screen pt-24 pb-24 px-4 sm:px-8 max-w-5xl mx-auto flex flex-col items-center animate-[fadeIn_0.3s_ease-out]">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold font-sans text-danger mb-4 drop-shadow-[0_0_15px_rgba(255,68,68,0.4)] tracking-wide">
          HARVEST NOW, DECRYPT LATER
        </h1>
        <p className="text-xl text-gray-400">Attack Simulation Timeline</p>
      </div>

      {!isSimulating && !showResults && (
        <div className="glass-card p-8 md:p-12 text-center max-w-3xl w-full border-t-4 border-t-danger relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 text-8xl opacity-5 pointer-events-none">👁️</div>
          
          <h2 className="text-2xl font-bold mb-6 text-white text-left">Vulnerability Input Form</h2>
          
          <div className="space-y-6 text-left relative z-10 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2 font-mono">Current Encryption Setup</label>
              <select 
                className="w-full bg-[#0a0a0f] border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-danger focus:ring-1 focus:ring-danger outline-none transition-all"
                value={selectedSetup}
                onChange={(e) => setSelectedSetup(e.target.value)}
              >
                <option value="">Select your infrastructure profile...</option>
                <option value="rsa-1024">RSA-1024 (End of Life)</option>
                <option value="rsa-2048">RSA-2048 (Vulnerable)</option>
                <option value="rsa-4096">RSA-4096 (Vulnerable)</option>
                <option value="ecc-p256">ECC P-256 (Vulnerable)</option>
                <option value="pqc">Already using PQC (Safe)</option>
              </select>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="h-[1px] flex-grow bg-gray-800"></div>
              <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">OR</span>
              <div className="h-[1px] flex-grow bg-gray-800"></div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2 font-mono">Paste Public Key / Certificate (PEM)</label>
              <textarea 
                rows="3"
                placeholder="-----BEGIN PUBLIC KEY-----&#10;..."
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                className="w-full bg-[#0a0a0f] border border-gray-700 rounded-lg px-4 py-3 text-white font-mono text-xs focus:border-danger focus:ring-1 focus:ring-danger outline-none transition-all"
              />
            </div>
          </div>

          {(selectedSetup || keyInput) && selectedSetup !== "pqc" && (
            <div className="text-left bg-danger/10 border border-danger/30 p-4 rounded-lg mb-8 text-sm text-danger font-bold">
              ⚠️ Warning: Your configuration is highly susceptible to timeline attacks. Press simulate to view the attack lifecycle.
            </div>
          )}

          {(selectedSetup || keyInput) && selectedSetup === "pqc" && (
            <div className="text-left bg-primary/10 border border-primary/30 p-4 rounded-lg mb-8 text-sm text-primary font-bold">
              ✅ Your configuration acts as a shield against Timeline attacks. Simulating worst-case scenario over unprotected traffic instead.
            </div>
          )}

          <GlowButton variant="danger" onClick={simulateAttack} className="mx-auto text-lg px-10 py-4 w-full md:w-auto shadow-glow-danger font-bold tracking-wider">
            Simulate Attack Scenario
          </GlowButton>
        </div>
      )}

      {/* Ticking Simulation Timeline */}
      {(isSimulating || showResults) && (
             <div className="w-full max-w-4xl relative mt-8">
               <div className="absolute left-[39px] md:left-1/2 top-0 bottom-0 w-1 bg-gray-800 md:-translate-x-1/2 rounded z-0" />
               
               <div className="space-y-12 relative z-10">
                 {timelineSteps.map((step, idx) => (
                   <div 
                     key={idx}
                     className={`flex flex-col md:flex-row items-start md:items-center w-full transition-all duration-500 ${idx % 2 !== 0 ? 'md:flex-row-reverse' : ''} ${idx <= currentStep ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                   >
                     {/* Card Content */}
                     <div className={`w-full md:w-1/2 ${idx % 2 === 0 ? 'md:pr-16 md:text-right text-left pl-24 md:pl-0' : 'md:pl-16 text-left pl-24'}`}>
                       <div className={`glass-card p-6 border-l-4 transition-all duration-300 ${idx === currentStep ? 'scale-[1.03] shadow-[0_0_30px_rgba(255,68,68,0.2)] border-l-danger' : 'border-l-transparent bg-black/60'}`}>
                         <div className="font-mono font-bold text-xl mb-1" style={{ color: step.color }}>{step.year}</div>
                         <h3 className="text-white font-bold text-lg mb-2">{step.title}</h3>
                         <p className="text-gray-400 text-sm leading-relaxed">{step.desc}</p>
                       </div>
                     </div>
     
                     {/* Center Node */}
                     <div className="absolute left-4 md:left-1/2 md:-translate-x-1/2 mt-6 md:mt-0">
                       <div 
                         className={`w-12 h-12 rounded-full flex items-center justify-center text-xl z-20 border-2 transition-all duration-300
                           ${idx === currentStep ? 'bg-danger shadow-[0_0_20px_rgba(255,68,68,0.8)] border-white scale-125' : 
                             idx < currentStep ? 'bg-danger border-danger scale-100' : 'bg-[#0a0a0f] border-gray-700 scale-75'}`}
                       >
                         {idx <= currentStep ? step.icon : <span className="opacity-0">{step.icon}</span>}
                       </div>
                     </div>
                   </div>
                 ))}
               </div>
             </div>
      )}

      {/* Output Results */}
      {showResults && (
        <div className="w-full mt-24 animate-[fadeIn_0.5s_ease-out]">
          <h2 className="text-3xl font-bold font-sans text-white mb-8 text-center border-b border-gray-800 pb-4">Simulation Assessment</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
            <div className="glass-card p-6 border-t-2 border-danger">
              <h3 className="text-gray-400 font-mono text-sm mb-2 uppercase tracking-wide">Data Exploitation Value</h3>
              <p className="text-3xl font-bold text-danger mb-2">$8.4M</p>
              <p className="text-sm text-gray-500">Estimated value of decrypted IP and financials on the dark web.</p>
            </div>
            <div className="glass-card p-6 border-t-2 border-warning">
              <h3 className="text-gray-400 font-mono text-sm mb-2 uppercase tracking-wide">Compliance Fines</h3>
              <p className="text-3xl font-bold text-warning mb-2">GDPR / CCPA</p>
              <p className="text-sm text-gray-500">Retroactive fines applied due to insufficient encryption standards.</p>
            </div>
            <div className="glass-card p-6 border-t-2 border-danger">
              <h3 className="text-gray-400 font-mono text-sm mb-2 uppercase tracking-wide">System Compromise</h3>
              <p className="text-3xl font-bold text-danger mb-2">Total Control</p>
              <p className="text-sm text-gray-500">Decrypted admin credentials give adversaries full network access.</p>
            </div>
            <div className="glass-card p-6 border-t-2 border-primary bg-primary/5">
              <h3 className="text-gray-400 font-mono text-sm mb-2 uppercase tracking-wide">Action Required</h3>
              <p className="text-xl font-bold text-primary mb-2">Hybrid Key Exchange Migration</p>
              <GlowButton onClick={() => window.location.href='/migration-guide'} className="mt-2 w-full !py-2 !text-sm">Start Migration &rarr;</GlowButton>
            </div>
          </div>

          <h3 className="text-xl font-bold font-sans text-center mb-6 text-gray-300">Industries Most At Risk</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-center">
             {['🏦 Banking & Fintech', '🏛️ Govt & Defense', '☁️ Cloud Infra', '🏥 Healthcare'].map((ind, i) => (
               <div key={i} className="bg-[#0f1117] border border-gray-800 p-4 rounded-lg text-gray-300 font-medium">
                 {ind}
               </div>
             ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RiskAnalyzer;
