import { useState, useEffect } from 'react';
import type { EmotionType } from '../types';

interface LitoPetProps {
  emotion?: EmotionType;
  size?: 'small' | 'medium' | 'large';
  action?: 'idle' | 'wave' | 'spin' | 'snuggle' | 'sleep';
  onClick?: () => void;
}

const emotionExpressions: Record<EmotionType, { eyes: string; mouth: string; blush: boolean; eyebrows: string }> = {
  happy: { eyes: 'scaleY(1)', mouth: 'scaleY(1.2)', blush: true, eyebrows: 'rotate(-10deg)' },
  sad: { eyes: 'scaleY(0.7)', mouth: 'scaleY(0.5)', blush: false, eyebrows: 'rotate(15deg)' },
  anxious: { eyes: 'scaleY(1.1)', mouth: 'scaleY(0.8)', blush: true, eyebrows: 'rotate(10deg)' },
  angry: { eyes: 'scaleY(0.6)', mouth: 'scaleY(1.3)', blush: true, eyebrows: 'rotate(20deg)' },
  calm: { eyes: 'scaleY(1)', mouth: 'scaleY(0.9)', blush: false, eyebrows: 'rotate(0deg)' },
  neutral: { eyes: 'scaleY(1)', mouth: 'scaleY(1)', blush: false, eyebrows: 'rotate(0deg)' },
};

