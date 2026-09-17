import { NavLink } from "react-router";
import CodeItRocketLogo from "./CodeItRocketLogo";

export default function Footer() {
  return (
    <footer className="bg-[var(--bg-primary)] border-t border-[var(--border-subtle)] text-[var(--text-secondary)] py-6 sm:py-8 px-4 lg:px-8 mt-12 text-xs font-sans transition-colors duration-150 safe-bottom">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">

        {/* Left: Brand & Copyright */}
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
          <NavLink to="/" className="inline-flex items-center gap-2 text-[var(--text-primary)] font-bold text-sm tracking-tight font-heading">
            <CodeItRocketLogo className="w-4 h-4 text-[var(--text-primary)]" />
            <span>CodeIt</span>
          </NavLink>
          <span className="text-[var(--text-muted)] hidden sm:inline" aria-hidden="true">|</span>
          <span className="text-[var(--text-muted)] text-xs">
            © {new Date().getFullYear()} CodeIt. All rights reserved.
          </span>
        </div>

        {/* Right: Quick Links */}
        <nav aria-label="Footer" className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[var(--text-secondary)] text-xs">
          <NavLink to="/problems" className="hover:text-[var(--text-primary)] transition-colors">Problems</NavLink>
          <NavLink to="/leaderboard" className="hover:text-[var(--text-primary)] transition-colors">Leaderboard</NavLink>
          <a href="https://www.linkedin.com/in/tanushree-bobade-b699102b3/" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--text-primary)] transition-colors">LinkedIn</a>
          <a href="https://x.com/tanushree705" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--text-primary)] transition-colors">X (Twitter)</a>
          <a href="https://github.com/tanushreebobade/CodeIt" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--text-primary)] transition-colors">GitHub</a>
        </nav>

      </div>
    </footer>
  );
}
