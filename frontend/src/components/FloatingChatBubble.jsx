import { useAIAssistant } from "../hooks/useAIAssistant.jsx";

export default function FloatingChatBubble() {
  const { toggleAssistant, isOpen } = useAIAssistant();

  return (
    <button
      onClick={toggleAssistant}
      title="Open QuantumShield AI"
      style={{
        position: "fixed",
        bottom: "28px",
        right: "28px",
        width: "58px",
        height: "58px",
        borderRadius: "50%",
        background: isOpen
          ? "linear-gradient(135deg, #00cc6a, #00ff88)"
          : "linear-gradient(135deg, #00ff88, #00d4ff)",
        border: "none",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "24px",
        boxShadow: `0 4px 20px rgba(0,255,136,${isOpen ? "0.7" : "0.4"}), 0 0 0 ${isOpen ? "6px" : "0px"} rgba(0,255,136,0.15)`,
        zIndex: 9997,
        transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        transform: isOpen ? "scale(0.9) rotate(15deg)" : "scale(1) rotate(0deg)",
      }}
      onMouseEnter={e => {
        if (!isOpen) {
          e.currentTarget.style.transform = "scale(1.1)";
          e.currentTarget.style.boxShadow = "0 6px 30px rgba(0,255,136,0.6)";
        }
      }}
      onMouseLeave={e => {
        if (!isOpen) {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,255,136,0.4)";
        }
      }}
    >
      {isOpen ? "✕" : "🛡️"}
    </button>
  );
}
