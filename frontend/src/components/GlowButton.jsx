import React from 'react';

const GlowButton = ({ 
  children, 
  variant = 'primary', 
  onClick, 
  className = '', 
  type = 'button',
  disabled = false 
}) => {
  const baseStyles = "px-6 py-3 rounded-lg font-mono font-semibold transition-all duration-200 flex items-center justify-center relative overflow-hidden group hover:scale-[1.02] hover:brightness-110 active:scale-95";
  
  const variants = {
    primary: "bg-primary text-[#0a0a0f] hover:shadow-glow hover:bg-primary/90",
    secondary: "bg-transparent border border-secondary text-secondary hover:shadow-glow-cyan hover:bg-secondary/10",
    danger: "bg-danger text-white hover:shadow-glow-danger hover:bg-danger/90",
  };

  return (
    <button
      type={type}
      className={`${baseStyles} ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      <span className="relative z-10">{children}</span>
      {/* Glow effect element for primary variant */}
      {variant === 'primary' && !disabled && (
        <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
      )}
    </button>
  );
};

export default GlowButton;
