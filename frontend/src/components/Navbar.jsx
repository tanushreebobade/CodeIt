import { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../authSlice";
import { Sun, Moon, User, ShieldAlert, BookOpen, LogOut, Search, Menu, X, Trophy } from "lucide-react";
import CodeItRocketLogo from "./CodeItRocketLogo";
import { useTheme } from "../context/ThemeContext";

const navLinkClass = ({ isActive }) =>
  `px-3 py-1.5 rounded-[6px] transition-colors ${
    isActive
      ? "bg-[var(--bg-secondary)] text-[var(--text-primary)] font-semibold border border-[var(--border-subtle)]"
      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
  }`;

const mobileLinkClass = ({ isActive }) =>
  `flex items-center gap-2.5 px-3 py-2.5 rounded-[6px] text-sm transition-colors ${
    isActive
      ? "bg-[var(--bg-primary)] text-[var(--text-primary)] font-semibold border border-[var(--border-subtle)]"
      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-primary)]"
  }`;

function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading } = useSelector((state) => state.auth);
  const { theme, toggleTheme } = useTheme();

  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const profileRef = useRef(null);

  const handleLogout = () => {
    setProfileOpen(false);
    setMenuOpen(false);
    dispatch(logoutUser());
    navigate("/");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const q = searchQuery.trim();
    setMenuOpen(false);
    navigate(q ? `/problems?q=${encodeURIComponent(q)}` : "/problems");
  };

  // close the profile dropdown on outside click / escape
  useEffect(() => {
    if (!profileOpen && !menuOpen) return;
    const onClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") {
        setProfileOpen(false);
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [profileOpen, menuOpen]);

  const userInitial = user?.firstName ? user.firstName[0].toUpperCase() : "G";
  const isAdmin = user?.role === "admin";

  return (
    <nav
      className="bg-[var(--bg-primary)]/95 backdrop-blur border-b border-[var(--border-subtle)] text-[var(--text-primary)] px-4 lg:px-6 sticky top-0 z-50 text-sm font-sans transition-colors duration-150"
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 h-14">

        {/* Left: Brand Logo & Main Nav Links */}
        <div className="flex items-center gap-4 lg:gap-6 min-w-0">
          <NavLink
            to="/"
            className="flex items-center gap-2 font-bold text-[var(--text-primary)] text-lg tracking-tight shrink-0"
            aria-label="CodeIt home"
          >
            <CodeItRocketLogo className="w-5 h-5 text-[var(--text-primary)]" />
            <span className="font-bold text-lg tracking-tight font-heading">CodeIt</span>
          </NavLink>

          <div className="hidden md:flex items-center gap-1 font-medium text-sm">
            <NavLink to="/problems" className={navLinkClass}>
              Problems
            </NavLink>
            <NavLink to="/leaderboard" className={navLinkClass}>
              Leaderboard
            </NavLink>
            {isAdmin && (
              <NavLink to="/admin" className={({ isActive }) => `${navLinkClass({ isActive })} flex items-center gap-1.5`}>
                <ShieldAlert className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Admin Studio</span>
              </NavLink>
            )}
          </div>
        </div>

        {/* Right Controls: Search, Theme, Profile/Auth */}
        <div className="flex items-center gap-2 sm:gap-3">

          {/* Quick Search Input */}
          <form onSubmit={handleSearch} role="search" className="relative hidden lg:block">
            <label htmlFor="navbar-search" className="sr-only">Search problems</label>
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" aria-hidden="true" />
            <input
              id="navbar-search"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search problems..."
              className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[var(--text-primary)] placeholder-[var(--text-muted)] text-xs rounded-[6px] pl-8 pr-3 py-1.5 w-44 focus:w-56 transition-all focus:outline-none focus:border-[var(--text-secondary)]"
            />
          </form>

          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-[6px] bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors flex items-center justify-center"
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? <Sun className="w-4 h-4" aria-hidden="true" /> : <Moon className="w-4 h-4" aria-hidden="true" />}
          </button>

          {/* User Profile Avatar / Dropdown */}
          {user ? (
            <div className="relative hidden md:block" ref={profileRef}>
              <button
                type="button"
                onClick={() => setProfileOpen((o) => !o)}
                className="w-8 h-8 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[var(--text-primary)] font-semibold flex items-center justify-center text-xs hover:border-[var(--text-secondary)] transition-colors"
                aria-haspopup="menu"
                aria-expanded={profileOpen}
                aria-label="Account menu"
              >
                {userInitial}
              </button>

              {profileOpen && (
                <ul
                  role="menu"
                  className="absolute right-0 mt-2 p-2 shadow-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-[8px] w-60 text-xs text-[var(--text-secondary)] animate-fade-in-up"
                >
                  <li className="px-3 py-2 border-b border-[var(--border-subtle)] mb-1">
                    <span className="font-semibold text-[var(--text-primary)] text-xs block truncate">
                      {user?.firstName} {user?.lastName || ""}
                    </span>
                    <span className="text-[var(--text-muted)] text-[11px] block truncate">
                      {user?.emailId}
                    </span>
                  </li>

                  <li role="none">
                    <NavLink role="menuitem" to="/profile" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-[6px] text-[var(--text-primary)] hover:bg-[var(--bg-primary)]">
                      <User className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>My Profile</span>
                    </NavLink>
                  </li>

                  <li role="none">
                    <NavLink role="menuitem" to="/problems" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-[6px] text-[var(--text-primary)] hover:bg-[var(--bg-primary)]">
                      <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Problems</span>
                    </NavLink>
                  </li>

                  {isAdmin && (
                    <li role="none">
                      <NavLink role="menuitem" to="/admin" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-[6px] text-[var(--text-primary)] hover:bg-[var(--bg-primary)]">
                        <ShieldAlert className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Admin Studio</span>
                      </NavLink>
                    </li>
                  )}

                  <li role="none" className="border-t border-[var(--border-subtle)] mt-1 pt-1">
                    <button
                      role="menuitem"
                      type="button"
                      onClick={handleLogout}
                      disabled={loading}
                      className="w-full text-left text-[var(--text-primary)] hover:bg-[var(--bg-primary)] px-3 py-2 rounded-[6px] font-medium text-xs flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Sign Out</span>
                    </button>
                  </li>
                </ul>
              )}
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <NavLink
                to="/login"
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium text-xs px-2.5 py-1.5"
              >
                Sign In
              </NavLink>
              <NavLink
                to="/signup"
                className="bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold px-3.5 py-1.5 rounded-[6px] text-xs transition-colors"
              >
                Sign Up
              </NavLink>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className="md:hidden p-2 rounded-[6px] bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
          >
            {menuOpen ? <X className="w-4 h-4" aria-hidden="true" /> : <Menu className="w-4 h-4" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {/* Mobile navigation panel */}
      {menuOpen && (
        <div
          id="mobile-navigation"
          className="md:hidden border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)] -mx-4 px-4 py-3 space-y-3 animate-fade-in-up"
        >
          <form onSubmit={handleSearch} role="search" className="relative">
            <label htmlFor="mobile-search" className="sr-only">Search problems</label>
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" aria-hidden="true" />
            <input
              id="mobile-search"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search problems..."
              className="w-full bg-[var(--bg-primary)] border border-[var(--border-subtle)] text-[var(--text-primary)] placeholder-[var(--text-muted)] text-sm rounded-[6px] pl-9 pr-3 py-2.5 focus:outline-none focus:border-[var(--text-secondary)]"
            />
          </form>

          <div className="flex flex-col gap-1">
            <NavLink to="/problems" className={mobileLinkClass} onClick={() => setMenuOpen(false)}>
              <BookOpen className="w-4 h-4" aria-hidden="true" /> Problems
            </NavLink>
            <NavLink to="/leaderboard" className={mobileLinkClass} onClick={() => setMenuOpen(false)}>
              <Trophy className="w-4 h-4" aria-hidden="true" /> Leaderboard
            </NavLink>
            {user && (
              <NavLink to="/profile" className={mobileLinkClass} onClick={() => setMenuOpen(false)}>
                <User className="w-4 h-4" aria-hidden="true" /> My Profile
              </NavLink>
            )}
            {isAdmin && (
              <NavLink to="/admin" className={mobileLinkClass} onClick={() => setMenuOpen(false)}>
                <ShieldAlert className="w-4 h-4" aria-hidden="true" /> Admin Studio
              </NavLink>
            )}
          </div>

          <div className="pt-3 border-t border-[var(--border-subtle)]">
            {user ? (
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[var(--text-primary)] truncate">
                    {user.firstName} {user.lastName || ""}
                  </p>
                  <p className="text-xs text-[var(--text-muted)] truncate">{user.emailId}</p>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="shrink-0 flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-[6px] border border-[var(--border-subtle)] text-[var(--text-primary)] hover:bg-[var(--bg-primary)]"
                >
                  <LogOut className="w-3.5 h-3.5" aria-hidden="true" /> Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <NavLink
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="text-center text-sm font-medium px-3 py-2.5 rounded-[6px] border border-[var(--border-subtle)] text-[var(--text-primary)] hover:bg-[var(--bg-primary)]"
                >
                  Sign In
                </NavLink>
                <NavLink
                  to="/signup"
                  onClick={() => setMenuOpen(false)}
                  className="text-center text-sm font-semibold px-3 py-2.5 rounded-[6px] bg-gradient-to-r from-sky-500 to-indigo-600 text-white"
                >
                  Sign Up
                </NavLink>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
