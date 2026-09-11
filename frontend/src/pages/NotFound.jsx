import { NavLink } from "react-router";
import CodeItRocketLogo from "../components/CodeItRocketLogo";
import { ArrowLeft, Home, BookOpen } from "lucide-react";

function NotFound() {
  return (
    <div className="min-h-screen bg-[#090a0f] text-slate-100 flex flex-col items-center justify-center p-6 text-center">
      <CodeItRocketLogo className="w-20 h-20 mb-6 drop-shadow-[0_0_20px_rgba(56,189,248,0.5)] animate-pulse" />
      <span className="text-sm font-bold text-sky-400 uppercase tracking-widest mb-2">404 Error</span>
      <h1 className="text-4xl sm:text-6xl font-black tracking-tight mb-3">Page Not Found</h1>
      <p className="text-slate-400 text-sm max-w-md mb-8">
        The page or problem you are attempting to reach does not exist or has moved to another galaxy.
      </p>

      <div className="flex items-center gap-3">
        <NavLink to="/" className="btn btn-primary bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl gap-2">
          <Home className="w-4 h-4" />
          <span>Home</span>
        </NavLink>
        <NavLink to="/problems" className="btn btn-neutral bg-[#181b28] hover:bg-[#22273a] text-slate-200 border border-[#2c324b] rounded-xl gap-2">
          <BookOpen className="w-4 h-4" />
          <span>Practice Problems</span>
        </NavLink>
      </div>
    </div>
  );
}

export default NotFound;
