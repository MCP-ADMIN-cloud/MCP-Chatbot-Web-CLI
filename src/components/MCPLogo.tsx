import React from 'react';

interface MCPLogoProps {
  className?: string;
  size?: number;
}

export const MCPLogo: React.FC<MCPLogoProps> = ({ className = 'w-6 h-6', size }) => {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      style={size ? { width: size, height: size } : undefined}
    >
      <defs>
        <radialGradient id="mcpBgGrad" cx="50%" cy="50%" r="50%" fx="42%" fy="38%">
          <stop offset="0%" stopColor="#4350ee" />
          <stop offset="70%" stopColor="#313dd6" />
          <stop offset="100%" stopColor="#2530c0" />
        </radialGradient>
        <filter id="mcpGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#0f172a" floodOpacity="0.3" />
        </filter>
      </defs>

      {/* Outer Circle Background */}
      <circle cx="50" cy="50" r="48" fill="url(#mcpBgGrad)" filter="url(#mcpGlow)" />

      {/* Subtle Concentric Depth Ring */}
      <circle cx="50" cy="50" r="39" fill="#2d38cf" fillOpacity="0.5" />

      {/* 6 Radial Spokes (White) */}
      {/* Top spoke (0 deg) */}
      <line x1="50" y1="50" x2="50" y2="17" stroke="#ffffff" strokeWidth="4.6" strokeLinecap="round" />
      {/* Top-Right spoke (60 deg) */}
      <line x1="50" y1="50" x2="78.58" y2="33.5" stroke="#ffffff" strokeWidth="4.6" strokeLinecap="round" />
      {/* Bottom-Right spoke (120 deg) */}
      <line x1="50" y1="50" x2="78.58" y2="66.5" stroke="#ffffff" strokeWidth="4.6" strokeLinecap="round" />
      {/* Bottom spoke (180 deg) */}
      <line x1="50" y1="50" x2="50" y2="83" stroke="#ffffff" strokeWidth="4.6" strokeLinecap="round" />
      {/* Bottom-Left spoke (240 deg) */}
      <line x1="50" y1="50" x2="21.42" y2="66.5" stroke="#ffffff" strokeWidth="4.6" strokeLinecap="round" />
      {/* Top-Left spoke (300 deg) */}
      <line x1="50" y1="50" x2="21.42" y2="33.5" stroke="#ffffff" strokeWidth="4.6" strokeLinecap="round" />

      {/* Central Hub Ring (White with hollow center) */}
      <circle cx="50" cy="50" r="14" fill="#ffffff" />
      <circle cx="50" cy="50" r="7.5" fill="#2d38cf" />

      {/* 6 Peripheral Cyan Nodes */}
      <circle cx="50" cy="17" r="6.6" fill="#38bdf8" />
      <circle cx="78.58" cy="33.5" r="6.6" fill="#38bdf8" />
      <circle cx="78.58" cy="66.5" r="6.6" fill="#38bdf8" />
      <circle cx="50" cy="83" r="6.6" fill="#38bdf8" />
      <circle cx="21.42" cy="66.5" r="6.6" fill="#38bdf8" />
      <circle cx="21.42" cy="33.5" r="6.6" fill="#38bdf8" />
    </svg>
  );
};
