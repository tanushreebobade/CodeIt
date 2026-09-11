import { NavLink } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../authSlice";
import { Sun, Moon, User, ShieldAlert, BookOpen, LogOut, Search, Bell } from "lucide-react";
import CodeItRocketLogo from "./CodeItRocketLogo";
import { useTheme } from "../context/ThemeContext";

function Navbar() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  const userInitial = user?.firstName ? user.firstName[0].toUpperCase() : "G";

  return (
    <nav className="bg-[var(--bg-primary)] border-b border-[var(--border-subtle)] text-[var(--text-primary)] px-4 lg:px-6 py-2.5 sticky top-0 z-50 text-sm font-sans transition-colors duration-150">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Left: Brand Logo & Main Nav Links */}
        <div className="flex items-center gap-6">
          <NavLink
            to="/"
            className="flex items-center gap-2 font-bold text-[var(--text-primary)] text-lg tracking-tight"
          >
            <CodeItRocketLogo className="w-5 h-5 text-[var(--text-primary)]" />
            <span className="font-bold text-lg tracking-tight font-heading">CodeIt</span>
          </NavLink>

          <div className="hidden md:flex items-center gap-1 font-medium text-sm">
            <NavLink
              to="/problems"
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-[6px] transition-colors ${
                  isActive
                    ? "bg-[var(--bg-secondary)] text-[var(--text-primary)] font-semibold border border-[var(--border-subtle)]"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`
              }
            >
              Problems
            </NavLink>

            <NavLink
              to="/leaderboard"
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-[6px] transition-colors ${
                  isActive
                    ? "bg-[var(--bg-secondary)] text-[var(--text-primary)] font-semibold border border-[var(--border-subtle)]"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`
              }
            >
              Leaderboard
            </NavLink>


            {user?.role === "admin" && (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-[6px] flex items-center gap-1.5 transition-colors ${
                    isActive
                      ? "bg-[var(--bg-secondary)] text-[var(--text-primary)] font-semibold border border-[var(--border-subtle)]"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`
                }
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Admin Studio</span>
              </NavLink>
            )}
          </div>
        </div>

        {/* Right Controls: Search, Theme, Notifications, Profile/Auth */}
        <div className="flex items-center gap-3">
          
          {/* Quick Search Input */}
          <div className="relative hidden sm:block">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search problems..."
              className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[var(--text-primary)] placeholder-[var(--text-muted)] text-xs rounded-[6px] pl-8 pr-3 py-1.5 w-40 focus:outline-none focus:border-[var(--text-secondary)]"
            />
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-[6px] bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors flex items-center justify-center"
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Notifications Bell */}
          <button
            className="p-1.5 rounded-[6px] bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors hidden sm:flex items-center justify-center"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
          </button>

          {/* User Profile Avatar / Dropdown */}
          {user ? (
            <div className="dropdown dropdown-end">
              <div
                tabIndex={0}
                role="button"
                className="flex items-center gap-2 cursor-pointer"
              >
                <div className="w-7 h-7 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[var(--text-primary)] font-semibold flex items-center justify-center text-xs">
                  {userInitial}
                </div>
              </div>

              <ul
                tabIndex={0}
                className="dropdown-content menu p-2 shadow-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-[8px] w-56 mt-2 text-xs text-[var(--text-secondary)]"
              >
                <li className="px-3 py-2 border-b border-[var(--border-subtle)] mb-1">
                  <span className="font-semibold text-[var(--text-primary)] text-xs block">
                    {user?.firstName} {user?.lastName || ""}
                  </span>
                  <span className="text-[var(--text-muted)] text-[11px] truncate">
                    {user?.emailId}
                  </span>
                </li>

                <li>
                  <NavLink to="/profile" className="flex items-center gap-2 py-1.5 text-[var(--text-primary)]">
                    <User className="w-3.5 h-3.5" />
                    <span>My Profile</span>
                  </NavLink>
                </li>

                <li>
                  <NavLink to="/problems" className="flex items-center gap-2 py-1.5 text-[var(--text-primary)]">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Problems</span>
                  </NavLink>
                </li>

                {user?.role === "admin" && (
                  <li>
                    <NavLink to="/admin" className="flex items-center gap-2 py-1.5 text-[var(--text-primary)]">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>Admin Studio</span>
                    </NavLink>
                  </li>
                )}

                <li className="border-t border-[var(--border-subtle)] mt-1 pt-1">
                  <button
                    onClick={handleLogout}
                    className="text-[var(--text-primary)] hover:bg-[var(--bg-primary)] py-2 font-medium text-xs flex items-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </li>
              </ul>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <NavLink
                to="/login"
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium text-xs px-2.5 py-1.5"
              >
                Sign In
              </NavLink>
              <NavLink
                to="/signup"
                className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[var(--text-primary)] hover:bg-[var(--bg-primary)] font-medium px-3 py-1.5 rounded-[6px] text-xs transition-colors"
              >
                Sign Up
              </NavLink>
            </div>
          )}

        </div>

      </div>
    </nav>
  );
}

export default Navbar;