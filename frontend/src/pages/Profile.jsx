import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { NavLink } from "react-router";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import axiosClient, { getErrorMessage } from "../utils/axiosClient";
import { updateUser } from "../authSlice";
import {
  Mail,
  Calendar,
  ArrowRight,
  Pencil,
  X,
  Check,
  Loader2,
  Trophy,
  Target,
} from "lucide-react";

const verdictClass = (status) => {
  if (status === "Accepted") return "verdict-accepted";
  if (status === "Pending") return "verdict-pending";
  return "verdict-failed";
};

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
};

const StatCard = ({ label, value, unit, color, progress }) => (
  <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-[8px] p-4 space-y-2">
    <span className="text-xs font-semibold text-[var(--text-secondary)] block">{label}</span>
    <div className="flex items-baseline gap-1.5">
      <span className={`text-2xl font-bold font-mono ${color}`}>{value}</span>
      {unit && <span className="text-xs text-[var(--text-muted)]">{unit}</span>}
    </div>
    {typeof progress === "number" && (
      <div className="w-full bg-[var(--bg-primary)] h-1.5 rounded-[3px] overflow-hidden border border-[var(--border-subtle)]" aria-hidden="true">
        <div className={`h-full ${color.replace("text-", "bg-")}`} style={{ width: `${Math.min(100, progress)}%` }}></div>
      </div>
    )}
  </div>
);

