import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import axiosClient from "../utils/axiosClient";
import {
  Trophy,
  Crown,
  Search,
  Award,
  User,
  ChevronLeft,
  ChevronRight,
  Flame,
  BookOpen,
} from "lucide-react";
import { NavLink } from "react-router";

function Leaderboard() {
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRank, setUserRank] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    async function fetchLeaderboard() {
      setLoading(true);
      try {
        const res = await axiosClient.get("/leaderboard/global?page=1&limit=100");
        if (res.data?.leaderboard) {
          setLeaderboardData(res.data.leaderboard);
        }
      } catch (err) {
        console.error("Leaderboard fetch error:", err);
      } finally {
        setLoading(false);
      }

      if (isAuthenticated) {
        try {
          const rankRes = await axiosClient.get("/leaderboard/me");
          if (rankRes.data) {
            setUserRank(rankRes.data);
          }
        } catch (err) {
          console.log("Error fetching user rank", err);
        }
      }
    }

    fetchLeaderboard();
  }, [isAuthenticated]);

  const filteredLeaderboard = leaderboardData.filter((entry) => {
    const fullName = `${entry.firstName || ""} ${entry.lastName || ""}`.toLowerCase();
    const email = (entry.emailId || "").toLowerCase();
    const q = searchQuery.toLowerCase();
    return fullName.includes(q) || email.includes(q);
  });

  const totalPages = Math.ceil(filteredLeaderboard.length / itemsPerPage) || 1;
  const paginatedList = filteredLeaderboard.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const top1 = leaderboardData[0] || null;
  const top2 = leaderboardData[1] || null;
  const top3 = leaderboardData[2] || null;

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans flex flex-col justify-between transition-colors duration-150">
      <div>
        <Navbar />

        <main className="max-w-6xl mx-auto px-4 lg:px-6 py-6 w-full space-y-6">

          {/* header section */}
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-[8px] p-6 text-center space-y-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-primary)] font-heading">
              Global Leaderboard
            </h1>
            <p className="text-xs text-[var(--text-secondary)] max-w-xl mx-auto">
              Real-time rankings based on solved DSA problems and verified submissions.
            </p>
          </div>

          {/* leaderboard table */}
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-[8px] overflow-hidden">

            {/* search bar */}
            <div className="p-4 border-b border-[var(--border-subtle)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-sm text-[var(--text-primary)] font-heading">
                  Global Leaderboard
                </h3>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">Rankings updated based on verified submissions.</p>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search user..."
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-[6px] pl-9 pr-3 py-1.5 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none"
                />
              </div>
            </div>

            {/* table content */}
            {loading ? (
              <div className="py-16 flex flex-col items-center justify-center gap-2">
                <span className="loading loading-spinner loading-md text-[var(--text-secondary)]"></span>
                <p className="text-xs text-[var(--text-muted)]">Loading rankings...</p>
              </div>
            ) : leaderboardData.length === 0 ? (
              <div className="py-16 text-center text-[var(--text-muted)] text-xs px-4 space-y-2">
                <BookOpen className="w-8 h-8 text-[var(--text-muted)] mx-auto" />
                <h4 className="font-bold text-sm text-[var(--text-primary)] font-heading">No Registered Users Yet</h4>
                <p>Start solving problems to claim rank #1 on the leaderboard!</p>
                <NavLink to="/signup" className="bg-[var(--text-primary)] text-[var(--bg-primary)] px-3 py-1.5 rounded-[6px] text-xs font-semibold inline-block">
                  Sign Up
                </NavLink>
              </div>
            ) : filteredLeaderboard.length === 0 ? (
              <div className="py-16 text-center text-[var(--text-muted)] text-xs">
                No users found matching "{searchQuery}".
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-primary)] text-[var(--text-secondary)] font-semibold">
                      <th className="py-2.5 px-4 w-16 text-center">Rank</th>
                      <th className="py-2.5 px-4">User</th>
                      <th className="py-2.5 px-4 hidden sm:table-cell">Tier</th>
                      <th className="py-2.5 px-4 text-right">Problems Solved</th>
                      <th className="py-2.5 px-4 text-right">Points</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-subtle)] text-[var(--text-primary)]">
                    {paginatedList.map((item, idx) => {
                      const isCurrentUser =
                        user &&
                        (String(user._id) === String(item.userId) ||
                          user.emailId?.toLowerCase() === item.emailId?.toLowerCase());
                      const initial = item.firstName ? item.firstName[0].toUpperCase() : "U";

                      return (
                        <tr
                          key={item.userId || idx}
                          className={`transition-colors ${isCurrentUser
                            ? "bg-[var(--bg-primary)] font-semibold"
                            : "hover:bg-[var(--bg-primary)]"
                            }`}
                        >
                          {/* rank */}
                          <td className="py-3 px-4 text-center font-mono font-bold text-xs">
                            {item.rank === 1 ? (
                              <span className="inline-flex items-center gap-1 text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-[4px] border border-amber-400/30 font-bold">
                                <Crown className="w-3 h-3 text-amber-400 fill-amber-400" /> #1
                              </span>
                            ) : item.rank === 2 ? (
                              <span className="inline-flex items-center gap-1 text-sky-400 bg-sky-400/10 px-2 py-0.5 rounded-[4px] border border-sky-400/30 font-bold">
                                #2
                              </span>
                            ) : item.rank === 3 ? (
                              <span className="inline-flex items-center gap-1 text-amber-600 bg-amber-600/10 px-2 py-0.5 rounded-[4px] border border-amber-600/30 font-bold">
                                #3
                              </span>
                            ) : (
                              <span>#{item.rank}</span>
                            )}
                          </td>

                          {/* coder info */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-[var(--bg-primary)] border border-[var(--border-subtle)] text-[var(--text-primary)] font-bold text-xs flex items-center justify-center shrink-0">
                                {initial}
                              </div>
                              <div>
                                <span className="font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                                  {item.firstName} {item.lastName || ""}
                                  {isCurrentUser && (
                                    <span className="text-[10px] bg-sky-500 text-white px-1.5 py-0.2 rounded-[3px] font-bold shadow-xs">You</span>
                                  )}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* tier */}
                          <td className="py-3 px-4 hidden sm:table-cell">
                            <span
                              className={`px-2 py-0.5 rounded-[4px] text-[10px] font-bold uppercase tracking-wider inline-block ${item.score >= 50
                                ? "bg-purple-500/15 text-purple-400 border border-purple-500/30"
                                : item.score >= 20
                                  ? "bg-sky-500/15 text-sky-400 border border-sky-500/30"
                                  : item.score >= 5
                                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                                    : "bg-[var(--bg-primary)] text-[var(--text-secondary)] border border-[var(--border-subtle)]"
                                }`}
                            >
                              {item.score >= 50 ? "Grandmaster" : item.score >= 20 ? "Master" : item.score >= 5 ? "Expert" : "Coder"}
                            </span>
                          </td>

                          {/* score */}
                          <td className="py-3 px-4 text-right font-mono font-bold text-xs">
                            {item.score || 0}
                          </td>

                          {/* points */}
                          <td className="py-3 px-4 text-right font-mono font-bold text-xs text-sky-400">
                            {item.points ?? (item.score || 0) * 10} pts
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* PAGINATION CONTROLS */}
            {totalPages > 1 && (
              <div className="p-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs text-[var(--text-secondary)]">
                <span></span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-1 rounded-[6px] bg-[var(--bg-primary)] border border-[var(--border-subtle)] disabled:opacity-40 hover:text-[var(--text-primary)]"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-1 rounded-[6px] bg-[var(--bg-primary)] border border-[var(--border-subtle)] disabled:opacity-40 hover:text-[var(--text-primary)]"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

          </div>



        </main>
      </div>

      <Footer />
    </div>
  );
}

export default Leaderboard;
