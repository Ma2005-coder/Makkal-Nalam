
import React from 'react';

interface AppLogoProps {
  className?: string;
}

const AppLogo: React.FC<AppLogoProps> = ({ className = "w-12 h-12" }) => {
  return (
    <div className={`${className} flex items-center justify-center`}>
      <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-xl" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bgGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#059669" />
            <stop offset="100%" stopColor="#047857" />
          </linearGradient>
          <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
        </defs>
        
        {/* Background Circle */}
        <circle cx="100" cy="100" r="95" fill="url(#bgGradient)" />
        
        {/* Golden Wreaths */}
        <g id="wreaths" fill="#facc15">
          {/* Left Wreath */}
          <path d="M60,115 Q45,100 45,75 Q45,50 65,40" stroke="#ca8a04" strokeWidth="0.5" fill="none" opacity="0.3" />
          <g transform="translate(48, 115) rotate(-20)">
            <ellipse cx="0" cy="0" rx="4" ry="8" />
          </g>
          <g transform="translate(42, 100) rotate(-40)">
            <ellipse cx="0" cy="0" rx="4" ry="8" />
          </g>
          <g transform="translate(40, 85) rotate(-60)">
            <ellipse cx="0" cy="0" rx="4" ry="8" />
          </g>
          <g transform="translate(42, 70) rotate(-80)">
            <ellipse cx="0" cy="0" rx="4" ry="8" />
          </g>
          <g transform="translate(48, 55) rotate(-100)">
            <ellipse cx="0" cy="0" rx="4" ry="8" />
          </g>
          <g transform="translate(58, 45) rotate(-120)">
            <ellipse cx="0" cy="0" rx="4" ry="8" />
          </g>

          {/* Right Wreath */}
          <g transform="scale(-1, 1) translate(-200, 0)">
            <g transform="translate(48, 115) rotate(-20)">
              <ellipse cx="0" cy="0" rx="4" ry="8" />
            </g>
            <g transform="translate(42, 100) rotate(-40)">
              <ellipse cx="0" cy="0" rx="4" ry="8" />
            </g>
            <g transform="translate(40, 85) rotate(-60)">
              <ellipse cx="0" cy="0" rx="4" ry="8" />
            </g>
            <g transform="translate(42, 70) rotate(-80)">
              <ellipse cx="0" cy="0" rx="4" ry="8" />
            </g>
            <g transform="translate(48, 55) rotate(-100)">
              <ellipse cx="0" cy="0" rx="4" ry="8" />
            </g>
            <g transform="translate(58, 45) rotate(-120)">
              <ellipse cx="0" cy="0" rx="4" ry="8" />
            </g>
          </g>
        </g>

        {/* Central White Symbols */}
        <g fill="white">
          {/* Government Dome */}
          <path d="M80,55 Q100,25 120,55 L120,60 L80,60 Z" />
          <g stroke="white" strokeWidth="0.5" opacity="0.3">
            <line x1="85" y1="56" x2="85" y2="35" />
            <line x1="92" y1="56" x2="92" y2="32" />
            <line x1="100" y1="56" x2="100" y2="30" />
            <line x1="108" y1="56" x2="108" y2="32" />
            <line x1="115" y1="56" x2="115" y2="35" />
          </g>
          <rect x="85" y="62" width="30" height="2" rx="1" />
          <rect x="82" y="66" width="36" height="3" rx="1" />
          
          {/* House inside/under dome */}
          <path d="M90,88 L100,78 L110,88 L110,96 L90,96 Z" />
          <path d="M85,88 L100,73 L115,88" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" />

          {/* Hands holding the plant */}
          <path d="M70,120 Q60,120 62,140 Q65,160 100,160 Q135,160 138,140 Q140,120 130,120 L122,120 Q122,125 118,128 Q110,135 100,135 Q90,135 82,128 Q78,125 78,120 Z" />
          
          {/* The Plant / Sprout */}
          <rect x="99" y="105" width="2" height="18" rx="1" />
          <path d="M100,110 Q118,105 122,90 Q105,90 100,110" />
          <path d="M100,112 Q82,107 78,92 Q95,92 100,112" />
        </g>

        {/* Curved Text Branding */}
        <path id="curveMain" d="M40,145 A75,75 0 0,0 160,145" fill="none" />
        <text fill="white" style={{ fontSize: '18px', fontWeight: '800', fontFamily: 'sans-serif' }}>
          <textPath href="#curveMain" startOffset="50%" textAnchor="middle">
            MAKKAL NALAM
          </textPath>
        </text>

        <path id="curveSub" d="M60,165 A80,80 0 0,0 140,165" fill="none" />
        <text fill="white" style={{ fontSize: '7.5px', fontWeight: '700', fontFamily: 'sans-serif', letterSpacing: '0.8px' }}>
          <textPath href="#curveSub" startOffset="50%" textAnchor="middle">
            TN GOVERNMENT SCHEMES
          </textPath>
        </text>
      </svg>
    </div>
  );
};

export default AppLogo;