export const LitoPet = ({ emotion = 'neutral', size = 'medium', action = 'idle', onClick }: LitoPetProps) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const sizeClasses = {
    small: 'w-24 h-24',
    medium: 'w-40 h-40',
    large: 'w-56 h-56',
  };

  const actionAnimations = {
    idle: 'animate-breathe',
    wave: 'animate-wave',
    spin: 'animate-spin-slow',
    snuggle: 'animate-snuggle',
    sleep: 'animate-sleep',
  };

  const expression = emotionExpressions[emotion];

  useEffect(() => {
    if (action === 'wave') {
      const timer = setTimeout(() => {
        action = 'idle';
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [action]);

  return (
    <div
      className={`relative cursor-pointer transition-transform duration-300 ${sizeClasses[size]} ${actionAnimations[action]} ${isHovered ? 'scale-110' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      <svg viewBox="0 0 200 200" className="w-full h-full">
        <defs>
          <radialGradient id="litoBodyGradient" cx="50%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#F5EEE6" />
            <stop offset="50%" stopColor="#E8DCC4" />
            <stop offset="100%" stopColor="#D4C4A8" />
          </radialGradient>
          <radialGradient id="litoEarOuter" cx="50%" cy="30%" r="60%">
            <stop offset="0%" stopColor="#FFF3B0" />
            <stop offset="100%" stopColor="#FFD93D" />
          </radialGradient>
          <radialGradient id="litoEarInner" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFE4B5" />
            <stop offset="100%" stopColor="#FFDAB9" />
          </radialGradient>
          <filter id="fuzzy" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="1" />
          </filter>
          <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="3" dy="6" stdDeviation="6" floodOpacity="0.2" />
          </filter>
        </defs>
        
        <ellipse
          cx="100"
          cy="165"
          rx="55"
          ry="12"
          fill="rgba(74, 55, 40, 0.15)"
          className="animate-pulse"
        />
        
        <ellipse
          cx="55"
          cy="55"
          rx="28"
          ry="42"
          fill="url(#litoEarOuter)"
          transform={`rotate(${-15 + (isHovered ? -10 : 0)} 55 55)`}
          className="transition-transform duration-300"
        />
        <ellipse
          cx="55"
          cy="65"
          rx="18"
          ry="28"
          fill="url(#litoEarInner)"
          transform={`rotate(${-15 + (isHovered ? -10 : 0)} 55 55)`}
          className="transition-transform duration-300"
        />
        
        <ellipse
          cx="145"
          cy="55"
          rx="28"
          ry="42"
          fill="url(#litoEarOuter)"
          transform={`rotate(${15 + (isHovered ? 10 : 0)} 145 55)`}
          className="transition-transform duration-300"
        />
        <ellipse
          cx="145"
          cy="65"
          rx="18"
          ry="28"
          fill="url(#litoEarInner)"
          transform={`rotate(${15 + (isHovered ? 10 : 0)} 145 55)`}
          className="transition-transform duration-300"
        />
        
        <circle
          cx="100"
          cy="115"
          r="68"
          fill="url(#litoBodyGradient)"
          filter="url(#shadow)"
        />
        
        <circle
          cx="100"
          cy="120"
          r="58"
          fill="url(#litoBodyGradient)"
          opacity="0.8"
        />
        
        {expression.blush && (
          <>
            <ellipse cx="60" cy="125" rx="12" ry="8" fill="#FFDAB9" opacity="0.5" />
            <ellipse cx="140" cy="125" rx="12" ry="8" fill="#FFDAB9" opacity="0.5" />
          </>
        )}
        
        <path d="M 60 105 Q 65 85 80 85 Q 95 85 100 105 Q 105 85 120 85 Q 135 85 140 105" 
              fill="#E8DCC4" opacity="0.6" />
        
        <ellipse cx="75" cy="105" rx="18" ry="22" fill="white" />
        <ellipse cx="125" cy="105" rx="18" ry="22" fill="white" />
        
        <circle
          cx="75"
          cy="105"
          r="10"
          fill="#4A3728"
          className="transition-transform duration-300"
          style={{ transform: `scaleY(${expression.eyes})` }}
        >
          <circle cx="78" cy="102" r="3" fill="white" />
          <circle cx="79" cy="101" r="1" fill="#4A3728" />
        </circle>
        <circle
          cx="125"
          cy="105"
          r="10"
          fill="#4A3728"
          className="transition-transform duration-300"
          style={{ transform: `scaleY(${expression.eyes})` }}
        >
          <circle cx="128" cy="102" r="3" fill="white" />
          <circle cx="129" cy="101" r="1" fill="#4A3728" />
        </circle>
        
        <ellipse
          cx="58"
          cy="98"
          rx="8"
          ry="4"
          fill="#D4C4A8"
          transform={`rotate(${expression.eyebrows} 58 98)`}
          className="transition-transform duration-300"
        />
        <ellipse
          cx="142"
          cy="98"
          rx="8"
          ry="4"
          fill="#D4C4A8"
          transform={`rotate(${-parseFloat(expression.eyebrows)} 142 98)`}
          className="transition-transform duration-300"
        />
        
        <circle cx="100" cy="125" r="4" fill="#3D2E22" />
        
        <path
          d="M 80 135 Q 100 150 120 135"
          stroke="#4A3728"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          className="transition-transform duration-300 origin-center"
          style={{ transform: `scaleY(${expression.mouth})` }}
        />
        
        {emotion === 'happy' && (
          <>
            <circle cx="65" cy="115" r="4" fill="#FFB347" opacity="0.6" className="animate-ping" />
            <circle cx="135" cy="115" r="4" fill="#FFB347" opacity="0.6" className="animate-ping" />
          </>
        )}
        
        {action === 'sleep' && (
          <>
            <line x1="60" y1="95" x2="45" y2="90" stroke="#4A3728" strokeWidth="2" />
            <line x1="60" y1="100" x2="45" y2="100" stroke="#4A3728" strokeWidth="2" />
            <line x1="60" y1="105" x2="45" y2="110" stroke="#4A3728" strokeWidth="2" />
            <line x1="140" y1="95" x2="155" y2="90" stroke="#4A3728" strokeWidth="2" />
            <line x1="140" y1="100" x2="155" y2="100" stroke="#4A3728" strokeWidth="2" />
            <line x1="140" y1="105" x2="155" y2="110" stroke="#4A3728" strokeWidth="2" />
            <circle cx="155" cy="75" r="8" fill="white" opacity="0.5" className="animate-float" />
            <circle cx="170" cy="55" r="5" fill="white" opacity="0.3" className="animate-float" style={{ animationDelay: '0.5s' }} />
            <circle cx="145" cy="45" r="6" fill="white" opacity="0.4" className="animate-float" style={{ animationDelay: '1s' }} />
          </>
        )}
        
        <ellipse
          cx="155"
          cy="100"
          rx="14"
          ry="10"
          fill="#E8DCC4"
          className={`transition-transform duration-300 ${action === 'wave' ? 'animate-wave-arm' : ''}`}
        />
        
        <ellipse cx="45" cy="100" rx="14" ry="10" fill="#E8DCC4" />
        
        <ellipse cx="68" cy="160" rx="16" ry="13" fill="#D4C4A8" />
        <ellipse cx="132" cy="160" rx="16" ry="13" fill="#D4C4A8" />
      </svg>
      
      <style>{`
        @keyframes wave-arm {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(35deg); }
          75% { transform: rotate(-15deg); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes snuggle {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        @keyframes sleep {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        .animate-wave-arm {
          animation: wave-arm 0.5s ease-in-out infinite;
          transform-origin: left center;
        }
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
        .animate-snuggle {
          animation: snuggle 0.5s ease-in-out infinite;
        }
        .animate-sleep {
          animation: sleep 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};