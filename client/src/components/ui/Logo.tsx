interface LogoProps {
  className?: string;
  iconOnly?: boolean;
  dark?: boolean;
}

export default function Logo({ className = 'h-9', iconOnly = false, dark = false }: LogoProps) {
  const textColor = dark ? '#FFFFFF' : '#3B3B3B';
  const plusColor = '#E8913A';

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      {/* C+ Icon */}
      <svg width="36" height="36" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg" className="shrink-0 h-full w-auto">
        <rect width="256" height="256" rx="48" fill="#0B1F3A"/>
        <g stroke="#FFFFFF" strokeWidth="20" strokeLinecap="round" strokeLinejoin="round" fill="none">
          <path d="M 168 84 A 60 60 0 1 0 168 172"/>
          <line x1="168" y1="66" x2="168" y2="118"/>
          <line x1="142" y1="92" x2="194" y2="92"/>
        </g>
      </svg>
      {/* Brand Text */}
      {!iconOnly && (
        <svg viewBox="0 0 140 28" xmlns="http://www.w3.org/2000/svg" className="h-5 w-auto shrink-0">
          <text x="0" y="22" fontFamily="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif" fontWeight="700" fontSize="24" fill={textColor}>
            Control<tspan fill={plusColor}>Plus</tspan>
          </text>
        </svg>
      )}
    </span>
  );
}
