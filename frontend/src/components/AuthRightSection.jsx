import { Terminal, Bot, Tv } from 'lucide-react';

export default function AuthRightSection() {
  return (
    <div className="w-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-[8px] p-6 sm:p-8 flex flex-col justify-between relative min-h-[500px] overflow-hidden">
      {/* Background glow accent */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="text-center relative z-10">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[4px] bg-sky-500/10 border border-sky-500/20 text-sky-400 text-[11px] font-mono font-semibold mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse"></span>
          CodeIt Platform
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] tracking-tight font-heading">
          Practice DSA. Write Better Code.
        </h2>
        <p className="text-[var(--text-secondary)] text-xs sm:text-sm mt-2 max-w-sm mx-auto">
          Access your account with CodeIt. Pick your preferred login method.
        </p>
      </div>

      <div className="my-5 flex flex-col items-center justify-center relative z-10">
        <div className="relative w-56 h-36 sm:w-64 sm:h-40 flex items-center justify-center">
          <svg
            viewBox="0 0 260 180"
            className="w-full h-full"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect x="25" y="15" width="210" height="145" rx="8" fill="var(--bg-primary)" stroke="var(--border-subtle)" strokeWidth="1.5" />

            <path d="M25 15 H235 V38 H25 Z" fill="var(--bg-secondary)" />
            <line x1="25" y1="38" x2="235" y2="38" stroke="var(--border-subtle)" strokeWidth="1" />

            <circle cx="42" cy="27" r="3.5" fill="#ef4444" />
            <circle cx="54" cy="27" r="3.5" fill="#f59e0b" />
            <circle cx="66" cy="27" r="3.5" fill="#10b981" />

            <text x="130" y="30" fill="var(--text-secondary)" fontSize="10" fontFamily="monospace" fontWeight="bold" textAnchor="middle">CodeIt IDE</text>

            <g transform="translate(42, 52)">
              <text x="0" y="14" fill="var(--text-muted)" fontSize="10" fontFamily="monospace">1</text>
              <text x="0" y="32" fill="var(--text-muted)" fontSize="10" fontFamily="monospace">2</text>
              <text x="0" y="50" fill="var(--text-muted)" fontSize="10" fontFamily="monospace">3</text>
              <text x="0" y="68" fill="var(--text-muted)" fontSize="10" fontFamily="monospace">4</text>

              <rect x="18" y="6" width="55" height="6" rx="2" fill="#38bdf8" opacity="0.6" />
              <rect x="78" y="6" width="35" height="6" rx="2" fill="#818cf8" opacity="0.8" />

              <rect x="28" y="24" width="70" height="6" rx="2" fill="var(--text-secondary)" opacity="0.5" />

              <rect x="28" y="42" width="45" height="6" rx="2" fill="#34d399" opacity="0.6" />
              <rect x="78" y="42" width="40" height="6" rx="2" fill="var(--text-secondary)" opacity="0.6" />

              <rect x="18" y="60" width="85" height="6" rx="2" fill="#38bdf8" opacity="0.9" />

              <rect x="106" y="58" width="2" height="10" fill="#38bdf8" />
            </g>

            <g transform="translate(145, 95)">
              <rect x="0" y="0" width="80" height="50" rx="6" fill="var(--bg-secondary)" stroke="#38bdf8" strokeWidth="1" strokeOpacity="0.4" />
              <text x="10" y="20" fill="#38bdf8" fontSize="9" fontFamily="sans-serif" fontWeight="bold">AI Guidance</text>
              <text x="10" y="36" fill="#34d399" fontSize="8" fontFamily="sans-serif" fontWeight="semibold">O(N log N)</text>
            </g>
          </svg>
        </div>
      </div>

      <div className="space-y-2.5 relative z-10">
        <div className="bg-[var(--bg-primary)] border border-[var(--border-subtle)] hover:border-sky-500/30 rounded-[6px] p-3 flex items-start gap-3 transition-colors">
          <div className="w-7 h-7 rounded-[6px] bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shrink-0 text-sky-400 mt-0.5">
            <Terminal className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-[var(--text-primary)] text-xs font-semibold">
              Practice: Solve. Learn. Improve.
            </h3>
            <p className="text-[var(--text-secondary)] text-[11px] leading-relaxed mt-0.5">
              Sharpen your DSA and problem-solving skills through structured coding challenges.
            </p>
          </div>
        </div>

        <div className="bg-[var(--bg-primary)] border border-[var(--border-subtle)] hover:border-violet-500/30 rounded-[6px] p-3 flex items-start gap-3 transition-colors">
          <div className="w-7 h-7 rounded-[6px] bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0 text-violet-400 mt-0.5">
            <Bot className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-[var(--text-primary)] text-xs font-semibold">
              AI Guidance: Your Coding Companion
            </h3>
            <p className="text-[var(--text-secondary)] text-[11px] leading-relaxed mt-0.5">
              Get smart hints, debug your code, and understand time and space complexity.
            </p>
          </div>
        </div>

        <div className="bg-[var(--bg-primary)] border border-[var(--border-subtle)] hover:border-purple-500/30 rounded-[6px] p-3 flex items-start gap-3 transition-colors">
          <div className="w-7 h-7 rounded-[6px] bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0 text-purple-400 mt-0.5">
            <Tv className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-[var(--text-primary)] text-xs font-semibold">
              Video Solutions: Step-by-Step Breakdown
            </h3>
            <p className="text-[var(--text-secondary)] text-[11px] leading-relaxed mt-0.5">
              Watch detailed video solutions for complex problems.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
