import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import axiosClient, { getErrorMessage } from "../utils/axiosClient";
import {
  Trophy,
  Crown,
  Search,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  RefreshCw,
} from "lucide-react";
import { NavLink } from "react-router";

const ITEMS_PER_PAGE = 10;

const tierFor = (score) => {
  if (score >= 50) return { label: "Grandmaster", className: "bg-purple-500/15 text-purple-400 border border-purple-500/30" };
  if (score >= 20) return { label: "Master", className: "bg-sky-500/15 text-sky-400 border border-sky-500/30" };
  if (score >= 5) return { label: "Expert", className: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" };
  return { label: "Coder", className: "bg-[var(--bg-primary)] text-[var(--text-secondary)] border border-[var(--border-subtle)]" };
};

const RankBadge = ({ rank }) => {
  if (rank === 1) {
    return (
      <span className="inline-flex items-center gap-1 text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-[4px] border border-amber-400/30 font-bold">
        <Crown className="w-3 h-3 text-amber-400 fill-amber-400" aria-hidden="true" /> #1
      </span>
    );
  }
  if (rank === 2) {
    return <span className="inline-flex items-center gap-1 text-sky-400 bg-sky-400/10 px-2 py-0.5 rounded-[4px] border border-sky-400/30 font-bold">#2</span>;
  }
  if (rank === 3) {
    return <span className="inline-flex items-center gap-1 text-amber-600 bg-amber-600/10 px-2 py-0.5 rounded-[4px] border border-amber-600/30 font-bold">#3</span>;
  }
  return <span>#{rank}</span>;
};

function Leaderboard() {
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [userRank, setUserRank] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const fetchLeaderboard = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await axiosClient.get("/leaderboard/global?page=1&limit=100");
      setLeaderboardData(Array.isArray(res.data?.leaderboard) ? res.data.leaderboard : []);
    } catch (err) {
      setLoadError(getErrorMessage(err, "Could not load the leaderboard"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setUserRank(null);
      return;
    }
    let cancelled = false;
    axiosClient
      .get("/leaderboard/me")
      .then((res) => {
        if (!cancelled) setUserRank(res.data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  const filteredLeaderboard = leaderboardData.filter((entry) => {
    const fullName = `${entry.firstName || ""} ${entry.lastName || ""}`.toLowerCase();
    const q = searchQuery.trim().toLowerCase();
    return !q || fullName.includes(q);
  });

  const totalPages = Math.ceil(filteredLeaderboard.length / ITEMS_PER_PAGE) || 1;
  const safePage = Math.min(currentPage, totalPages);
  const paginatedList = filteredLeaderboard.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  const topThree = leaderboardData.slice(0, 3);
  const isMe = (item) => user && String(user._id) === String(item.userId);

  return (
    <div className="min-h-dvh bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans flex flex-col justify-between transition-colors duration-150">
      <div>
        <Navbar />

        <main className="max-w-6xl mx-auto px-4 lg:px-6 py-6 w-full space-y-5">

          {/* header section */}
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-[8px] p-5 sm:p-6 text-center space-y-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-primary)] font-heading flex items-center justify-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" aria-hidden="true" />
              Global Leaderboard
            </h1>
            <p className="text-xs text-[var(--text-secondary)] max-w-xl mx-auto">
              Rankings based on solved problems: Easy 10 pts, Medium 20 pts, Hard 30 pts.
            </p>
          </div>

          {/* your rank card */}
          {isAuthenticated && user && (
            <div className="bg-[var(--bg-secondary)] border border-sky-500/30 rounded-[8px] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 text-white font-bold flex items-center justify-center text-sm shrink-0">
                  {user.firstName ? user.firstName[0].toUpperCase() : "U"}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[var(--text-primary)] truncate">
                    {user.firstName} {user.lastName || ""} <span className="text-[10px] bg-sky-500 text-white px-1.5 py-0.5 rounded-[3px] font-bold ml-1">You</span>
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">
                    {userRank?.rank ? `Ranked #${userRank.rank} of ${leaderboardData.length || "—"}` : "Solve a problem to get ranked"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 sm:gap-6 text-xs font-mono">
                <div className="text-center">
                  <span className="block text-lg font-bold text-[var(--text-primary)]">{userRank?.rank ? `#${userRank.rank}` : "—"}</span>
                  <span className="text-[var(--text-muted)] font-sans">Rank</span>
                </div>
                <div className="text-center">
                  <span className="block text-lg font-bold text-[var(--text-primary)]">{userRank?.score ?? 0}</span>
                  <span className="text-[var(--text-muted)] font-sans">Solved</span>
                </div>
                <div className="text-center">
                  <span className="block text-lg font-bold text-sky-400">{userRank?.points ?? 0}</span>
                  <span className="text-[var(--text-muted)] font-sans">Points</span>
                </div>
              </div>
            </div>
          )}

          {/* podium */}
          {!loading && topThree.length >= 3 && (
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {[topThree[1], topThree[0], topThree[2]].map((item, idx) => {
                const place = idx === 1 ? 1 : idx === 0 ? 2 : 3;
                const accent = place === 1 ? "border-amber-400/40" : place === 2 ? "border-sky-400/40" : "border-amber-600/40";
                return (
                  <div
                    key={item.userId}
                    className={`bg-[var(--bg-secondary)] border ${accent} rounded-[8px] p-3 sm:p-4 text-center ${place === 1 ? "sm:-mt-2" : "sm:mt-2"}`}
                  >
                    <div className="mx-auto w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-[var(--bg-primary)] border border-[var(--border-subtle)] flex items-center justify-center font-bold text-sm mb-2">
                      {item.firstName ? item.firstName[0].toUpperCase() : "U"}
                    </div>
                    <div className="text-xs font-mono mb-1"><RankBadge rank={place} /></div>
                    <p className="text-xs sm:text-sm font-semibold truncate">{item.firstName} {item.lastName || ""}</p>
                    <p className="text-[11px] text-sky-400 font-mono font-bold">{item.points ?? 0} pts</p>
                  </div>
                );
              })}
            </div>
          )}

          {/* leaderboard table */}
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-[8px] overflow-hidden">

            {/* search bar */}
            <div className="p-4 border-b border-[var(--border-subtle)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-bold text-sm text-[var(--text-primary)] font-heading">Rankings</h2>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">{leaderboardData.length} registered coders</p>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative w-full sm:w-64">
                  <label htmlFor="leaderboard-search" className="sr-only">Search user</label>
                  <Search className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
                  <input
                    id="leaderboard-search"
                    type="search"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Search by name..."
                    className="w-full bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-[6px] pl-9 pr-3 py-2 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-sky-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={fetchLeaderboard}
                  className="p-2 rounded-[6px] bg-[var(--bg-primary)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  aria-label="Refresh leaderboard"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} aria-hidden="true" />
                </button>
              </div>
            </div>

            {/* table content */}
            {loading ? (
              <div className="py-16 flex flex-col items-center justify-center gap-2" role="status">
                <span className="loading loading-spinner loading-md text-[var(--text-secondary)]"></span>
                <p className="text-xs text-[var(--text-muted)]">Loading rankings...</p>
              </div>
            ) : loadError ? (
              <div className="py-16 text-center text-xs px-4 space-y-2">
                <p className="text-[var(--text-secondary)]">{loadError}</p>
                <button type="button" onClick={fetchLeaderboard} className="text-sky-400 font-semibold hover:underline">Try again</button>
              </div>
            ) : leaderboardData.length === 0 ? (
              <div className="py-16 text-center text-[var(--text-muted)] text-xs px-4 space-y-2">
                <BookOpen className="w-8 h-8 text-[var(--text-muted)] mx-auto" aria-hidden="true" />
                <h3 className="font-bold text-sm text-[var(--text-primary)] font-heading">No Registered Users Yet</h3>
                <p>Start solving problems to claim rank #1 on the leaderboard!</p>
                {!isAuthenticated && (
                  <NavLink to="/signup" className="bg-[var(--text-primary)] text-[var(--bg-primary)] px-3 py-1.5 rounded-[6px] text-xs font-semibold inline-block">
                    Sign Up
                  </NavLink>
                )}
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
                      <th scope="col" className="py-2.5 px-3 sm:px-4 w-16 text-center">Rank</th>
                      <th scope="col" className="py-2.5 px-3 sm:px-4">User</th>
                      <th scope="col" className="py-2.5 px-4 hidden sm:table-cell">Tier</th>
                      <th scope="col" className="py-2.5 px-4 text-right hidden sm:table-cell">Solved</th>
                      <th scope="col" className="py-2.5 px-3 sm:px-4 text-right">Points</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-subtle)] text-[var(--text-primary)]">
                    {paginatedList.map((item, idx) => {
                      const isCurrentUser = isMe(item);
                      const initial = item.firstName ? item.firstName[0].toUpperCase() : "U";
                      const tier = tierFor(item.score || 0);

                      return (
                        <tr
                          key={item.userId || idx}
                          className={`transition-colors ${isCurrentUser ? "bg-sky-500/5 font-semibold" : "hover:bg-[var(--bg-primary)]"}`}
                        >
                          <td className="py-3 px-3 sm:px-4 text-center font-mono font-bold text-xs">
                            <RankBadge rank={item.rank} />
                          </td>

                          <td className="py-3 px-3 sm:px-4">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-7 h-7 rounded-full bg-[var(--bg-primary)] border border-[var(--border-subtle)] text-[var(--text-primary)] font-bold text-xs flex items-center justify-center shrink-0">
                                {initial}
                              </div>
                              <span className="font-semibold text-[var(--text-primary)] flex items-center gap-1.5 truncate">
                                <span className="truncate">{item.firstName} {item.lastName || ""}</span>
                                {isCurrentUser && (
                                  <span className="text-[10px] bg-sky-500 text-white px-1.5 py-0.5 rounded-[3px] font-bold shrink-0">You</span>
                                )}
                              </span>
                            </div>
                          </td>

                          <td className="py-3 px-4 hidden sm:table-cell">
                            <span className={`px-2 py-0.5 rounded-[4px] text-[10px] font-bold uppercase tracking-wider inline-block ${tier.className}`}>
                              {tier.label}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-right font-mono font-bold text-xs hidden sm:table-cell">
                            {item.score || 0}
                          </td>

                          <td className="py-3 px-3 sm:px-4 text-right font-mono font-bold text-xs text-sky-400">
                            {item.points ?? (item.score || 0) * 10} pts
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {totalPages > 1 && (
              <div className="p-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs text-[var(--text-secondary)]">
                <span>Page {safePage} of {totalPages}</span>

                <nav className="flex items-center gap-1" aria-label="Pagination">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={safePage === 1}
                    className="p-1.5 rounded-[6px] bg-[var(--bg-primary)] border border-[var(--border-subtle)] disabled:opacity-40 hover:text-[var(--text-primary)]"
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={safePage === totalPages}
                    className="p-1.5 rounded-[6px] bg-[var(--bg-primary)] border border-[var(--border-subtle)] disabled:opacity-40 hover:text-[var(--text-primary)]"
                    aria-label="Next page"
                  >
                    <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </nav>
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