function Profile() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const [submissions, setSubmissions] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(true);
  const [stats, setStats] = useState(null);
  const [rank, setRank] = useState(null);

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ firstName: "", lastName: "" });

  useEffect(() => {
    if (!user) return;
    setForm({ firstName: user.firstName || "", lastName: user.lastName || "" });

    let cancelled = false;
    async function loadProfileData() {
      setLoadingSubmissions(true);
      const [profileRes, historyRes, rankRes] = await Promise.allSettled([
        axiosClient.get("/user/profile"),
        axiosClient.get("/submission/user/history?limit=10"),
        axiosClient.get("/leaderboard/me"),
      ]);
      if (cancelled) return;

      if (profileRes.status === "fulfilled" && profileRes.value.data?.stats) {
        setStats(profileRes.value.data.stats);
      }
      if (historyRes.status === "fulfilled" && Array.isArray(historyRes.value.data?.submissions)) {
        setSubmissions(historyRes.value.data.submissions);
      } else if (historyRes.status === "rejected") {
        toast.error(getErrorMessage(historyRes.reason, "Could not load submissions"), { id: "profile-history" });
      }
      if (rankRes.status === "fulfilled") {
        setRank(rankRes.value.data);
      }
      setLoadingSubmissions(false);
    }

    loadProfileData();
    return () => {
      cancelled = true;
    };
  }, [user?._id]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (form.firstName.trim().length < 2) {
      toast.error("First name must be at least 2 characters");
      return;
    }
    setSaving(true);
    try {
      const res = await axiosClient.put("/profile/update", {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
      });
      dispatch(updateUser({ firstName: res.data.user.firstName, lastName: res.data.user.lastName }));
      toast.success("Profile updated");
      setEditing(false);
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not update profile"));
    } finally {
      setSaving(false);
    }
  };

  const userInitial = user?.firstName ? user.firstName[0].toUpperCase() : "U";
  const fullName = `${user?.firstName || "User"} ${user?.lastName || ""}`.trim();

  const solved = stats?.totalSolved ?? (user?.problemSolved?.length || 0);
  const counts = stats?.difficultyCounts || { easy: 0, medium: 0, hard: 0 };
  const acceptance = stats?.accuracyRate ?? 0;

  return (
    <div className="min-h-dvh bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans flex flex-col justify-between transition-colors duration-150">
      <div>
        <Navbar />

        <main className="max-w-6xl mx-auto px-4 lg:px-6 py-6 w-full space-y-5">

          {/* profile header */}
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-[8px] p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">

              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 text-white font-bold text-xl flex items-center justify-center shrink-0">
                {userInitial}
              </div>

              <div className="flex-1 text-center sm:text-left space-y-1.5 min-w-0 w-full">
                {editing ? (
                  <form onSubmit={handleSave} className="space-y-2 max-w-md mx-auto sm:mx-0">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label htmlFor="profile-first" className="sr-only">First name</label>
                        <input
                          id="profile-first"
                          className="input-base"
                          value={form.firstName}
                          onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                          placeholder="First name"
                          maxLength={50}
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="profile-last" className="sr-only">Last name</label>
                        <input
                          id="profile-last"
                          className="input-base"
                          value={form.lastName}
                          onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                          placeholder="Last name (optional)"
                          maxLength={50}
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-center sm:justify-start gap-2">
                      <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-[6px] bg-sky-500 text-white hover:bg-sky-400 disabled:opacity-60"
                      >
                        {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" /> : <Check className="w-3.5 h-3.5" aria-hidden="true" />}
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditing(false);
                          setForm({ firstName: user.firstName || "", lastName: user.lastName || "" });
                        }}
                        className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-[6px] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                      >
                        <X className="w-3.5 h-3.5" aria-hidden="true" /> Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)] font-heading truncate">
                      {fullName}
                    </h1>
                    <span className="text-[10px] uppercase font-semibold border border-[var(--border-subtle)] text-[var(--text-muted)] px-2 py-0.5 rounded-[4px] self-center sm:self-auto">
                      {user?.role === "admin" ? "Admin" : user?.role === "pro" ? "Pro" : "Coder"}
                    </span>
                    <button
                      type="button"
                      onClick={() => setEditing(true)}
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] self-center sm:self-auto"
                    >
                      <Pencil className="w-3 h-3" aria-hidden="true" /> Edit
                    </button>
                  </div>
                )}

                <p className="text-xs text-[var(--text-secondary)] flex items-center justify-center sm:justify-start gap-1.5 truncate">
                  <Mail className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" aria-hidden="true" />
                  <span className="truncate">{user?.emailId}</span>
                </p>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-1 text-xs text-[var(--text-muted)]">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" aria-hidden="true" /> Joined {formatDate(user?.createdAt)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Trophy className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
                    {rank?.rank ? `Rank #${rank.rank}` : "Unranked"} · {rank?.points ?? 0} pts
                  </span>
                </div>
              </div>

              <NavLink
                to="/problems"
                className="bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white px-4 py-2 rounded-[6px] text-xs font-semibold transition-colors flex items-center gap-1.5 shrink-0"
              >
                <span>Practice Now</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </NavLink>

            </div>
          </div>

          {/* stats */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
            <StatCard label="Total Solved" value={solved} unit="problems" color="text-sky-400" progress={(solved / 50) * 100} />
            <StatCard label="Easy" value={counts.easy} unit="solved" color="text-emerald-400" progress={(counts.easy / 20) * 100} />
            <StatCard label="Medium" value={counts.medium} unit="solved" color="text-amber-400" progress={(counts.medium / 20) * 100} />
            <StatCard label="Hard" value={counts.hard} unit="solved" color="text-rose-400" progress={(counts.hard / 10) * 100} />
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-[8px] p-4 space-y-2 col-span-2 lg:col-span-1">
              <span className="text-xs font-semibold text-[var(--text-secondary)] flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5" aria-hidden="true" /> Acceptance
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold font-mono text-indigo-400">{acceptance}%</span>
                <span className="text-xs text-[var(--text-muted)]">
                  {stats?.acceptedSubmissions ?? 0}/{stats?.totalSubmissions ?? 0} submissions
                </span>
              </div>
              <div className="w-full bg-[var(--bg-primary)] h-1.5 rounded-[3px] overflow-hidden border border-[var(--border-subtle)]" aria-hidden="true">
                <div className="bg-indigo-500 h-full" style={{ width: `${Math.min(100, acceptance)}%` }}></div>
              </div>
            </div>
          </div>

          {/* recent submissions */}
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-[8px] overflow-hidden">
            <div className="p-4 border-b border-[var(--border-subtle)] flex items-center justify-between">
              <h2 className="font-bold text-xs uppercase tracking-wider text-[var(--text-primary)] font-heading">
                Recent Submissions
              </h2>
              <NavLink to="/problems" className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium">
                Explore Problems
              </NavLink>
            </div>

            {loadingSubmissions ? (
              <div className="py-12 flex justify-center" role="status">
                <span className="loading loading-spinner loading-md text-[var(--text-secondary)]"></span>
              </div>
            ) : submissions.length === 0 ? (
              <div className="py-12 text-center text-[var(--text-muted)] text-xs px-4">
                No submissions yet. Start practicing problems to build your history!
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-primary)] text-[var(--text-secondary)] font-semibold">
                      <th scope="col" className="py-2.5 px-3 sm:px-4">Status</th>
                      <th scope="col" className="py-2.5 px-3 sm:px-4">Problem</th>
                      <th scope="col" className="py-2.5 px-3 sm:px-4">Language</th>
                      <th scope="col" className="py-2.5 px-4 hidden sm:table-cell">Cases</th>
                      <th scope="col" className="py-2.5 px-4 hidden md:table-cell">Runtime</th>
                      <th scope="col" className="py-2.5 px-3 sm:px-4 text-right">When</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-subtle)] text-[var(--text-primary)] font-mono">
                    {submissions.map((sub) => {
                      const problemId = sub.problemId?._id || sub.problemId;
                      return (
                        <tr key={sub._id} className="hover:bg-[var(--bg-primary)] transition-colors">
                          <td className={`py-3 px-3 sm:px-4 font-bold text-xs whitespace-nowrap ${verdictClass(sub.status)}`}>
                            {sub.status}
                          </td>
                          <td className="py-3 px-3 sm:px-4 font-sans font-semibold">
                            {problemId ? (
                              <NavLink to={`/problem/${problemId}`} className="hover:text-sky-400">
                                {sub.problemId?.title || "Problem"}
                              </NavLink>
                            ) : (
                              sub.problemId?.title || "Problem"
                            )}
                          </td>
                          <td className="py-3 px-3 sm:px-4 uppercase text-[var(--text-secondary)]">
                            {sub.language}
                          </td>
                          <td className="py-3 px-4 hidden sm:table-cell text-[var(--text-muted)]">
                            {sub.testCasesPassed ?? 0}/{sub.totalTestCases ?? 0}
                          </td>
                          <td className="py-3 px-4 hidden md:table-cell text-[var(--text-muted)]">
                            {sub.runtime ? `${sub.runtime} ms` : "—"}
                          </td>
                          <td className="py-3 px-3 sm:px-4 text-right text-[var(--text-muted)] font-sans text-[11px] whitespace-nowrap">
                            {formatDate(sub.createdAt)}
                          </td>
                        </tr>
                      );
                    })}
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
