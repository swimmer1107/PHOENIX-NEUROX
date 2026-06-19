import { useState, createContext, useContext } from "react";

const AIContext = createContext(null);

export function AIAssistantProvider({ children }) {
  const [isOpen, setIsOpen]           = useState(false);
  // Stores the latest scan results so the AI can reference real data
  const [scanContext, setScanContext] = useState(null);

  const openAssistant  = () => setIsOpen(true);
  const closeAssistant = () => setIsOpen(false);
  const toggleAssistant = () => setIsOpen(prev => !prev);

  /**
   * Call this after every successful scan to give the AI live context.
   * @param {object} results  — { findings, risk, repo_name }
   */
  const updateScanContext = (results) => {
    if (!results) return;
    setScanContext({
      findings:        results.findings        || [],
      risk:            results.risk            || {},
      repo_name:       results.filename || results.repo_name || "scanned file",
      armoriq_verified: results.risk?.armoriq_verified || false,
    });
  };

  return (
    <AIContext.Provider value={{
      isOpen,
      openAssistant,
      closeAssistant,
      toggleAssistant,
      scanContext,
      updateScanContext,
    }}>
      {children}
    </AIContext.Provider>
  );
}

export function useAIAssistant() {
  return useContext(AIContext);
}
