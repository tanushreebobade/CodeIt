import { NavLink } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../authSlice";
import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";
import CodeItRocketLogo from "./CodeItRocketLogo";

function Navbar() {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);

    const [theme, setTheme] = useState(() => {
        return localStorage.getItem("theme") || "dark";
    });

    useEffect(() => {
        localStorage.setItem("theme", theme);
        document.documentElement.setAttribute("data-theme", theme);
        if (theme === "dark") {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prev) => (prev === "dark" ? "light" : "dark"));
    };

    const handleLogout = () => {
        dispatch(logoutUser());
    };

    const userInitial = user?.firstName ? user.firstName[0].toUpperCase() : "G";

    return (
        <nav className="bg-white dark:bg-[#090a0f] border-b border-gray-200 dark:border-[#1c2030] text-gray-700 dark:text-slate-200 px-4 lg:px-8 py-3.5 sticky top-0 z-50 text-sm font-sans transition-colors duration-250">
            <div className="max-w-7xl mx-auto flex items-center justify-between">

                {/* Left: Brand Logo */}
                <NavLink to="/" className="flex items-center gap-2.5 font-bold text-gray-900 dark:text-white text-xl tracking-tight group">
                    <CodeItRocketLogo className="w-9 h-9 group-hover:scale-105 transition-transform drop-shadow-[0_0_10px_rgba(56,189,248,0.4)]" />
                    <span className="font-black text-gray-900 dark:text-white text-2xl">Code<span className="text-sky-500 dark:text-sky-400">It</span></span>
                </NavLink>

                {/* Center: Main Nav Links */}
                <div className="hidden md:flex items-center gap-8 font-semibold text-gray-600 dark:text-slate-300 text-sm">
                    <NavLink to="/" className={({ isActive }) => `hover:text-gray-900 dark:hover:text-white transition-colors ${isActive ? "text-indigo-600 dark:text-white font-bold" : ""}`}>
                        Explore
                    </NavLink>

                    <NavLink to="/problems" className={({ isActive }) => `hover:text-gray-900 dark:hover:text-white transition-colors ${isActive ? "text-indigo-600 dark:text-white font-bold" : ""}`}>
                        Practice
                    </NavLink>

                    <NavLink to="/leaderboard" className={({ isActive }) => `hover:text-gray-900 dark:hover:text-white transition-colors ${isActive ? "text-indigo-600 dark:text-white font-bold" : ""}`}>
                        Leaderboard
                    </NavLink>
                </div>

                {/* Right Controls */}
                <div className="flex items-center gap-4">

                    {/* Theme Toggle Button */}
                    <button
                        onClick={toggleTheme}
                        className="p-2 px-3 rounded-xl bg-gray-100 dark:bg-[#121218] border border-gray-300 dark:border-[#232330] text-gray-700 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center gap-2 text-xs font-semibold shadow-sm"
                        title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
                    >
                        {theme === "dark" ? (
                            <>
                                <Sun className="w-4 h-4 text-amber-400" />
                                <span className="hidden sm:inline text-amber-300">Light</span>
                            </>
                        ) : (
                            <>
                                <Moon className="w-4 h-4 text-indigo-600" />
                                <span className="hidden sm:inline text-indigo-600">Dark</span>
                            </>
                        )}
                    </button>

                    {/* User Profile Avatar / Dropdown */}
                    {user ? (
                        <div className="dropdown dropdown-end">
                            <div tabIndex={0} role="button" className="flex items-center gap-2 cursor-pointer hover:opacity-90">
                                <div className="w-9 h-9 rounded-full bg-[#8b5cf6] text-white font-bold flex items-center justify-center text-sm shadow-md ring-2 ring-purple-500/30">
                                    {userInitial}
                                </div>
                            </div>

                            <ul tabIndex={0} className="dropdown-content menu p-2.5 shadow-2xl bg-white dark:bg-[#13151f] border border-gray-200 dark:border-[#1c2030] rounded-2xl w-60 mt-2 text-xs text-gray-700 dark:text-slate-300">
                                <li className="px-3 py-2 border-b border-gray-200 dark:border-[#1c2030] mb-1">
                                    <span className="font-bold text-gray-900 dark:text-white text-sm block">{user?.firstName}</span>
                                    <span className="text-gray-500 dark:text-slate-400 text-xs">{user?.emailId}</span>
                                </li>
                                <li>
                                    <button onClick={handleLogout} className="text-rose-500 dark:text-rose-400 hover:bg-rose-500/10 py-2.5 font-semibold text-xs">
                                        Sign Out
                                    </button>
                                </li>
                            </ul>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <NavLink to="/login" className="text-gray-700 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white font-semibold text-sm px-3 py-1.5">
                                Login
                            </NavLink>
                            <NavLink to="/signup" className="bg-gradient-to-r from-[#4f46e5] to-[#6366f1] text-white font-bold px-4 py-2 rounded-xl text-sm shadow-md">
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