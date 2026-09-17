import { NavLink } from "react-router";
import CodeItRocketLogo from "../components/CodeItRocketLogo";
import { Home, BookOpen } from "lucide-react";

function NotFound() {
  return (
    <div className="min-h-dvh bg-[var(--bg-primary)] text-[var(--text-primary)] flex flex-col items-center justify-center p-6 text-center font-sans">
      <CodeItRocketLogo className="w-16 h-16 sm:w-20 sm:h-20 mb-6 text-sky-400 drop-shadow-[0_0_20px_rgba(56,189,248,0.4)]" />
      <span className="text-xs font-bold text-sky-400 uppercase tracking-widest mb-2">404 Error</span>
      <h1 className="text-3xl sm:text-5xl font-black tracking-tight mb-3 font-heading">Page Not Found</h1>
      <p className="text-[var(--text-secondary)] text-sm max-w-md mb-8">
        The page or problem you are attempting to reach does not exist or has moved to another galaxy.
      </p>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full max-w-xs sm:max-w-none sm:w-auto">
        <NavLink
          to="/"
          className="bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold text-sm px-5 py-2.5 rounded-[6px] flex items-center justify-center gap-2 transition-colors"
        >
          <Home className="w-4 h-4" aria-hidden="true" />
          <span>Home</span>
        </NavLink>
        <NavLink
          to="/problems"
          className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] hover:bg-[var(--bg-tertiary)] text-[var(--text-primary)] font-semibold text-sm px-5 py-2.5 rounded-[6px] flex items-center justify-center gap-2 transition-colors"
        >
          <BookOpen className="w-4 h-4" aria-hidden="true" />
          <span>Practice Problems</span>
        </NavLink>
      </div>
    </div>
  );
}

export default NotFound;
