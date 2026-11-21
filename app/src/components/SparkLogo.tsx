interface SparkLogoProps {
  className?: string;
  lowArousal?: boolean;
}

export default function SparkLogo({ className = 'h-9 w-9', lowArousal = false }: SparkLogoProps) {
  return (
    <span className="spark-logo-wrap relative inline-flex items-center justify-center">
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="sparkTileGrad" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={lowArousal ? '#1E293B' : '#1E293B'} />
            <stop offset="100%" stopColor="#090D16" />
          </linearGradient>
          <linearGradient id="sparkBeaconGrad" x1="22" y1="9" x2="40" y2="27" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={lowArousal ? '#6EE7B7' : '#FFB84D'} />
            <stop offset="100%" stopColor={lowArousal ? '#10B981' : '#E36C2B'} />
          </linearGradient>
        </defs>

        {/* Rounded Studio Frame */}
        <rect
          x="3"
          y="3"
          width="42"
          height="42"
          rx="12"
          fill="url(#sparkTileGrad)"
          stroke={lowArousal ? 'rgba(110, 231, 183, 0.35)' : 'rgba(251, 146, 60, 0.45)'}
          strokeWidth="1.5"
        />

        {/* AAC Symbol Grid Slots (Now / Next / Word-under-symbol motif) */}
        <rect
          x="10"
          y="12"
          width="11"
          height="11"
          rx="2.5"
          fill="rgba(255,255,255,0.12)"
          stroke="rgba(255,255,255,0.55)"
          strokeWidth="1.5"
        />
        <rect
          x="10"
          y="26"
          width="11"
          height="5"
          rx="1.5"
          fill="rgba(255,255,255,0.75)"
        />
        <rect
          x="24"
          y="26"
          width="14"
          height="5"
          rx="1.5"
          fill="rgba(255,255,255,0.35)"
        />

        {/* Luminous Spark Beacon */}
        <path
          d="M31.5 9.5L33.4 14.6L38.5 16.5L33.4 18.4L31.5 23.5L29.6 18.4L24.5 16.5L29.6 14.6L31.5 9.5Z"
          fill="url(#sparkBeaconGrad)"
          className="spark-beacon-star transition-colors duration-200"
        />
        <circle cx="31.5" cy="16.5" r="1.8" fill="#0F172A" />
      </svg>
    </span>
  );
}
