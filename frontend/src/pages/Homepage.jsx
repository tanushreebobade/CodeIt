import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Link2, CheckSquare, MessageSquare, Code, Star, Sparkles, ArrowRight, BookOpen } from "lucide-react";
import { NavLink } from "react-router";
import axiosClient from "../utils/axiosClient";

function Homepage() {
    const { user } = useSelector((state) => state.auth);

    const [problemsList, setProblemsList] = useState([]);
    const [problemTotals, setProblemTotals] = useState({
        easy: 100,
        medium: 100,
        hard: 100,
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
                        easy: e || 774,
                        medium: m || 774,
                        hard: h || 774,
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
        }

        fetchData();
    }, []);

    const solvedList = user?.problemSolved || [];
    const totalSolved = solvedList.length;

    const easySolved = solvedList.filter((p) => p.difficulty?.toLowerCase() === "easy").length;
    const mediumSolved = solvedList.filter((p) => p.difficulty?.toLowerCase() === "medium").length;
    const hardSolved = solvedList.filter((p) => p.difficulty?.toLowerCase() === "hard").length;

    const userInitial = user?.firstName ? user.firstName[0].toUpperCase() : "G";
    const fullName = user?.firstName
        ? `${user.firstName} ${user.lastName || ""}`.trim()
        : "Guest";

    const potd = problemsList[0] || {
        _id: "1",
        title: "1. Two Sum",
        difficulty: "Easy",
        category: "Arrays & Hashing",
        description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
        accuracy: "51.2%"
    };

    const validDsaProblems = [
        { _id: "1", title: "Two Sum", difficulty: "Easy", category: "Arrays & Hashing", accuracy: "51.2%" },
        { _id: "2", title: "Valid Parentheses", difficulty: "Easy", category: "Stack", accuracy: "62.3%" },
        { _id: "3", title: "Longest Substring Without Repeating Characters", difficulty: "Medium", category: "Sliding Window", accuracy: "44.6%" },
        { _id: "4", title: "Best Time to Buy and Sell Stock", difficulty: "Easy", category: "Arrays & DP", accuracy: "53.8%" },
        { _id: "5", title: "Group Anagrams", difficulty: "Medium", category: "Arrays & Hashing", accuracy: "67.1%" },
    ];

    const displayProblems = (problemsList.length > 0 ? problemsList : validDsaProblems).slice(0, 5);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#090a0f] text-slate-900 dark:text-slate-100 font-sans flex flex-col justify-between selection:bg-purple-500 selection:text-white transition-colors duration-250">

            <div>
                <Navbar />

                <main className="max-w-7xl mx-auto px-4 lg:px-8 py-8 w-full">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                        {/* LEFT COLUMN */}
                        <div className="lg:col-span-4 space-y-6">

                            {/* Card 1: User Profile Card */}
                            <div className="bg-white dark:bg-[#121216] border border-gray-200 dark:border-[#22222a] rounded-2xl p-6 sm:p-7 shadow-lg dark:shadow-xl relative transition-colors duration-250">
                                <button
                                    onClick={() => alert("Profile link copied!")}
                                    className="absolute top-6 right-6 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                                    title="Share profile"
                                >
                                    <Link2 className="w-5 h-5" />
                                </button>

                                <div className="space-y-4">
                                    <div className="w-20 h-20 rounded-full bg-[#8b5cf6] text-white font-bold text-3xl flex items-center justify-center shadow-lg shadow-purple-900/30">
                                        {userInitial}
                                    </div>

                                    <div>
                                        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                                            {fullName}
                                        </h2>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">
                                            CodeIt User
                                        </p>
                                    </div>

                                    <p className="text-sm text-gray-600 dark:text-gray-400 font-normal leading-relaxed">
                                        {user?.bio || "No bio available"}
                                    </p>

                                    <div className="pt-1">
                                        <span className="inline-block bg-purple-50 dark:bg-[#241a38] border border-purple-200 dark:border-[#3b275c] text-purple-700 dark:text-purple-300 text-sm font-semibold px-3.5 py-1.5 rounded-xl">
                                            Your Rank : {userRank}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Card 2: Community Stats Card */}
                            <div className="bg-white dark:bg-[#121216] border border-gray-200 dark:border-[#22222a] rounded-2xl p-6 sm:p-7 shadow-lg dark:shadow-xl space-y-5 transition-colors duration-250">
                                <div>
                                    <h3 className="text-lg font-extrabold text-gray-900 dark:text-white tracking-tight">
                                        Community Stats
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-normal">
                                        Your activity and impact within the community.
                                    </p>
                                </div>

                                <div className="space-y-3.5 pt-1 text-sm text-gray-700 dark:text-gray-300 font-medium">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2.5">
                                            <CheckSquare className="w-4.5 h-4.5 text-gray-400" />
                                            <span>Solutions</span>
                                        </div>
                                        <span className="font-bold text-gray-900 dark:text-white text-base">0</span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2.5">
                                            <MessageSquare className="w-4.5 h-4.5 text-gray-400" />
                                            <span>Discussions</span>
                                        </div>
                                        <span className="font-bold text-gray-900 dark:text-white text-base">0</span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2.5">
                                            <Code className="w-4.5 h-4.5 text-gray-400" />
                                            <span>Submissions</span>
                                        </div>
                                        <span className="font-bold text-gray-900 dark:text-white text-base">{totalSolved}</span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2.5">
                                            <Star className="w-4.5 h-4.5 text-gray-400" />
                                            <span>Reputation</span>
                                        </div>
                                        <span className="font-bold text-gray-900 dark:text-white text-base">0</span>
                                    </div>
                                </div>
                            </div>

                            {/* Card 3: AI Tutor Card (Left Column) */}
                            <div className="bg-gradient-to-tr from-indigo-50 via-purple-50 to-white dark:from-[#16132d] dark:via-[#1a1738] dark:to-[#121216] border border-indigo-200 dark:border-[#332b5e] rounded-2xl p-6 sm:p-7 shadow-lg dark:shadow-xl space-y-4 relative overflow-hidden group transition-colors duration-250">
                                <div className="flex items-center justify-between">
                                    <div className="inline-flex items-center gap-2 text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-500/20 border border-indigo-200 dark:border-indigo-500/30 px-3 py-1 rounded-full">
                                        <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> AI Guidance
                                    </div>
                                    <span className="text-xs text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-100 dark:bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-500/20">
                                        Active
                                    </span>
                                </div>

                                <div>
                                    <h3 className="text-lg font-extrabold text-gray-900 dark:text-white tracking-tight">
                                        AI Tutor & Code Debugger
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1.5 leading-relaxed font-normal">
                                        Get real-time code analysis, intelligent hint suggestions, and automated error explanations powered by Google Gemini AI.
                                    </p>
                                </div>

                                <NavLink
                                    to="/problems"
                                    className="w-full bg-gradient-to-r from-[#4f46e5] to-[#6366f1] hover:from-[#4338ca] hover:to-[#4f46e5] text-white font-bold text-sm py-3 px-4 rounded-xl transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 group-hover:scale-[1.02]"
                                >
                                    <span>Ask AI Tutor</span>
                                    <ArrowRight className="w-4 h-4" />
                                </NavLink>
                            </div>

                        </div>


                        {/* RIGHT COLUMN */}
                        <div className="lg:col-span-8 space-y-6">

                            {/* Card 1: Problem Stats Card */}
                            <div className="bg-white dark:bg-[#121216] border border-gray-200 dark:border-[#22222a] rounded-2xl p-6 sm:p-8 shadow-lg dark:shadow-xl space-y-6 transition-colors duration-250">
                                <div>
                                    <h3 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                                        Problem Stats
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-normal">
                                        Breakdown of solved problems by difficulty level.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center pt-2">
                                    <div className="sm:col-span-4 flex flex-col items-center justify-center text-center p-4 border-r border-gray-200/0 dark:border-[#1f1f28]/0 sm:border-r-gray-200 sm:dark:border-r-[#1f1f28]">
                                        <span className="text-5xl sm:text-6xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-1">
                                            {totalSolved}
                                        </span>
                                        <span className="text-sm text-gray-500 dark:text-gray-400 font-semibold">
                                            Problem Solved
                                        </span>
                                    </div>

                                    <div className="sm:col-span-8 space-y-5">
                                        <div className="space-y-1.5">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="font-semibold text-gray-700 dark:text-gray-200">Easy</span>
                                                <span className="text-gray-500 dark:text-gray-400 font-bold">{easySolved}/{problemTotals.easy}</span>
                                            </div>
                                            <div className="w-full bg-gray-100 dark:bg-[#1c1c24] h-2.5 rounded-full overflow-hidden border border-gray-200 dark:border-[#262633]">
                                                <div
                                                    className="bg-emerald-500 h-full transition-all duration-500 rounded-full"
                                                    style={{ width: `${Math.min(100, (easySolved / problemTotals.easy) * 100)}%` }}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="font-semibold text-gray-700 dark:text-gray-200">Medium</span>
                                                <span className="text-gray-500 dark:text-gray-400 font-bold">{mediumSolved}/{problemTotals.medium}</span>
                                            </div>
                                            <div className="w-full bg-gray-100 dark:bg-[#1c1c24] h-2.5 rounded-full overflow-hidden border border-gray-200 dark:border-[#262633]">
                                                <div
                                                    className="bg-amber-500 h-full transition-all duration-500 rounded-full"
                                                    style={{ width: `${Math.min(100, (mediumSolved / problemTotals.medium) * 100)}%` }}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="font-semibold text-gray-700 dark:text-gray-200">Hard</span>
                                                <span className="text-gray-500 dark:text-gray-400 font-bold">{hardSolved}/{problemTotals.hard}</span>
                                            </div>
                                            <div className="w-full bg-gray-100 dark:bg-[#1c1c24] h-2.5 rounded-full overflow-hidden border border-gray-200 dark:border-[#262633]">
                                                <div
                                                    className="bg-rose-500 h-full transition-all duration-500 rounded-full"
                                                    style={{ width: `${Math.min(100, (hardSolved / problemTotals.hard) * 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Card 2: Problem of the Day (POTD) Card */}
                            <div className="bg-white dark:bg-[#121216] border border-gray-200 dark:border-[#22222a] hover:border-purple-500/40 rounded-2xl p-6 sm:p-7 shadow-lg dark:shadow-xl relative transition-all duration-300 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2.5">
                                        <span className="bg-purple-100 dark:bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-500/20 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
                                            <BookOpen className="w-4 h-4" /> Problem of the Day
                                        </span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Today</span>
                                    </div>
                                    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${potd.difficulty?.toLowerCase() === "hard"
                                        ? "bg-rose-100 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/20"
                                        : potd.difficulty?.toLowerCase() === "medium"
                                            ? "bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20"
                                            : "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20"
                                        }`}>
                                        {potd.difficulty || "Easy"}
                                    </span>
                                </div>

                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">
                                        {potd.title}
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-2 font-normal">
                                        {potd.description}
                                    </p>
                                </div>

                                <div className="flex items-center justify-between border-t border-gray-200 dark:border-[#1f1f28] pt-4 text-sm text-gray-500 dark:text-gray-400">
                                    <span>Accuracy: <strong className="text-gray-900 dark:text-white font-semibold">{potd.accuracy || "51.2%"}</strong></span>
                                    <NavLink
                                        to="/problems"
                                        className="bg-gradient-to-r from-[#4f46e5] to-[#6366f1] hover:from-[#4338ca] hover:to-[#4f46e5] text-white font-bold px-5 py-2.5 rounded-xl transition-all text-sm shadow-md shadow-indigo-600/20 flex items-center gap-2"
                                    >
                                        <span>Solve Problem</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </NavLink>
                                </div>
                            </div>

                            {/* Card 3: Top 5 Practice Problems Table */}
                            <div className="bg-white dark:bg-[#121216] border border-gray-200 dark:border-[#22222a] rounded-2xl p-6 sm:p-7 shadow-lg dark:shadow-xl space-y-4 transition-colors duration-250">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                                            Top Practice Problems
                                        </h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-normal">
                                            Curated problem sets with topic tags and difficulty levels.
                                        </p>
                                    </div>
                                    <NavLink to="/problems" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline font-bold">
                                        View All →
                                    </NavLink>
                                </div>

                                <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-[#1f1f28]">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-gray-100 dark:bg-[#17171e] text-gray-700 dark:text-gray-300 font-semibold border-b border-gray-200 dark:border-[#1f1f28]">
                                            <tr>
                                                <th className="p-3.5">#</th>
                                                <th className="p-3.5">Title</th>
                                                <th className="p-3.5">Category</th>
                                                <th className="p-3.5">Accuracy</th>
                                                <th className="p-3.5">Difficulty</th>
                                                <th className="p-3.5 text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 dark:divide-[#1f1f28] text-gray-800 dark:text-gray-200">
                                            {displayProblems.map((prob, idx) => (
                                                <tr key={prob._id || idx} className="hover:bg-gray-50 dark:hover:bg-[#181822] transition-colors">
                                                    <td className="p-3.5 text-gray-400 dark:text-gray-500 font-semibold">{idx + 1}</td>
                                                    <td className="p-3.5 font-bold text-gray-900 dark:text-white">{prob.title}</td>
                                                    <td className="p-3.5 text-gray-600 dark:text-gray-400 font-medium">
                                                        <span className="bg-gray-100 dark:bg-[#1c1c27] text-gray-700 dark:text-gray-300 px-2.5 py-1 rounded-lg border border-gray-200 dark:border-[#282838] text-xs font-semibold">
                                                            {prob.category || prob.tags?.[0] || "DSA Core"}
                                                        </span>
                                                    </td>
                                                    <td className="p-3.5 text-gray-600 dark:text-gray-300 font-medium">{prob.accuracy || "48.5%"}</td>
                                                    <td className="p-3.5">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${prob.difficulty?.toLowerCase() === "hard"
                                                            ? "bg-rose-100 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/20"
                                                            : prob.difficulty?.toLowerCase() === "medium"
                                                                ? "bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20"
                                                                : "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20"
                                                            }`}>
                                                            {prob.difficulty || "Easy"}
                                                        </span>
                                                    </td>
                                                    <td className="p-3.5 text-right">
                                                        <NavLink to="/problems" className="text-indigo-600 dark:text-indigo-400 hover:underline font-bold text-sm">
                                                            Solve
                                                        </NavLink>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                        </div>

                    </div>
                </main>
            </div>

            <Footer />

        </div>
    );
}

export default Homepage;