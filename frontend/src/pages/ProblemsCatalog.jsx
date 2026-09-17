import { useState, useEffect, useMemo } from "react";
import { NavLink, useSearchParams } from "react-router";
import { useSelector, useDispatch } from "react-redux";
import { addSolvedProblemId } from "../authSlice";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import axiosClient, { getErrorMessage } from "../utils/axiosClient";
import { formatTag } from "../utils/tagFormatter";
import toast from "react-hot-toast";
import {
  Search,
  CheckCircle2,
  Circle,
  Tv,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Lock,
  RefreshCw,
  X,
} from "lucide-react";

const CATEGORY_TAGS = [
  "All",
  "array",
  "string",
  "linkedList",
  "tree",
  "graph",
  "dp",
  "stack",
  "queue",
  "hashmap",
  "binarySearch",
  "twoPointers",
  "slidingWindow",
  "greedy",
  "backtracking",
  "math",
  "heap",
  "recursion",
];

const DIFFICULTY_OPTIONS = [
  { value: "all", label: "All difficulties" },
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
];

const STATUS_OPTIONS = [
  { value: "all", label: "All problems" },
  { value: "solved", label: "Solved" },
  { value: "unsolved", label: "Unsolved" },
];

const ITEMS_PER_PAGE = 10;

const difficultyBadge = (difficulty) => {
  const d = (difficulty || "").toLowerCase();
  return d === "easy" ? "badge-easy" : d === "medium" ? "badge-medium" : "badge-hard";
};

const checkIsPremium = (prob) => {
  if (!prob) return false;
  if (prob.isPremium === true || prob.isPremium === "true") return true;
  const titleLower = (prob.title || "").toLowerCase();
  return titleLower.includes("number of islands") || titleLower.includes("lru cache");
};

