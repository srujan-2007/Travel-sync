import React from 'react';

const Logo = ({ size = 28, className = "" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 32 32" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className={`logo-svg-icon ${className}`}
    style={{ marginRight: '8px', flexShrink: 0, display: 'inline-block', verticalAlign: 'middle' }}
  >
    {/* Teal Ring */}
    <circle cx="16" cy="16" r="12" stroke="#14b8a6" strokeWidth="2.5" />
    
    {/* Trail */}
    <line x1="6" y1="26" x2="16" y2="16" stroke="#e2e8f0" strokeWidth="2" strokeLinecap="round" />
    
    {/* Plane */}
    <path 
      d="M26 6 L18 10 L14 8 L13 9 L15 13 L11 17 L7 16 L6 17 L10 20 L13 24 L14 23 L13 19 L17 15 L21 17 L25 9 Z" 
      fill="#ffffff" 
    />
  </svg>
);

export default Logo;
