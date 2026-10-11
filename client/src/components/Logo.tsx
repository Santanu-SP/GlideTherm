import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  showTagline = false,
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Custom Climate-Tech Emblem: Heat Arc + Glide Path */}
      <div className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-forest-800 to-forest-950 p-2 shadow-inner text-white ${iconSizes[size]}`}>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-full h-full text-emerald-400"
        >
          {/* Upper solar radiation contour */}
          <path d="M12 2v3" stroke="#f59e0b" strokeWidth="2.5" />
          <path d="M17.5 4.5l-2.1 2.1" stroke="#f59e0b" />
          <path d="M6.5 4.5l2.1 2.1" stroke="#f59e0b" />
          {/* Shift glide trajectory */}
          <path d="M4 19c4-1 6-7 10-7 3 0 5 3 6 4" stroke="#34d399" />
          {/* Shielded thermal balance point */}
          <circle cx="14" cy="12" r="2.5" fill="#10b981" stroke="none" />
          <path d="M4 21h16" stroke="#4e5a55" strokeWidth="1.5" />
        </svg>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className={`font-bold tracking-tight text-forest-950 ${textSizes[size]}`}>
            Glide<span className="text-forest-600 font-extrabold">Therm</span>
          </span>
          <span className="rounded bg-forest-100 px-1.5 py-0.5 text-[10px] font-semibold tracking-wider text-forest-800 uppercase">
            Beta
          </span>
        </div>
        {showTagline && (
          <span className="text-xs text-charcoal-500 font-normal">
            Beat the heat. Plan smarter shifts.
          </span>
        )}
      </div>
    </div>
  );
};
