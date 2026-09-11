import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { formatTag } from "../utils/tagFormatter";
import {
  Code2,
  Terminal,
  ArrowRight,
  CheckCircle2,
  Trophy,
  Flame,
  ShieldCheck,
  Layers,
  Cpu,
  Search,
  BookOpen,
  Zap,
  Users,
  Tv
} from "lucide-react";
import { NavLink } from "react-router";
import axiosClient from "../utils/axiosClient";

function Homepage() {
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const [problemsList, setProblemsList] = useState([]);
  const [topCoders, setTopCoders] = useState([]);
  const [problemTotals, setProblemTotals] = useState({
    easy: 0,
    medium: 0,
    hard: 0,
  });
  const [userRank, setUserRank] = useState("Unranked");

  useEffect(() => {
    async function fetchData() {
      try {
        const problemRes = await axiosClient.get("/problem/getAllProblem");
        if (problemRes.data && Array.isArray(problemRes.data)) {
          const problems = problemRes.data;
          setProblemsList(problems);

          const e = problems.filter((p) => p.difficulty?.toLowerCase() === "easy").length;
          const m = problems.filter((p) => p.difficulty?.toLowerCase() === "medium").length;
          const h = problems.filter((p) => p.difficulty?.toLowerCase() === "hard").length;

          setProblemTotals({
            easy: e || 0,
            medium: m || 0,
            hard: h || 0,
          });
        }
      } catch (err) {
        console.log("Using fallback problem list", err);
      }

      try {
        const rankRes = await axiosClient.get("/leaderboard/me");
        if (rankRes.data?.rank) {
          setUserRank(`#${rankRes.data.rank}`);
        }
      } catch (err) {
        console.log("User rank default", err);
      }

      try {
        const leaderRes = await axiosClient.get("/leaderboard/global?page=1&limit=5");
        if (leaderRes.data?.leaderboard && Array.isArray(leaderRes.data.leaderboard)) {
          setTopCoders(leaderRes.data.leaderboard);
        }
      } catch (err) {
        console.log("Leaderboard default", err);
      }
    }

    fetchData();
  }, []);

  const checkIsPremium = (prob) => {
    if (!prob) return false;
    if (prob.isPremium === true || prob.isPremium === "true") return true;
    const titleLower = (prob.title || "").toLowerCase();
    return titleLower.includes("number of islands") || titleLower.includes("lru cache");
  };

  const solvedList = user?.problemSolved || [];

  const fallbackProblems = [
    { _id: "1", title: "Two Sum", difficulty: "Easy", category: "Arrays & Hashing" },
    { _id: "2", title: "Valid Parentheses", difficulty: "Easy", category: "Stack" },
    { _id: "3", title: "Longest Substring Without Repeating Characters", difficulty: "Medium", category: "Sliding Window" },
    { _id: "4", title: "Best Time to Buy and Sell Stock", difficulty: "Easy", category: "Arrays & DP" },
    { _id: "5", title: "Group Anagrams", difficulty: "Medium", category: "Arrays & Hashing" },
  ];

  const freeProblems = (problemsList.length > 0 ? problemsList : fallbackProblems).filter(
    (prob) => !checkIsPremium(prob)
  );

  const potd = freeProblems[0] || {
    _id: "1",
    title: "1. Two Sum",
    difficulty: "Easy",
    category: "Arrays & Hashing",
    description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
  };

  const displayProblems = freeProblems.slice(0, 5);

  const fallbackCoders = [
    { rank: 1, firstName: "Alex", solvedCount: 142, points: 1420 },
    { rank: 2, firstName: "Sarah", solvedCount: 128, points: 1280 },
    { rank: 3, firstName: "David", solvedCount: 115, points: 1150 },
    { rank: 4, firstName: "Elena", solvedCount: 98, points: 980 },
  ];

  const leaderboardList = topCoders.length > 0 ? topCoders : fallbackCoders;

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans flex flex-col justify-between transition-colors duration-150">
      <div>
        <Navbar />

        <main className="max-w-7xl mx-auto px-4 lg:px-6 py-8 w-full space-y-14">

          <section className="text-center space-y-5 pt-2">

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[var(--text-primary)] font-heading leading-tight max-w-4xl mx-auto">
              Master Data Structures & Algorithms with <span className="text-[var(--text-primary)] border-b-2 border-sky-400/40 pb-0.5">Real-Time AI Guidance</span>
            </h1>

            <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
              Solve DSA problems, get intelligent hints, analyze complexity, and sharpen your problem-solving skills for technical interviews.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
              <NavLink
                to="/problems"
                className="bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs px-5 py-2.5 rounded-[6px] transition-all shadow-xs flex items-center gap-2"
              >
                <span>Start Practicing</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </NavLink>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto pt-6">
              <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] p-3 rounded-[6px] text-center hover:border-sky-500/30 transition-colors">
                <span className="block text-xl font-bold font-mono text-sky-400">
                  {problemsList.length > 0 ? `${problemsList.length}+` : "2+"}
                </span>
                <span className="text-[11px] text-[var(--text-muted)] font-medium uppercase tracking-wider">
                  DSA Problems
                </span>
              </div>
              <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] p-3 rounded-[6px] text-center hover:border-emerald-500/30 transition-colors">
                <span className="block text-xl font-bold font-mono text-emerald-400">
                  JS • PY • C++ • JAVA
                </span>
                <span className="text-[11px] text-[var(--text-muted)] font-medium uppercase tracking-wider">
                  Languages
                </span>
              </div>
              <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] p-3 rounded-[6px] text-center hover:border-amber-500/30 transition-colors">
                <span className="block text-xl font-bold font-mono text-amber-400">
                  O(1) TO O(N)
                </span>
                <span className="text-[11px] text-[var(--text-muted)] font-medium uppercase tracking-wider">
                  Complexity Hints
                </span>
              </div>
              <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] p-3 rounded-[6px] text-center hover:border-sky-500/30 transition-colors">
                <span className="block text-xl font-bold font-mono text-sky-400">
                  GLOBAL
                </span>
                <span className="text-[11px] text-[var(--text-muted)] font-medium uppercase tracking-wider">
                  Leaderboard Ranks
                </span>
              </div>
            </div>

            <div className="max-w-4xl mx-auto bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-[8px] overflow-hidden shadow-xl text-left mt-6">

              <div className="bg-[var(--bg-primary)] px-4 py-2 border-b border-[var(--border-subtle)] flex items-center justify-between text-xs text-[var(--text-secondary)] font-mono">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                  <span className="ml-2 text-[var(--text-muted)]">solution.js</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[var(--text-muted)] text-[11px]">Language: JavaScript</span>
                  <span className="px-2 py-0.5 rounded-[4px] bg-sky-500/10 border border-sky-500/20 text-sky-400 font-semibold text-[11px] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse"></span>
                    AI Tutor
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-[var(--border-subtle)] font-mono text-xs">

                <div className="md:col-span-7 p-4 bg-[var(--bg-secondary)] text-[var(--text-primary)] space-y-1 leading-relaxed overflow-x-auto">
                  <div className="text-[var(--text-muted)]">// 1. Two Sum - Hash Map Approach O(N)</div>
                  <div><span className="text-neutral-400">function</span> <span className="font-bold">twoSum</span>(nums, target) &#123;</div>
                  <div className="pl-4"><span className="text-neutral-400">const</span> map = <span className="text-neutral-400">new</span> Map();</div>
                  <div className="pl-4"><span className="text-neutral-400">for</span> (<span className="text-neutral-400">let</span> i = 0; i &lt; nums.length; i++) &#123;</div>
                  <div className="pl-8"><span className="text-neutral-400">const</span> comp = target - nums[i];</div>
                  <div className="pl-8"><span className="text-neutral-400">if</span> (map.has(comp)) &#123;</div>
                  <div className="pl-12 text-neutral-300"><span className="text-neutral-400">return</span> [map.get(comp), i];</div>
                  <div className="pl-8">&#125;</div>
                  <div className="pl-8">map.set(nums[i], i);</div>
                  <div className="pl-4">&#125;</div>
                  <div>&#125;</div>
                </div>

                <div className="md:col-span-5 p-4 bg-[var(--bg-primary)] text-[var(--text-secondary)] space-y-3">
                  <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2">
                    <span className="font-semibold text-[var(--text-primary)] flex items-center gap-1.5 font-heading text-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
                      AI Complexity Audit
                    </span>
                    <span className="text-[10px] text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded-[4px]">
                      Optimal
                    </span>
                  </div>

                  <div className="space-y-2 text-[11px]">
                    <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] p-2.5 rounded-[4px] space-y-1">
                      <span className="text-[var(--text-primary)] font-bold block text-xs">Time Complexity: O(N)</span>
                      <p className="text-[var(--text-muted)] leading-tight text-[11px]">
                        Single pass through array. Map lookup operations run in average O(1) time.
                      </p>
                    </div>

                    <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] p-2.5 rounded-[4px] space-y-1">
                      <span className="text-[var(--text-primary)] font-bold block text-xs">Space Complexity: O(N)</span>
                      <p className="text-[var(--text-muted)] leading-tight text-[11px]">
                        Hash Map stores up to N elements in worst-case scenario.
                      </p>
                    </div>
                  </div>
                </div>

              </div>

            </div>

          </section>

          <section className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-xl sm:text-2xl font-extrabold text-[var(--text-primary)] font-heading">
                Engineered for Algorithmic Mastery
              </h2>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-xl mx-auto">
                No distractions. Just focused tools to help you solve problems, sharpen your DSA skills, and ace technical interviews.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

              <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] hover:border-violet-500/30 rounded-[8px] p-5 space-y-3 transition-colors">
                <div className="w-8 h-8 rounded-[6px] bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                  <Layers className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-[var(--text-primary)] font-heading">
                  Structured DSA Roadmap
                </h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  Practice Arrays, Strings, Trees, Graphs, Dynamic Programming, and more through structured progression sets.
                </p>
              </div>

              <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] hover:border-sky-500/30 rounded-[8px] p-5 space-y-3 transition-colors">
                <div className="w-8 h-8 rounded-[6px] bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                  <Terminal className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-[var(--text-primary)] font-heading">
                  AI-Powered Tutor & Hints
                </h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  Get intelligent hints, complexity analysis, and edge-case guidance without revealing the full solution.
                </p>
              </div>

              <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] hover:border-purple-500/30 rounded-[8px] p-5 space-y-3 transition-colors">
                <div className="w-8 h-8 rounded-[6px] bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                  <Tv className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-[var(--text-primary)] font-heading">
                  Video Solutions
                </h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  Watch step-by-step video solutions and editorial breakdowns to master complex algorithms with ease.
                </p>
              </div>

              <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] hover:border-emerald-500/30 rounded-[8px] p-5 space-y-3 transition-colors">
                <div className="w-8 h-8 rounded-[6px] bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Cpu className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-[var(--text-primary)] font-heading">
                  Multi-Language Code Runner
                </h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  Write, run, and test code in JavaScript, Python, C++, and Java with automated test-case evaluation.
                </p>
              </div>

            </div>
          </section>

          <section className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-[8px] p-6 sm:p-8 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-6">
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[4px] bg-sky-500/10 border border-sky-500/20 text-[11px] font-mono text-sky-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
                  <span>AI-POWERED WORKSPACE</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] font-heading">
                  Dual-Pane Coding Workspace
                </h2>
                <p className="text-xs text-[var(--text-secondary)] max-w-xl leading-relaxed">
                  Solve problems in a distraction-free environment. View problem details, HD Video Solutions & hints on the left, write code on the right, and get instant AI guidance.
                </p>
              </div>

              <NavLink
                to={displayProblems[0]?._id ? `/problem/${displayProblems[0]._id}` : "/problems"}
                className="bg-[#1E1E1E] dark:bg-[#2E2E2E] hover:bg-[#2A2A2A] text-white font-semibold text-xs px-4 py-2 rounded-[6px] transition-colors self-start md:self-auto flex items-center gap-1.5 shadow-sm"
              >
                <span>Try Demo IDE</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </NavLink>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

              <div className="lg:col-span-5 bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-[6px] p-4 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2 text-[var(--text-muted)]">
                  <span className="font-bold text-[var(--text-primary)] font-heading text-xs">1. Two Sum</span>
                  <span className="px-2 py-0.5 rounded-[4px] bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[10px] uppercase font-sans font-semibold">Easy</span>
                </div>

                <div className="flex items-center gap-1.5 font-sans text-[10px] pb-1 border-b border-[var(--border-subtle)] text-[var(--text-secondary)] overflow-x-auto">
                  <span className="px-2 py-0.5 rounded-[4px] bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[var(--text-primary)] font-semibold">Description</span>
                  <span className="px-2 py-0.5 rounded-[4px] bg-purple-500/10 border border-purple-500/20 text-purple-400 font-semibold flex items-center gap-1">
                    <Tv className="w-3 h-3 text-purple-400" /> Video Solution
                  </span>
                  <span className="px-2 py-0.5 text-[var(--text-muted)]">Submissions</span>
                </div>
                <p className="text-[var(--text-secondary)] text-[11.5px] font-sans leading-relaxed">
                  Given an array of integers <code className="font-mono text-[var(--text-primary)]">nums</code> and an integer <code className="font-mono text-[var(--text-primary)]">target</code>, return indices of the two numbers such that they add up to target.
                </p>
                <div className="bg-[var(--bg-secondary)] p-3 rounded-[6px] border border-[var(--border-subtle)] space-y-1.5 text-[11px]">
                  <div className="flex justify-between items-center text-[var(--text-muted)] text-[10px] font-sans font-semibold">
                    <span>Sample Test Case 1</span>
                  </div>
                  <div><span className="text-[var(--text-muted)]">Input:</span> nums = [2,7,11,15], target = 9</div>
                  <div><span className="text-[var(--text-muted)]">Expected Output:</span> [0,1]</div>
                </div>
              </div>

              <div className="lg:col-span-7 bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-[6px] p-4 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2 text-[var(--text-muted)]">
                  <div className="flex items-center gap-2">
                    <Code2 className="w-3.5 h-3.5 text-[var(--text-primary)]" />
                    <span className="font-bold text-[var(--text-primary)] font-sans">solution.js</span>
                  </div>
                  <div className="flex items-center gap-2 font-sans">
                    <span className="text-[10px] px-2 py-0.5 rounded-[4px] bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[var(--text-secondary)]">Run Code</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-[4px] bg-[var(--text-primary)] text-[var(--bg-primary)] font-bold">Submit</span>
                  </div>
                </div>

                <div className="text-[var(--text-primary)] space-y-1 leading-relaxed text-[11.5px]">
                  <div><span className="text-neutral-400">function</span> <span className="font-bold">twoSum</span>(nums, target) &#123;</div>
                  <div className="pl-4"><span className="text-neutral-400">const</span> map = <span className="text-neutral-400">new</span> Map();</div>
                  <div className="pl-4"><span className="text-neutral-400">for</span> (<span className="text-neutral-400">let</span> i = 0; i &lt; nums.length; i++) &#123;</div>
                  <div className="pl-8 text-emerald-400">// O(1) hash table complement lookup</div>
                  <div className="pl-8"><span className="text-neutral-400">const</span> comp = target - nums[i];</div>
                  <div className="pl-8"><span className="text-neutral-400">if</span> (map.has(comp)) <span className="text-neutral-400">return</span> [map.get(comp), i];</div>
                  <div className="pl-8">map.set(nums[i], i);</div>
                  <div className="pl-4">&#125;</div>
                  <div>&#125;</div>
                </div>

                <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] p-3 rounded-[6px] font-sans space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[var(--text-primary)] flex items-center gap-1.5 font-heading">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
                      AI Tutor
                    </span>
                    <span className="text-[10px] font-mono bg-[var(--bg-primary)] border border-[var(--border-subtle)] text-[var(--text-secondary)] px-2 py-0.5 rounded-[4px]">
                      Time: O(N) • Space: O(N)
                    </span>
                  </div>
                  <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                    <strong>Smart Hint:</strong> Get helpful guidance, complexity insights, and edge-case suggestions without revealing the complete solution.
                  </p>
                  <div className="flex items-center gap-1.5 pt-1 text-[10px]">
                    <span className="px-2 py-0.5 rounded-[4px] bg-[var(--bg-primary)] border border-[var(--border-subtle)] text-[var(--text-muted)] cursor-default">
                      Give Hint
                    </span>
                    <span className="px-2 py-0.5 rounded-[4px] bg-[var(--bg-primary)] border border-[var(--border-subtle)] text-[var(--text-muted)] cursor-default">
                      Analyze Complexity
                    </span>
                    <span className="px-2 py-0.5 rounded-[4px] bg-[var(--bg-primary)] border border-[var(--border-subtle)] text-[var(--text-muted)] cursor-default">
                      Debug Edge Cases
                    </span>
                  </div>
                </div>

              </div>

            </div>
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">

            <div className="lg:col-span-6 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] hover:border-sky-500/30 rounded-[8px] p-6 flex flex-col justify-between space-y-4 transition-colors">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5 font-heading">
                    Daily Challenge
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-[4px] text-[11px] font-semibold capitalize ${potd.difficulty?.toLowerCase() === "easy"
                    ? "badge-easy"
                    : potd.difficulty?.toLowerCase() === "medium"
                      ? "badge-medium"
                      : "badge-hard"
                    }`}>
                    {potd.difficulty || "Easy"}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-[var(--text-primary)] font-heading mb-1">
                    {potd.title}
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] line-clamp-3 leading-relaxed">
                    {potd.description}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-[var(--border-[#282d44])] flex items-center justify-between">
                <span className="text-xs text-[var(--text-muted)] font-mono">
                  Topic: {formatTag(potd.category || potd.tags?.[0]) || "DSA Core"}
                </span>
                <NavLink
                  to={`/problem/${potd._id}`}
                  className="bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-xs font-bold px-4 py-1.5 rounded-[6px] transition-all shadow-xs flex items-center gap-1.5"
                >
                  <span>Solve Challenge</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </NavLink>
              </div>
            </div>

            <div className="lg:col-span-6 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-[8px] p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
                <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-1.5 font-heading">
                  <Trophy className="w-3.5 h-3.5 text-[var(--text-secondary)]" /> Global Standings
                </h3>
                <NavLink to="/leaderboard" className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium">
                  Full Board →
                </NavLink>
              </div>

              <div className="space-y-2 text-xs">
                {leaderboardList.slice(0, 4).map((item, idx) => {
                  const name = item.firstName ? `${item.firstName} ${item.lastName || ""}`.trim() : `Coder ${idx + 1}`;
                  const solved = item.score ?? item.solvedCount ?? 0;
                  const pts = item.points ?? solved * 10;

                  return (
                    <div
                      key={item.userId || item._id || idx}
                      className="flex items-center justify-between p-2.5 rounded-[6px] bg-[var(--bg-primary)] border border-[var(--border-subtle)] hover:border-sky-500/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`font-mono font-bold w-6 text-center text-xs ${idx === 0 ? "text-amber-400 font-extrabold" : idx === 1 ? "text-sky-400" : idx === 2 ? "text-amber-600" : "text-[var(--text-muted)]"
                          }`}>
                          #{idx + 1}
                        </span>
                        <span className="font-semibold text-[var(--text-primary)]">
                          {name}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 font-mono text-xs text-[var(--text-secondary)]">
                        <span>{solved} Solved</span>
                        <span className="font-bold text-sky-400">{pts} pts</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </section>

          <section className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-[8px] p-4 text-center space-y-2">
            <span className="text-[11px] text-[var(--text-muted)] font-mono uppercase tracking-widest block">
              PRACTICE FOR TOP TECHNICAL INTERVIEWS
            </span>
            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-12 font-heading font-extrabold text-xs sm:text-sm text-[var(--text-secondary)] tracking-widest opacity-80 pt-1">
              <span>GOOGLE</span>
              <span>META</span>
              <span>AMAZON</span>
              <span>MICROSOFT</span>
              <span>NETFLIX</span>
              <span>UBER</span>
            </div>
          </section>

          <section id="featured-problems" className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-[8px] p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <div>
                <h3 className="text-sm font-bold text-[var(--text-primary)] font-heading">
                  Practice Problems
                </h3>
              </div>
              <NavLink to="/problems" className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium">
                View All →
              </NavLink>
            </div>

            <div className="overflow-x-auto rounded-[6px] border border-[var(--border-subtle)]">
              <table className="w-full text-left text-xs">
                <thead className="bg-[var(--bg-primary)] text-[var(--text-secondary)] font-semibold border-b border-[var(--border-subtle)]">
                  <tr>
                    <th className="p-3">#</th>
                    <th className="p-3">Title</th>
                    <th className="p-3">Topic Category</th>
                    <th className="p-3">Difficulty</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)] text-[var(--text-primary)]">
                  {displayProblems.map((prob, idx) => (
                    <tr key={prob._id || idx} className="hover:bg-[var(--bg-primary)] transition-colors">
                      <td className="p-3 text-[var(--text-muted)] font-mono">{idx + 1}</td>
                      <td className="p-3 font-semibold">
                        <NavLink to={`/problem/${prob._id}`} className="hover:text-sky-400 transition-colors">
                          {prob.title}
                        </NavLink>
                      </td>
                      <td className="p-3 text-[var(--text-secondary)] font-mono">
                        <span className="bg-sky-500/10 text-sky-400 px-2.5 py-0.5 rounded-[4px] border border-sky-500/20 text-[11px]">
                          {formatTag(prob.category || prob.tags?.[0]) || "Arrays"}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2.5 py-0.5 rounded-[4px] text-[11px] font-semibold capitalize inline-block ${(prob.difficulty || "Easy").toLowerCase() === "easy"
                          ? "badge-easy"
                          : (prob.difficulty || "Easy").toLowerCase() === "medium"
                            ? "badge-medium"
                            : "badge-hard"
                          }`}>
                          {prob.difficulty || "Easy"}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <NavLink
                          to={`/problem/${prob._id}`}
                          className="bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 border border-sky-500/30 px-3 py-1 rounded-[6px] text-xs font-semibold transition-colors inline-block"
                        >
                          Solve
                        </NavLink>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-[8px] p-8 text-center space-y-4">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] font-heading">
              Ready to Level Up Your DSA Skills?            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-xl mx-auto leading-relaxed">
              Practice Data Structures & Algorithms with focused problem-solving and AI-powered guidance.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <NavLink
                to={isAuthenticated ? "/problems" : "/signup"}
                className="bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs px-6 py-2.5 rounded-[6px] transition-all shadow-xs"
              >
                {isAuthenticated ? "Go to Problems" : "Start Practicing Free"}
              </NavLink>
            </div>
          </section>

        </main>
      </div>

      <Footer />

    </div>
  );
}

export default Homepage;