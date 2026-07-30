import { NavLink } from "react-router";
import CodeItRocketLogo from "./CodeItRocketLogo";

export default function Footer() {
  return (
    <footer className="bg-slate-100 dark:bg-[#0c0c0e] border-t border-slate-200 dark:border-[#1a1a22] text-slate-600 dark:text-gray-400 py-12 px-4 lg:px-8 mt-16 text-sm font-sans transition-colors duration-250">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Main Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Left Column: Brand & Tagline */}
          <div className="md:col-span-6 space-y-4">
            <NavLink to="/" className="inline-flex items-center gap-2.5 text-slate-900 dark:text-white font-extrabold text-2xl tracking-tight group">
              <CodeItRocketLogo className="w-9 h-9 group-hover:scale-105 transition-transform drop-shadow-[0_0_10px_rgba(56,189,248,0.4)]" />
              <span className="text-2xl font-black tracking-tight">Code<span className="text-sky-500 dark:text-sky-400">It</span></span>
            </NavLink>

            <p className="text-slate-600 dark:text-gray-300 text-sm leading-relaxed max-w-sm font-normal">
              Learn to code with structured courses and practice.
            </p>
          </div>

          {/* Right Columns: Links Grid */}
          <div className="md:col-span-6 grid grid-cols-3 gap-6">
            
            {/* Column 1: Socials (LinkedIn & X) */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 dark:text-white text-xs tracking-wider uppercase">
                Socials
              </h4>
              <ul className="space-y-2.5 text-slate-600 dark:text-gray-400 text-sm">
                <li>
                  <a
                    href="https://www.linkedin.com/in/tanushree-bobade-b699102b3/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    LinkedIn
                  </a>
                </li>
                <li>
                  <a
                    href="https://x.com/tanushree705"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    X
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 2: Legal (Privacy Policy & Terms of Service) */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 dark:text-white text-xs tracking-wider uppercase">
                Legal
              </h4>
              <ul className="space-y-2.5 text-slate-600 dark:text-gray-400 text-sm">
                <li><a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>

            {/* Column 3: Register (Sign Up & Login) */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 dark:text-white text-xs tracking-wider uppercase">
                Register
              </h4>
              <ul className="space-y-2.5 text-slate-600 dark:text-gray-400 text-sm">
                <li><NavLink to="/signup" className="hover:text-slate-900 dark:hover:text-white transition-colors">Sign Up</NavLink></li>
                <li><NavLink to="/login" className="hover:text-slate-900 dark:hover:text-white transition-colors">Login</NavLink></li>
              </ul>
            </div>

          </div>

        </div>

        {/* Center-Aligned Copyright Line */}
        <div className="pt-6 border-t border-slate-200 dark:border-[#1a1a22] text-center">
          <p className="text-slate-500 dark:text-gray-500 text-xs font-normal">
            Copyright © 2026 CodeIt Technologies Pvt Ltd. All Rights Reserved.
          </p>
        </div>

      </div>
    </footer>
  );
}
