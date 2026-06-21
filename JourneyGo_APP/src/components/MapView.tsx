interface Props {
  from: string;
  to: string;
  distance: number;
  duration: number;
}

export default function MapView({ from, to, distance, duration }: Props) {
  const fromLabel = from.split(',')[0];
  const toLabel = to.split(',')[0];

  return (
    <div className="relative w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200" style={{ height: 176 }}>
      <svg
        viewBox="0 0 380 176"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute inset-0 w-full h-full"
        preserveAspectRatio="xMidYMid slice"
      >
        {/* Background */}
        <rect width="380" height="176" fill="#f1f5f9" />

        {/* Grid */}
        <defs>
          <pattern id="mapgrid" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#e2e8f0" strokeWidth="0.5" />
          </pattern>
          <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#22c55e" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <rect width="380" height="176" fill="url(#mapgrid)" />

        {/* Major roads */}
        <rect x="0" y="84" width="380" height="6" rx="3" fill="#cbd5e1" opacity="0.8" />
        <rect x="0" y="120" width="380" height="4" rx="2" fill="#cbd5e1" opacity="0.6" />
        <rect x="70" y="0" width="6" height="176" rx="3" fill="#cbd5e1" opacity="0.8" />
        <rect x="190" y="0" width="4" height="176" rx="2" fill="#cbd5e1" opacity="0.6" />
        <rect x="310" y="0" width="6" height="176" rx="3" fill="#cbd5e1" opacity="0.8" />

        {/* City blocks */}
        <rect x="10" y="10" width="50" height="60" rx="6" fill="#dde4ee" />
        <rect x="80" y="10" width="100" height="60" rx="6" fill="#dde4ee" />
        <rect x="200" y="10" width="100" height="60" rx="6" fill="#dde4ee" />
        <rect x="320" y="10" width="50" height="60" rx="6" fill="#dde4ee" />

        <rect x="10" y="96" width="50" height="30" rx="6" fill="#dde4ee" />
        <rect x="80" y="96" width="100" height="30" rx="6" fill="#dde4ee" />
        <rect x="200" y="96" width="100" height="30" rx="6" fill="#dde4ee" />
        <rect x="320" y="96" width="50" height="30" rx="6" fill="#dde4ee" />

        <rect x="10" y="136" width="50" height="30" rx="6" fill="#dde4ee" />
        <rect x="80" y="136" width="100" height="30" rx="6" fill="#dde4ee" />
        <rect x="200" y="136" width="100" height="30" rx="6" fill="#dde4ee" />
        <rect x="320" y="136" width="50" height="30" rx="6" fill="#dde4ee" />

        {/* Route path - smooth bezier */}
        <path
          d="M 50 148 C 80 120, 100 60, 160 48 C 220 36, 270 30, 330 28"
          fill="none"
          stroke="url(#routeGrad)"
          strokeWidth="4"
          strokeLinecap="round"
          filter="url(#glow)"
          opacity="0.9"
        />

        {/* Origin marker */}
        <circle cx="50" cy="148" r="10" fill="white" />
        <circle cx="50" cy="148" r="6" fill="#22c55e" />
        <circle cx="50" cy="148" r="2.5" fill="white" />

        {/* Destination marker */}
        <circle cx="330" cy="28" r="10" fill="white" />
        <circle cx="330" cy="28" r="6" fill="#ef4444" />
        <circle cx="330" cy="28" r="2.5" fill="white" />

        {/* Waypoint dots */}
        <circle cx="140" cy="52" r="3.5" fill="white" stroke="#3b82f6" strokeWidth="2" />
        <circle cx="230" cy="36" r="3.5" fill="white" stroke="#3b82f6" strokeWidth="2" />
      </svg>

      {/* Labels */}
      <div className="absolute top-2.5 left-3 max-w-[90px]">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-1 shadow-sm">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
          <span className="text-[10px] font-bold text-gray-700 truncate">{fromLabel}</span>
        </div>
      </div>

      <div className="absolute top-2.5 right-3 max-w-[90px]">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-1 shadow-sm">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
          <span className="text-[10px] font-bold text-gray-700 truncate">{toLabel}</span>
        </div>
      </div>

      {/* Info pill */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
        <div className="bg-gray-900/90 backdrop-blur-sm text-white text-xs font-bold px-4 py-1.5 rounded-full flex items-center gap-2 shadow-lg">
          <span className="text-green-400">●</span>
          <span>{distance} km · ~{duration} min</span>
        </div>
      </div>
    </div>
  );
}


