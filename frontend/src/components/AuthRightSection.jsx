import { Sparkles, Code2, Bot, Terminal } from 'lucide-react';

export default function AuthRightSection() {
  return (
    <div className="w-full bg-[#121216] border border-[#22222a] rounded-3xl p-6 sm:p-8 lg:p-10 flex flex-col justify-between relative shadow-2xl overflow-hidden min-h-[560px]">
      
      {/* Background ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500/10 blur-[100px] pointer-events-none rounded-full" />
      <div className="absolute bottom-10 right-10 w-60 h-60 bg-emerald-500/10 blur-[90px] pointer-events-none rounded-full" />

      {/* Top Header */}
      <div className="text-center relative z-10">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Welcome to CodeIt
        </h2>
        <p className="text-gray-400 text-xs sm:text-sm mt-2 max-w-sm mx-auto font-medium">
          Access your account with CodeIt. Pick your preferred login method.
        </p>
      </div>

      {/* Center 3D Futuristic Code & AI Terminal Graphic (Replaces 3 books) */}
      <div className="my-6 flex flex-col items-center justify-center relative z-10">
        <div className="relative w-56 h-44 sm:w-64 sm:h-48 flex items-center justify-center">
          
          {/* Glowing Aura */}
          <div className="absolute w-44 h-44 bg-indigo-500/20 rounded-full filter blur-xl animate-pulse" />
          <div className="absolute w-36 h-36 bg-emerald-500/20 rounded-full filter blur-lg" />

          {/* 3D Code Window / AI Terminal SVG */}
          <svg
            viewBox="0 0 260 190"
            className="w-full h-full drop-shadow-[0_15px_35px_rgba(99,102,241,0.35)] transition-transform duration-500 hover:scale-105"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Window Gradient */}
              <linearGradient id="windowBg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1a1b26" />
                <stop offset="100%" stopColor="#0f1017" />
              </linearGradient>
              {/* Border Gradient */}
              <linearGradient id="windowBorder" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="50%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
              {/* Code Line Gradients */}
              <linearGradient id="lineGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#818cf8" />
                <stop offset="100%" stopColor="#c084fc" />
              </linearGradient>
              <linearGradient id="lineGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#34d399" />
                <stop offset="100%" stopColor="#38bdf8" />
              </linearGradient>
              {/* Gloss */}
              <linearGradient id="glassGloss" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.12" />
                <stop offset="50%" stopColor="#ffffff" stopOpacity="0.02" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0.4" />
              </linearGradient>
            </defs>

            {/* Base Drop Shadow Ellipse */}
            <ellipse cx="130" cy="175" rx="95" ry="12" fill="#000000" opacity="0.6" />

            {/* Main Terminal Window Frame */}
            <rect x="25" y="15" width="210" height="150" rx="16" fill="url(#windowBg)" stroke="url(#windowBorder)" strokeWidth="2.5" />
            <rect x="25" y="15" width="210" height="150" rx="16" fill="url(#glassGloss)" />

            {/* Window Header Bar */}
            <path d="M26 16 C26 23, 235 23, 234 16 L234 38 L26 38 Z" fill="#13141d" opacity="0.9" />
            <line x1="25" y1="38" x2="235" y2="38" stroke="#2a2c3d" strokeWidth="1.5" />

            {/* Terminal Window Buttons */}
            <circle cx="42" cy="27" r="4.5" fill="#ef4444" opacity="0.85" />
            <circle cx="56" cy="27" r="4.5" fill="#f59e0b" opacity="0.85" />
            <circle cx="70" cy="27" r="4.5" fill="#10b981" opacity="0.85" />

            {/* Title text */}
            <text x="130" y="30" fill="#94a3b8" fontSize="10" fontFamily="monospace" fontWeight="bold" textAnchor="middle">codeit-ai-editor.ts</text>

            {/* Left Code Editor View */}
            <g transform="translate(42, 52)">
              {/* Line Numbers */}
              <text x="0" y="14" fill="#475569" fontSize="10" fontFamily="monospace">1</text>
              <text x="0" y="32" fill="#475569" fontSize="10" fontFamily="monospace">2</text>
              <text x="0" y="50" fill="#475569" fontSize="10" fontFamily="monospace">3</text>
              <text x="0" y="68" fill="#475569" fontSize="10" fontFamily="monospace">4</text>
              <text x="0" y="86" fill="#475569" fontSize="10" fontFamily="monospace">5</text>

              {/* Code lines */}
              <rect x="18" y="6" width="55" height="7" rx="3.5" fill="url(#lineGrad1)" />
              <rect x="78" y="6" width="35" height="7" rx="3.5" fill="#38bdf8" opacity="0.8" />
              
              <rect x="28" y="24" width="70" height="7" rx="3.5" fill="url(#lineGrad2)" />
              
              <rect x="28" y="42" width="45" height="7" rx="3.5" fill="#f43f5e" opacity="0.8" />
              <rect x="78" y="42" width="40" height="7" rx="3.5" fill="#fbbf24" opacity="0.85" />
              
              <rect x="18" y="60" width="85" height="7" rx="3.5" fill="url(#lineGrad1)" />
              
              <rect x="18" y="78" width="50" height="7" rx="3.5" fill="#34d399" opacity="0.9" />
              {/* Typing Cursor */}
              <rect x="72" y="76" width="3.5" height="11" fill="#818cf8" className="animate-pulse" />
            </g>

            {/* AI Assistant Badge overlay floating on bottom right */}
            <g transform="translate(145, 100)">
              <rect x="0" y="0" width="80" height="52" rx="12" fill="#1e1b4b" stroke="#6366f1" strokeWidth="1.5" />
              <rect x="0" y="0" width="80" height="52" rx="12" fill="url(#glassGloss)" />
              
              <circle cx="20" cy="20" r="10" fill="#4f46e5" />
              {/* Bot Icon */}
              <path d="M16 17 L24 17 M20 13 L20 23 M16 23 L24 23" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
              <text x="34" y="23" fill="#a5b4fc" fontSize="9" fontFamily="sans-serif" fontWeight="bold">AI Active</text>

              <rect x="10" y="36" width="60" height="4" rx="2" fill="#34d399" />
            </g>

            {/* Sparkles */}
            <g transform="translate(205, 30)">
              <path d="M6 0 L7.5 4.5 L12 6 L7.5 7.5 L6 12 L4.5 7.5 L0 6 L4.5 4.5 Z" fill="#fbbf24" opacity="0.9" />
            </g>
            <g transform="translate(20, 130)">
              <path d="M4 0 L5 3 L8 4 L5 5 L4 8 L3 5 L0 4 L3 3 Z" fill="#38bdf8" opacity="0.8" />
            </g>
          </svg>
        </div>
      </div>

      {/* Exactly the 2 requested Feature Cards */}
      <div className="space-y-4 relative z-10">
        
        {/* Feature 1: Practice: Interactive Coding */}
        <div className="bg-[#181820]/90 border border-[#252532] rounded-2xl p-4 sm:p-4.5 flex items-start gap-4 hover:border-emerald-500/40 transition-all duration-300 shadow-md group">
          <div className="w-11 h-11 rounded-xl bg-[#20202c] border border-[#2e2e40] flex items-center justify-center shrink-0 shadow-inner group-hover:bg-emerald-500/10 group-hover:border-emerald-500/30 transition-all">
            <Code2 className="w-6 h-6 text-emerald-400" />
          </div>
          <div className="space-y-1">
            <h3 className="text-white text-sm font-semibold tracking-wide flex items-center gap-2">
              Practice: Interactive Coding
            </h3>
            <p className="text-gray-400 text-xs leading-relaxed font-normal">
              Sharpen your skills with hands-on coding challenges, real-world projects, and interactive exercises designed to reinforce your learning.
            </p>
          </div>
        </div>

        {/* Feature 2: AI Guidance: Instant Debugging */}
        <div className="bg-[#181820]/90 border border-[#252532] rounded-2xl p-4 sm:p-4.5 flex items-start gap-4 hover:border-indigo-500/40 transition-all duration-300 shadow-md group">
          <div className="w-11 h-11 rounded-xl bg-[#20202c] border border-[#2e2e40] flex items-center justify-center shrink-0 shadow-inner group-hover:bg-indigo-500/10 group-hover:border-indigo-500/30 transition-all">
            <Sparkles className="w-6 h-6 text-indigo-400" />
          </div>
          <div className="space-y-1">
            <h3 className="text-white text-sm font-semibold tracking-wide flex items-center gap-2">
              AI Guidance: Instant Debugging
            </h3>
            <p className="text-gray-400 text-xs leading-relaxed font-normal">
              Get real-time code analysis, intelligent hint suggestions, and automated test case evaluation powered by AI.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
