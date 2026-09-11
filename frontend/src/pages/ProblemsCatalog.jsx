import { useState, useEffect, useMemo } from "react";
import { NavLink } from "react-router";
import { useSelector, useDispatch } from "react-redux";
import { addSolvedProblemId } from "../authSlice";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import axiosClient from "../utils/axiosClient";
import { formatTag } from "../utils/tagFormatter";
import toast from "react-hot-toast";
import {
  Search,
  CheckCircle2,
  Circle,
  Tv,
  Filter,
  ArrowUpDown,
  BookOpen,
  Code2,
  ChevronLeft,
  ChevronRight,
  Flame,
  Lock,
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
];

const FALLBACK_PROBLEMS = [
  {
    _id: "6a64bb23a1e6865b6a53f5d3",
    title: "Two Sum",
    difficulty: "easy",
    tags: ["array", "hashmap"],
    acceptedCount: 9,
    submissionCount: 13,
    hasVideo: false,
    isPremium: false,
  },
  {
    _id: "6aa4040a9d253b8d715231b0",
    title: "Trapping Rain Water",
    difficulty: "hard",
    tags: ["array", "twoPointers", "stack"],
    acceptedCount: 0,
    submissionCount: 0,
    hasVideo: false,
    isPremium: false,
  },
  {
    _id: "6a64bb23a1e6865b6a53f5d6",
    title: "Valid Parentheses",
    difficulty: "easy",
    tags: ["string", "stack"],
    acceptedCount: 21,
    submissionCount: 34,
    hasVideo: false,
    isPremium: false,
  },
  {
    _id: "6a6c3bad08eb3055b5937a88",
    title: "Number of Islands",
    difficulty: "medium",
    tags: ["graph", "recursion"],
    acceptedCount: 15,
    submissionCount: 29,
    hasVideo: false,
    isPremium: true,
  },
  {
    _id: "6a6c3bad08eb3055b5937a89",
    title: "LRU Cache",
    difficulty: "hard",
    tags: ["hashmap", "linkedList"],
    acceptedCount: 8,
    submissionCount: 19,
    hasVideo: false,
    isPremium: true,
  },
];

