export default function CodeItRocketLogo({ className = "w-8 h-8" }) {
  return (
    <svg viewBox="0 0 200 200" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="rocketBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="60%" stopColor="#0284c7" />
          <stop offset="100%" stopColor="#0369a1" />
        </linearGradient>

        <linearGradient id="rocketFinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0284c7" />
          <stop offset="100%" stopColor="#0c4a6e" />
        </linearGradient>

        <linearGradient id="monitorBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>

        <linearGradient id="flameGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="50%" stopColor="#ef4444" />
          <stop offset="100%" stopColor="#dc2626" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Monitor Base Stand */}
      <path d="M70 170 L130 170 L125 152 L75 152 Z" fill="#334155" />
      <rect x="60" y="170" width="80" height="8" rx="4" fill="#475569" />

      {/* Monitor Outer Frame */}
      <rect x="20" y="45" width="160" height="110" rx="16" fill="url(#monitorBgGrad)" stroke="#38bdf8" strokeWidth="3" />
      
      {/* Monitor Header Bar */}
      <rect x="20" y="45" width="160" height="24" rx="16" fill="#0f172a" />
      <circle cx="36" cy="57" r="3.5" fill="#ef4444" />
      <circle cx="48" cy="57" r="3.5" fill="#f59e0b" />
      <circle cx="60" cy="57" r="3.5" fill="#10b981" />
      <text x="145" y="61" fill="#38bdf8" fontSize="10" fontFamily="monospace" fontWeight="bold">&lt;/&gt;</text>

      {/* Code Lines */}
      <rect x="35" y="80" width="40" height="4" rx="2" fill="#334155" opacity="0.6" />
      <rect x="35" y="92" width="60" height="4" rx="2" fill="#334155" opacity="0.6" />
      <rect x="35" y="104" width="30" height="4" rx="2" fill="#334155" opacity="0.6" />
      
      <rect x="125" y="80" width="40" height="4" rx="2" fill="#334155" opacity="0.6" />
      <rect x="110" y="92" width="55" height="4" rx="2" fill="#334155" opacity="0.6" />
      <rect x="135" y="104" width="30" height="4" rx="2" fill="#334155" opacity="0.6" />

      {/* Rocket Flame */}
      <path d="M88 130 Q100 165 112 130 Z" fill="url(#flameGrad)" />

      {/* Rocket Fins */}
      <path d="M72 110 C62 115 58 132 58 132 L82 126 Z" fill="url(#rocketFinGrad)" />
      <path d="M128 110 C138 115 142 132 142 132 L118 126 Z" fill="url(#rocketFinGrad)" />

      {/* Rocket Main Body */}
      <path d="M100 20 C78 60 78 125 78 125 L122 125 C122 125 122 60 100 20 Z" fill="url(#rocketBodyGrad)" />
      <rect x="86" y="125" width="28" height="7" rx="3" fill="#1e293b" />

      {/* Rocket Window */}
      <circle cx="100" cy="70" r="13" fill="#e0f2fe" stroke="#0284c7" strokeWidth="3" />
      <circle cx="100" cy="70" r="7" fill="#0284c7" />
      <circle cx="97" cy="67" r="2.5" fill="#ffffff" />
    </svg>
  );
}
