interface LitoLogoProps {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
  className?: string;
}

export const LitoLogo = ({ size = 'medium', showText = true, className = '' }: LitoLogoProps) => {
  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-10 h-10',
    large: 'w-16 h-16',
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg viewBox="0 0 100 100" className={sizeClasses[size]}>
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFD93D" />
            <stop offset="100%" stopColor="#FFB347" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="45" fill="none" stroke="url(#logoGradient)" strokeWidth="4" />
        <path 
          d="M 35 50 Q 50 35 65 50 Q 50 65 35 50" 
          fill="none" 
          stroke="url(#logoGradient)" 
          strokeWidth="4"
          strokeLinecap="round"
        />
        <circle cx="50" cy="50" r="5" fill="#FFB347" />
      </svg>
      {showText && (
        <span className={`font-display ${size === 'small' ? 'text-sm' : size === 'large' ? 'text-2xl' : 'text-xl'} text-lito-dark`}>
          Lito
        </span>
      )}
    </div>
  );
};