function ProblemsCatalog() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);

  // filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all"); // all, solved, unsolved
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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
            res.data.forEach((p) => {
              const pId = typeof p === "object" && p !== null ? (p._id || p) : p;
              dispatch(addSolvedProblemId(pId));
            });
          }
        } catch (err) {
          console.error("Failed to fetch user solved problems", err);
        }
      }
    }
    fetchSolvedProblems();
  }, [user, dispatch]);

  useEffect(() => {
    async function fetchProblems() {
      setLoading(true);
      try {
        const res = await axiosClient.get("/problem/getAllProblem");
        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
          setProblems(res.data);
        } else {
          setProblems(FALLBACK_PROBLEMS);
        }
      } catch (err) {
        console.error("Using fallback problem list", err);
        setProblems(FALLBACK_PROBLEMS);
      } finally {
        setLoading(false);
      }
    }

    fetchProblems();
  }, []);

  // filtered problems computation
  const filteredProblems = useMemo(() => {
    return problems.filter((prob) => {
      // search query filter
      const matchesSearch =
        prob.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prob.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      // category filter
      if (selectedCategory !== "All") {
        const hasTag = prob.tags?.some(
          (t) => t.toLowerCase() === selectedCategory.toLowerCase()
        );
        if (!hasTag) return false;
      }

      // difficulty filter
      if (selectedDifficulty !== "all") {
        if (prob.difficulty?.toLowerCase() !== selectedDifficulty.toLowerCase()) {
          return false;
        }
      }

      // status filter
      if (selectedStatus === "solved") {
        if (!solvedIds.has(String(prob._id))) return false;
      } else if (selectedStatus === "unsolved") {
        if (solvedIds.has(String(prob._id))) return false;
      }

      return true;
    });
  }, [problems, searchQuery, selectedCategory, selectedDifficulty, selectedStatus, solvedIds]);

  // pagination
  const totalPages = Math.ceil(filteredProblems.length / itemsPerPage) || 1;
  const paginatedProblems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProblems.slice(start, start + itemsPerPage);
  }, [filteredProblems, currentPage]);

  // metrics
  const easyCount = problems.filter((p) => p.difficulty?.toLowerCase() === "easy").length;
  const mediumCount = problems.filter((p) => p.difficulty?.toLowerCase() === "medium").length;
  const hardCount = problems.filter((p) => p.difficulty?.toLowerCase() === "hard").length;

  const checkIsPremium = (prob) => {
    if (!prob) return false;
    if (prob.isPremium === true || prob.isPremium === "true") return true;
    const titleLower = (prob.title || "").toLowerCase();
    return titleLower.includes("number of islands") || titleLower.includes("lru cache");
  };

  const handleProblemClick = (e, prob) => {
    const isPremium = checkIsPremium(prob);
    if (isPremium && user?.role !== "pro") {
      e.preventDefault();
      e.stopPropagation();
      toast.error(`"${prob.title}" is a Premium Problem! Upgrade to Pro to unlock access.`, {
        icon: "🚫",
        duration: 4000,
        style: {
          background: "#181825",
          color: "#f87171",
          border: "1px solid #f87171",
          fontWeight: "600",
        },
      });
      return false;
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans flex flex-col justify-between transition-colors duration-200">
      <div>
        <Navbar />

        <main className="max-w-7xl mx-auto px-4 lg:px-8 py-6 w-full space-y-6">
          
          {/* header & search bar */}
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-[8px] p-5 space-y-4">
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl font-bold text-[var(--text-primary)] font-heading">
                  Problems
                </h1>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                  Explore curated DSA problem sets, test your code, and track progress.
                </p>
              </div>

              {/* search input */}
              <div className="relative w-full md:w-72">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  type="text"
                  placeholder="Search problem title or tag..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border-subtle)] text-[var(--text-primary)] placeholder-[var(--text-muted)] text-xs rounded-[6px] pl-9 pr-3 py-1.5 focus:outline-none focus:border-[var(--text-secondary)]"
                />
              </div>
            </div>


            {/* category tag chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {CATEGORY_TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => {
                    setSelectedCategory(tag);
                    setCurrentPage(1);
                  }}
                  className={`px-2.5 py-1 rounded-[6px] text-xs font-medium whitespace-nowrap transition-colors border ${
                    selectedCategory.toLowerCase() === tag.toLowerCase()
                      ? "bg-[var(--text-primary)] text-[var(--bg-primary)] border-[var(--text-primary)] font-semibold"
                      : "bg-[var(--bg-primary)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  {tag === "All" ? "All Topics" : tag}
                </button>
              ))}
            </div>

          </div>

          {/* problems table */}
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-[8px] overflow-hidden">
            
            {loading ? (
              <div className="py-16 flex flex-col items-center justify-center gap-2">
                <span className="loading loading-spinner loading-md text-[var(--text-secondary)]"></span>
                <p className="text-xs text-[var(--text-muted)]">Loading problems library...</p>
              </div>
            ) : paginatedProblems.length === 0 ? (
              <div className="py-16 text-center px-4 space-y-2">
                <BookOpen className="w-8 h-8 text-[var(--text-muted)] mx-auto" />
                <h3 className="text-sm font-bold text-[var(--text-primary)] font-heading">No Problems Found</h3>
                <p className="text-xs text-[var(--text-muted)]">Try adjusting your search keywords or topic filters.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-primary)] text-[var(--text-secondary)] font-semibold">
                      <th className="py-2.5 px-4 w-12 text-center">Status</th>
                      <th className="py-2.5 px-4">Title</th>
                      <th className="py-2.5 px-4 hidden md:table-cell">Tags</th>
                      <th className="py-2.5 px-4">Difficulty</th>
                      <th className="py-2.5 px-4 hidden sm:table-cell">Acceptance</th>
                      <th className="py-2.5 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-subtle)] text-[var(--text-primary)]">
                    {paginatedProblems.map((prob) => {
                      const isSolved = solvedIds.has(String(prob._id));
                      const accuracy =
                        prob.submissionCount && prob.submissionCount > 0
                          ? `${((prob.acceptedCount / prob.submissionCount) * 100).toFixed(1)}%`
                          : "48.5%";
                      const isPremium = checkIsPremium(prob);
                      const isLockedForUser = isPremium && user?.role !== "pro";

                      return (
                        <tr
                          key={prob._id}
                          className="hover:bg-[var(--bg-primary)] transition-colors"
                        >
                          {/* status */}
                          <td className="py-3 px-4 text-center">
                            {isSolved ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 inline" />
                            ) : (
                              <Circle className="w-3.5 h-3.5 text-[var(--text-muted)] inline opacity-40" />
                            )}
                          </td>

                          {/* title */}
                          <td className="py-3 px-4">
                            <NavLink
                              to={isLockedForUser ? "#" : `/problem/${prob._id}`}
                              onClick={(e) => handleProblemClick(e, prob)}
                              className="font-semibold text-[var(--text-primary)] hover:text-sky-400 transition-colors flex items-center gap-2"
                            >
                              <span>{prob.title}</span>
                              {isPremium && (
                                <span title="Premium Problem (Locked)" className="inline-flex items-center gap-1 text-amber-400 bg-amber-400/10 border border-amber-400/30 px-1.5 py-0.5 rounded text-[10px] font-bold">
                                  <Lock className="w-3 h-3 text-amber-400" />
                                  <span>PRO</span>
                                </span>
                              )}
                              {prob.hasVideo && (
                                <span title="Video solution available" className="inline-flex items-center">
                                  <Tv className="w-4 h-4 text-purple-400 p-0.5 bg-purple-500/10 border border-purple-500/20 rounded-[4px]" />
                                </span>
                              )}
                            </NavLink>
                          </td>

                          {/* tags */}
                          <td className="py-3 px-4 hidden md:table-cell">
                            <div className="flex flex-wrap gap-1">
                              {prob.tags?.slice(0, 3).map((tag, idx) => (
                                <span
                                  key={idx}
                                  className="bg-sky-500/10 text-sky-400 px-2.5 py-0.5 rounded-[4px] border border-sky-500/20 text-[11px] font-mono transition-colors cursor-default"
                                >
                                  {formatTag(tag)}
                                </span>
                              ))}
                            </div>
                          </td>

                          {/* difficulty badge */}
                          <td className="py-3 px-4">
                            <span
                              className={`px-2.5 py-0.5 rounded-[4px] text-[11px] font-semibold capitalize inline-block ${
                                prob.difficulty?.toLowerCase() === "easy"
                                  ? "badge-easy"
                                  : prob.difficulty?.toLowerCase() === "medium"
                                  ? "badge-medium"
                                  : "badge-hard"
                              }`}
                            >
                              {prob.difficulty}
                            </span>
                          </td>

                          {/* acceptance */}
                          <td className="py-3 px-4 hidden sm:table-cell text-[var(--text-muted)] font-mono text-[11px]">
                            {accuracy}
                          </td>

                          {/* action button */}
                          <td className="py-3 px-4 text-right">
                            <NavLink
                              to={isLockedForUser ? "#" : `/problem/${prob._id}`}
                              onClick={(e) => handleProblemClick(e, prob)}
                              className={`px-3 py-1 rounded-[6px] text-xs font-semibold transition-colors inline-flex items-center gap-1 ${
                                isLockedForUser
                                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20"
                                  : "bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 border border-sky-500/30"
                              }`}
                            >
                              {isLockedForUser && (
                                <Lock className="w-3 h-3 text-amber-400" />
                              )}
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

export default ProblemsCatalog;