function ProblemsCatalog() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  // filters live in the url so searches from the navbar and back/forward work
  const searchQuery = searchParams.get("q") || "";
  const selectedCategory = searchParams.get("tag") || "All";
  const selectedDifficulty = searchParams.get("difficulty") || "all";
  const selectedStatus = searchParams.get("status") || "all";
  const currentPage = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);

  const updateParams = (updates) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === undefined || value === "" || value === "all" || value === "All" || (key === "page" && value === 1)) {
        next.delete(key);
      } else {
        next.set(key, String(value));
      }
    });
    setSearchParams(next, { replace: true });
  };

  // solved problems set
  const solvedIds = useMemo(() => {
    if (!user || !user.problemSolved || !Array.isArray(user.problemSolved)) return new Set();
    return new Set(
      user.problemSolved.map((p) =>
        String(typeof p === "object" && p !== null ? (p._id || p) : p)
      )
    );
  }, [user]);

  useEffect(() => {
    async function fetchSolvedProblems() {
      if (user && (!user.problemSolved || user.problemSolved.length === 0)) {
        try {
          const res = await axiosClient.get("/problem/problemSolvedByUser");
          if (res.data && Array.isArray(res.data) && res.data.length > 0) {
            res.data.forEach((p) => dispatch(addSolvedProblemId(p)));
          }
        } catch (err) {
          console.error("Failed to fetch user solved problems", err);
        }
      }
    }
    fetchSolvedProblems();
  }, [user, dispatch]);

  const fetchProblems = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await axiosClient.get("/problem/getAllProblem");
      setProblems(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      const message = getErrorMessage(err, "Could not load problems");
      setLoadError(message);
      toast.error(message, { id: "problems-load" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblems();
  }, []);

  // filtered problems computation
  const filteredProblems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return problems.filter((prob) => {
      if (q) {
        const matchesSearch =
          prob.title?.toLowerCase().includes(q) ||
          prob.tags?.some((t) => t.toLowerCase().includes(q) || formatTag(t).toLowerCase().includes(q)) ||
          prob.companyTags?.some((t) => t.toLowerCase().includes(q));
        if (!matchesSearch) return false;
      }

      if (selectedCategory !== "All") {
        const hasTag = prob.tags?.some((t) => t.toLowerCase() === selectedCategory.toLowerCase());
        if (!hasTag) return false;
      }

      if (selectedDifficulty !== "all" && prob.difficulty?.toLowerCase() !== selectedDifficulty) {
        return false;
      }

      if (selectedStatus === "solved" && !solvedIds.has(String(prob._id))) return false;
      if (selectedStatus === "unsolved" && solvedIds.has(String(prob._id))) return false;

      return true;
    });
  }, [problems, searchQuery, selectedCategory, selectedDifficulty, selectedStatus, solvedIds]);

  // pagination
  const totalPages = Math.ceil(filteredProblems.length / ITEMS_PER_PAGE) || 1;
  const safePage = Math.min(currentPage, totalPages);
  const paginatedProblems = useMemo(() => {
    const start = (safePage - 1) * ITEMS_PER_PAGE;
    return filteredProblems.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProblems, safePage]);

  // metrics
  const solvedTotal = problems.filter((p) => solvedIds.has(String(p._id))).length;
  const counts = {
    easy: problems.filter((p) => p.difficulty?.toLowerCase() === "easy").length,
    medium: problems.filter((p) => p.difficulty?.toLowerCase() === "medium").length,
    hard: problems.filter((p) => p.difficulty?.toLowerCase() === "hard").length,
  };

  const hasActiveFilters = Boolean(searchQuery) || selectedCategory !== "All" || selectedDifficulty !== "all" || selectedStatus !== "all";

  const handleProblemClick = (e, prob) => {
    const isPremium = checkIsPremium(prob);
    if (isPremium && user?.role !== "pro" && user?.role !== "admin") {
      e.preventDefault();
      e.stopPropagation();
      toast.error(`"${prob.title}" is a Premium problem. Upgrade to Pro to unlock it.`, {
        id: `premium-${prob._id}`,
        icon: "🔒",
        duration: 4000,
      });
      return false;
    }
  };

  const selectClass =
    "bg-[var(--bg-primary)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-xs rounded-[6px] px-3 py-2 focus:outline-none focus:border-sky-500 cursor-pointer";

  return (
    <div className="min-h-dvh bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans flex flex-col justify-between transition-colors duration-200">
      <div>
        <Navbar />

        <main className="max-w-7xl mx-auto px-4 lg:px-8 py-6 w-full space-y-5">

          {/* header & search bar */}
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-[8px] p-4 sm:p-5 space-y-4">

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl font-bold text-[var(--text-primary)] font-heading">
                  Problems
                </h1>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                  Explore curated DSA problem sets, test your code, and track progress.
                </p>
              </div>

              {/* progress summary */}
              <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium">
                {user && (
                  <span className="px-2.5 py-1 rounded-[6px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
                    {solvedTotal}/{problems.length} solved
                  </span>
                )}
                <span className="px-2.5 py-1 rounded-[6px] badge-easy">{counts.easy} Easy</span>
                <span className="px-2.5 py-1 rounded-[6px] badge-medium">{counts.medium} Medium</span>
                <span className="px-2.5 py-1 rounded-[6px] badge-hard">{counts.hard} Hard</span>
              </div>
            </div>

            {/* search + filter controls */}
            <div className="grid grid-cols-2 md:grid-cols-[1fr_auto_auto_auto] gap-2.5">
              <div className="relative col-span-2 md:col-span-1">
                <label htmlFor="problem-search" className="sr-only">Search problems</label>
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" aria-hidden="true" />
                <input
                  id="problem-search"
                  type="search"
                  placeholder="Search by title, topic or company..."
                  value={searchQuery}
                  onChange={(e) => updateParams({ q: e.target.value, page: 1 })}
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border-subtle)] text-[var(--text-primary)] placeholder-[var(--text-muted)] text-xs rounded-[6px] pl-9 pr-3 py-2 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label htmlFor="difficulty-filter" className="sr-only">Difficulty</label>
                <select
                  id="difficulty-filter"
                  value={selectedDifficulty}
                  onChange={(e) => updateParams({ difficulty: e.target.value, page: 1 })}
                  className={`${selectClass} w-full`}
                >
                  {DIFFICULTY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="status-filter" className="sr-only">Status</label>
                <select
                  id="status-filter"
                  value={selectedStatus}
                  onChange={(e) => updateParams({ status: e.target.value, page: 1 })}
                  disabled={!user}
                  title={!user ? "Sign in to filter by solved status" : undefined}
                  className={`${selectClass} w-full disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {hasActiveFilters ? (
                <button
                  type="button"
                  onClick={() => setSearchParams({}, { replace: true })}
                  className="flex items-center justify-center gap-1.5 text-xs font-medium px-3 py-2 rounded-[6px] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-primary)]"
                >
                  <X className="w-3.5 h-3.5" aria-hidden="true" /> Clear
                </button>
              ) : (
                <button
                  type="button"
                  onClick={fetchProblems}
                  className="flex items-center justify-center gap-1.5 text-xs font-medium px-3 py-2 rounded-[6px] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-primary)]"
                  aria-label="Refresh problems"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} aria-hidden="true" /> Refresh
                </button>
              )}
            </div>

            {/* category tag chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 text-xs scrollbar-none" role="group" aria-label="Filter by topic">
              {CATEGORY_TAGS.map((tag) => {
                const active = selectedCategory.toLowerCase() === tag.toLowerCase();
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => updateParams({ tag, page: 1 })}
                    aria-pressed={active}
                    className={`px-2.5 py-1 rounded-[6px] text-xs font-medium whitespace-nowrap transition-colors border ${
                      active
                        ? "bg-[var(--text-primary)] text-[var(--bg-primary)] border-[var(--text-primary)] font-semibold"
                        : "bg-[var(--bg-primary)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    {tag === "All" ? "All Topics" : formatTag(tag)}
                  </button>
                );
              })}
            </div>

          </div>

          {/* problems table */}
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-[8px] overflow-hidden">

            {loading ? (
              <div className="py-16 flex flex-col items-center justify-center gap-2" role="status">
                <span className="loading loading-spinner loading-md text-[var(--text-secondary)]"></span>
                <p className="text-xs text-[var(--text-muted)]">Loading problems library...</p>
              </div>
            ) : loadError && problems.length === 0 ? (
              <div className="py-16 text-center px-4 space-y-3">
                <BookOpen className="w-8 h-8 text-[var(--text-muted)] mx-auto" aria-hidden="true" />
                <h3 className="text-sm font-bold text-[var(--text-primary)] font-heading">Could not load problems</h3>
                <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto">{loadError}</p>
                <button
                  type="button"
                  onClick={fetchProblems}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-[6px] bg-sky-500/10 text-sky-400 border border-sky-500/30 hover:bg-sky-500/20"
                >
                  <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" /> Try again
                </button>
              </div>
            ) : paginatedProblems.length === 0 ? (
              <div className="py-16 text-center px-4 space-y-2">
                <BookOpen className="w-8 h-8 text-[var(--text-muted)] mx-auto" aria-hidden="true" />
                <h3 className="text-sm font-bold text-[var(--text-primary)] font-heading">No Problems Found</h3>
                <p className="text-xs text-[var(--text-muted)]">Try adjusting your search keywords or filters.</p>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={() => setSearchParams({}, { replace: true })}
                    className="text-xs font-semibold text-sky-400 hover:underline"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-primary)] text-[var(--text-secondary)] font-semibold">
                      <th scope="col" className="py-2.5 px-3 sm:px-4 w-12 text-center">
                        <span className="sr-only">Status</span>
                        <span aria-hidden="true">✓</span>
                      </th>
                      <th scope="col" className="py-2.5 px-3 sm:px-4">Title</th>
                      <th scope="col" className="py-2.5 px-4 hidden md:table-cell">Tags</th>
                      <th scope="col" className="py-2.5 px-4 hidden sm:table-cell">Difficulty</th>
                      <th scope="col" className="py-2.5 px-4 hidden sm:table-cell">Acceptance</th>
                      <th scope="col" className="py-2.5 px-3 sm:px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-subtle)] text-[var(--text-primary)]">
                    {paginatedProblems.map((prob) => {
                      const isSolved = solvedIds.has(String(prob._id));
                      const accuracy =
                        prob.submissionCount && prob.submissionCount > 0
                          ? `${Math.min(100, (prob.acceptedCount / prob.submissionCount) * 100).toFixed(1)}%`
                          : "—";
                      const isPremium = checkIsPremium(prob);
                      const isLockedForUser = isPremium && user?.role !== "pro" && user?.role !== "admin";
                      const href = isLockedForUser ? "#" : `/problem/${prob._id}`;

                      return (
                        <tr key={prob._id} className="hover:bg-[var(--bg-primary)] transition-colors">
                          {/* status */}
                          <td className="py-3 px-3 sm:px-4 text-center">
                            {isSolved ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 inline" aria-label="Solved" />
                            ) : (
                              <Circle className="w-3.5 h-3.5 text-[var(--text-muted)] inline opacity-40" aria-label="Not solved" />
                            )}
                          </td>

                          {/* title */}
                          <td className="py-3 px-3 sm:px-4">
                            <NavLink
                              to={href}
                              onClick={(e) => handleProblemClick(e, prob)}
                              className="font-semibold text-[var(--text-primary)] hover:text-sky-400 transition-colors inline-flex flex-wrap items-center gap-2"
                            >
                              <span>{prob.title}</span>
                              {isPremium && (
                                <span title="Premium Problem (Locked)" className="inline-flex items-center gap-1 text-amber-400 bg-amber-400/10 border border-amber-400/30 px-1.5 py-0.5 rounded text-[10px] font-bold">
                                  <Lock className="w-3 h-3 text-amber-400" aria-hidden="true" />
                                  <span>PRO</span>
                                </span>
                              )}
                              {prob.hasVideo && (
                                <span title="Video solution available" className="inline-flex items-center">
                                  <Tv className="w-4 h-4 text-purple-400 p-0.5 bg-purple-500/10 border border-purple-500/20 rounded-[4px]" aria-label="Video solution available" />
                                </span>
                              )}
                            </NavLink>
                            {/* difficulty + tags shown inline on small screens */}
                            <div className="flex flex-wrap items-center gap-1.5 mt-1 md:hidden">
                              <span className={`sm:hidden px-1.5 py-0.5 rounded-[4px] text-[10px] font-semibold capitalize ${difficultyBadge(prob.difficulty)}`}>
                                {prob.difficulty}
                              </span>
                              {prob.tags?.slice(0, 2).map((tag, idx) => (
                                <span key={idx} className="text-[10px] text-[var(--text-muted)] font-mono">
                                  {formatTag(tag)}{idx < Math.min(prob.tags.length, 2) - 1 ? "," : ""}
                                </span>
                              ))}
                            </div>
                          </td>

                          {/* tags */}
                          <td className="py-3 px-4 hidden md:table-cell">
                            <div className="flex flex-wrap gap-1">
                              {prob.tags?.slice(0, 3).map((tag, idx) => (
                                <button
                                  type="button"
                                  key={idx}
                                  onClick={() => updateParams({ tag, page: 1 })}
                                  className="bg-sky-500/10 text-sky-400 px-2.5 py-0.5 rounded-[4px] border border-sky-500/20 text-[11px] font-mono transition-colors hover:bg-sky-500/20"
                                >
                                  {formatTag(tag)}
                                </button>
                              ))}
                            </div>
                          </td>

                          {/* difficulty badge */}
                          <td className="py-3 px-4 hidden sm:table-cell">
                            <span className={`px-2.5 py-0.5 rounded-[4px] text-[11px] font-semibold capitalize inline-block ${difficultyBadge(prob.difficulty)}`}>
                              {prob.difficulty}
                            </span>
                          </td>

                          {/* acceptance */}
                          <td className="py-3 px-4 hidden sm:table-cell text-[var(--text-muted)] font-mono text-[11px]">
                            {accuracy}
                          </td>

                          {/* action button */}
                          <td className="py-3 px-3 sm:px-4 text-right">
                            <NavLink
                              to={href}
                              onClick={(e) => handleProblemClick(e, prob)}
                              className={`px-3 py-1 rounded-[6px] text-xs font-semibold transition-colors inline-flex items-center gap-1 ${
                                isLockedForUser
                                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20"
                                  : "bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 border border-sky-500/30"
                              }`}
                            >
                              {isLockedForUser && <Lock className="w-3 h-3 text-amber-400" aria-hidden="true" />}
                              <span>{isSolved ? "Review" : "Solve"}</span>
                            </NavLink>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* table pagination footer */}
            {!loading && filteredProblems.length > 0 && (
              <div className="p-3 border-t border-[var(--border-subtle)] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[var(--text-secondary)]">
                <span>
                  Showing {(safePage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(safePage * ITEMS_PER_PAGE, filteredProblems.length)} of {filteredProblems.length}
                </span>

                {totalPages > 1 && (
                  <nav className="flex items-center gap-1" aria-label="Pagination">
                    <button
                      type="button"
                      onClick={() => updateParams({ page: Math.max(1, safePage - 1) })}
                      disabled={safePage === 1}
                      className="p-1.5 rounded-[6px] bg-[var(--bg-primary)] border border-[var(--border-subtle)] disabled:opacity-40 hover:text-[var(--text-primary)]"
                      aria-label="Previous page"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                    <span className="px-2 font-medium">
                      Page {safePage} of {totalPages}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateParams({ page: Math.min(totalPages, safePage + 1) })}
                      disabled={safePage === totalPages}
                      className="p-1.5 rounded-[6px] bg-[var(--bg-primary)] border border-[var(--border-subtle)] disabled:opacity-40 hover:text-[var(--text-primary)]"
                      aria-label="Next page"
                    >
                      <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </nav>
                )}
              </div>
            )}

          </div>

        </main>
      </div>

      <Footer />
    </div>
  );
}

export default ProblemsCatalog;
