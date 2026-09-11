import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { NavLink } from "react-router";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import axiosClient from "../utils/axiosClient";
import {
  User,
  Mail,
  Calendar,
  Shield,
  Award,
  CheckCircle2,
  XCircle,
  Flame,
  Code2,
  Clock,
  Cpu,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

function Profile() {
  const { user } = useSelector((state) => state.auth);

  const [submissions, setSubmissions] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(true);
  const [stats, setStats] = useState({
    easy: 0,
    medium: 0,
    hard: 0,
    total: 0,
  });

  useEffect(() => {
    async function loadProfileData() {
      if (!user) return;

      // compute stats from user problem solved list
      if (user.problemSolved && Array.isArray(user.problemSolved)) {
        const solved = user.problemSolved;
        const e = solved.filter((p) => p.difficulty?.toLowerCase() === "easy").length;
        const m = solved.filter((p) => p.difficulty?.toLowerCase() === "medium").length;
        const h = solved.filter((p) => p.difficulty?.toLowerCase() === "hard").length;
        setStats({
          easy: e,
          medium: m,
          hard: h,
          total: solved.length,
        });
      }

      setLoadingSubmissions(true);
      try {
        const res = await axiosClient.get("/submission/user/history?limit=10");
        if (res.data?.submissions) {
          setSubmissions(res.data.submissions);
        }
      } catch (err) {
        console.error("Submissions load error", err);
      } finally {
        setLoadingSubmissions(false);
      }
    }

    loadProfileData();
  }, [user]);

  const userInitial = user?.firstName ? user.firstName[0].toUpperCase() : "U";
  const fullName = `${user?.firstName || "User"} ${user?.lastName || ""}`.trim();

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans flex flex-col justify-between transition-colors duration-150">
      <div>
        <Navbar />

        <main className="max-w-6xl mx-auto px-4 lg:px-6 py-6 w-full space-y-6">
          
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-[8px] p-6 space-y-4">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
              
              <div className="w-16 h-16 rounded-full bg-[var(--bg-primary)] border border-[var(--border-subtle)] text-[var(--text-primary)] font-bold text-xl flex items-center justify-center shrink-0">
                {userInitial}
              </div>

              <div className="flex-1 text-center sm:text-left space-y-1.5">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)] font-heading">
                    {fullName}
                  </h1>
                  <span className="text-[10px] uppercase font-medium border border-[var(--border-subtle)] text-[var(--text-muted)] px-2 py-0.5 rounded-[4px] self-center sm:self-auto">
                    Coder
                  </span>
                </div>

                <p className="text-xs text-[var(--text-secondary)] flex items-center justify-center sm:justify-start gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                  <span>{user?.emailId}</span>
                </p>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-1 text-xs text-[var(--text-muted)]">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> Joined 2026
                  </span>
                </div>
              </div>

              <NavLink
                to="/problems"
                className="bg-[var(--bg-primary)] border border-[var(--border-subtle)] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] px-4 py-1.5 rounded-[6px] text-xs font-medium transition-colors flex items-center gap-1.5 shrink-0"
              >
                <span>Practice Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </NavLink>

            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-[8px] p-4 space-y-2">
              <span className="text-xs font-semibold text-[var(--text-secondary)] block">Total Solved</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold text-sky-400 font-mono">{stats.total}</span>
                <span className="text-xs text-[var(--text-muted)]">problems</span>
              </div>
              <div className="w-full bg-[var(--bg-primary)] h-1.5 rounded-[3px] overflow-hidden border border-[var(--border-subtle)]">
                <div className="bg-sky-500 h-full" style={{ width: `${Math.min(100, (stats.total / 50) * 100)}%` }}></div>
              </div>
            </div>

            <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-[8px] p-4 space-y-2">
              <span className="text-xs font-semibold text-[var(--text-secondary)] block">Easy Problems</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold text-emerald-400 font-mono">{stats.easy}</span>
                <span className="text-xs text-[var(--text-muted)]">Solved</span>
              </div>
              <div className="w-full bg-[var(--bg-primary)] h-1.5 rounded-[3px] overflow-hidden border border-[var(--border-subtle)]">
                <div className="bg-emerald-500 h-full" style={{ width: `${Math.min(100, (stats.easy / 20) * 100)}%` }}></div>
              </div>
            </div>

            <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-[8px] p-4 space-y-2">
              <span className="text-xs font-semibold text-[var(--text-secondary)] block">Medium Problems</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold text-amber-400 font-mono">{stats.medium}</span>
                <span className="text-xs text-[var(--text-muted)]">Solved</span>
              </div>
              <div className="w-full bg-[var(--bg-primary)] h-1.5 rounded-[3px] overflow-hidden border border-[var(--border-subtle)]">
                <div className="bg-amber-500 h-full" style={{ width: `${Math.min(100, (stats.medium / 20) * 100)}%` }}></div>
              </div>
            </div>

            <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-[8px] p-4 space-y-2">
              <span className="text-xs font-semibold text-[var(--text-secondary)] block">Hard Problems</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold text-rose-400 font-mono">{stats.hard}</span>
                <span className="text-xs text-[var(--text-muted)]">Solved</span>
              </div>
              <div className="w-full bg-[var(--bg-primary)] h-1.5 rounded-[3px] overflow-hidden border border-[var(--border-subtle)]">
                <div className="bg-rose-500 h-full" style={{ width: `${Math.min(100, (stats.hard / 10) * 100)}%` }}></div>
              </div>
            </div>

          </div>

          <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-[8px] overflow-hidden">
            <div className="p-4 border-b border-[var(--border-subtle)] flex items-center justify-between">
              <h3 className="font-bold text-xs uppercase tracking-wider text-[var(--text-primary)] font-heading">
                Recent Submissions
              </h3>
              <NavLink to="/problems" className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium">
                Explore Problems
              </NavLink>
            </div>

            {loadingSubmissions ? (
              <div className="py-12 flex justify-center">
                <span className="loading loading-spinner loading-md text-[var(--text-secondary)]"></span>
              </div>
            ) : submissions.length === 0 ? (
              <div className="py-12 text-center text-[var(--text-muted)] text-xs px-4">
                No recent submissions found. Start practicing problems to build your portfolio!
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-primary)] text-[var(--text-secondary)] font-semibold">
                      <th className="py-2.5 px-4">Status</th>
                      <th className="py-2.5 px-4">Problem</th>
                      <th className="py-2.5 px-4">Language</th>
                      <th className="py-2.5 px-4 hidden sm:table-cell">Runtime</th>
                      <th className="py-2.5 px-4 hidden sm:table-cell">Memory</th>
                      <th className="py-2.5 px-4 text-right">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-subtle)] text-[var(--text-primary)] font-mono">
                    {submissions.map((sub, idx) => (
                      <tr key={idx} className="hover:bg-[var(--bg-primary)] transition-colors">
                        <td className="py-3 px-4">
                          <span className="font-bold text-xs">
                            {sub.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-sans font-semibold">
                          {sub.problemId?.title || "Problem Solution"}
                        </td>
                        <td className="py-3 px-4 uppercase text-[var(--text-secondary)]">
                          {sub.language}
                        </td>
                        <td className="py-3 px-4 hidden sm:table-cell text-[var(--text-muted)]">
                          {sub.runtime || 0} ms
                        </td>
                        <td className="py-3 px-4 hidden sm:table-cell text-[var(--text-muted)]">
                          {sub.memory || 0} KB
                        </td>
                        <td className="py-3 px-4 text-right text-[var(--text-muted)] font-sans text-[11px]">
                          {new Date(sub.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </main>
      </div>

      <Footer />
    </div>
  );
}

export default Profile;
