import React from 'react';
import { NavLink } from 'react-router-dom';
import GlowButton from './GlowButton';
import { useAIAssistant } from "../hooks/useAIAssistant.jsx";

const Navbar = () => {
  const { toggleAssistant, isOpen } = useAIAssistant();
  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Scanner', path: '/scanner' },
    { name: 'Risk Analyzer', path: '/risk-analyzer' },
    { name: 'Migration Guide', path: '/migration-guide' },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 glass-card rounded-none border-t-0 border-x-0 !border-b-[#00ff8826]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center mb-2">
            <NavLink to="/" className="flex items-center gap-3 decoration-transparent">
              <div className="w-10 h-10 border-2 border-primary rotate-45 flex items-center justify-center shadow-glow">
                <span className="-rotate-45 font-mono font-bold text-primary text-xl">QB</span>
              </div>
              <span className="font-sans font-bold text-2xl tracking-wider text-white">
                QuantumBridge
              </span>
            </NavLink>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {navItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-md font-mono text-sm font-medium transition-colors duration-300 relative group decoration-transparent ${
                      isActive ? 'text-primary' : 'text-gray-300 hover:text-white'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {item.name}
                      <span className={`absolute bottom-0 left-0 w-full h-[2px] bg-primary transform origin-left transition-transform duration-300 ${isActive ? 'scale-x-100 shadow-glow' : 'scale-x-0 group-hover:scale-x-100'}`} />
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>

          {/* Right Section */}
          <div className="hidden md:flex">
            <button
              onClick={toggleAssistant}
              style={{
                background: isOpen ? "#00cc6a" : "#00ff88",
                color: "#000",
                border: "none",
                borderRadius: "8px",
                padding: "10px 20px",
                fontSize: "14px",
                fontWeight: "700",
                cursor: "pointer",
                display: "flex", alignItems: "center", gap: "8px",
                boxShadow: `0 0 ${isOpen ? "25px" : "15px"} rgba(0,255,136,${isOpen ? "0.6" : "0.3"})`,
                transition: "all 0.2s ease",
              }}
            >
              <span style={{
                width: "8px", height: "8px", borderRadius: "50%",
                background: "#000",
                boxShadow: "0 0 0 0 rgba(0,0,0,0.4)",
                animation: "navDot 2s ease-in-out infinite",
              }} />
              {isOpen ? "Close AI" : "AI Assistant"}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
