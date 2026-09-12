import { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useNavigate, NavLink } from "react-router";
import { useSelector, useDispatch } from "react-redux";
import { addSolvedProblemId } from "../authSlice";
import Editor from "@monaco-editor/react";
import axiosClient from "../utils/axiosClient";
import { formatTag } from "../utils/tagFormatter";
import toast from "react-hot-toast";
import CodeItRocketLogo from "../components/CodeItRocketLogo";
import { useTheme } from "../context/ThemeContext";
import {
  Play,
  Send,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Code2,
  CheckCircle2,
  XCircle,
  Clock,
  Cpu,
  Tv,
  FileText,
  Lightbulb,
  History,
  MessageSquare,
  X,
  Bot,
  User,
  Copy,
  Check,
  Maximize2,
  Minimize2,
  AlertTriangle,
  HelpCircle,
  Sun,
  Moon,
  ListFilter,
  Sparkles,
  Lock,
} from "lucide-react";

const DEFAULT_STARTER_CODES = {
  cpp: `#include <iostream>
#include <vector>
using namespace std;

class Solution {
public:
    // Write your solution here
};`,
  java: `import java.util.*;

class Solution {
    // Write your solution here
}`,
  python: `class Solution:
    # Write your solution here
    pass`,
  javascript: `class Solution {
    // Write your solution here
}`,
};

const formatEmbedUrl = (url) => {
  if (!url) return null;
  const str = String(url).trim();
  if (str.includes("youtube.com/watch")) {
    const videoId = new URL(str).searchParams.get("v");
    if (videoId) return `https://www.youtube.com/embed/${videoId}`;
  }
  if (str.includes("youtu.be/")) {
    const videoId = str.split("youtu.be/")[1]?.split("?")[0];
    if (videoId) return `https://www.youtube.com/embed/${videoId}`;
  }
  if (str.includes("youtube.com/embed/")) {
    return str;
  }
  return null;
};

function ProblemWorkspace() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  // problem state
  const [problem, setProblem] = useState(null);
  const [loadingProblem, setLoadingProblem] = useState(true);
  const [allProblems, setAllProblems] = useState([]);

  // editor and theme state
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState("");
  const [editorTheme, setEditorTheme] = useState("vs-dark");
  const [fontSize, setFontSize] = useState(12);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // dark/light theme state from global theme context
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    setEditorTheme(theme === "dark" ? "vs-dark" : "vs-light");
  }, [theme]);

  // native fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch((err) => {
        console.error("Error enabling fullscreen:", err);
        setIsFullscreen(!isFullscreen);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => {
          setIsFullscreen(false);
        }).catch((err) => {
          console.error("Error exiting fullscreen:", err);
          setIsFullscreen(false);
        });
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // left panel active tab
  const [activeLeftTab, setActiveLeftTab] = useState("description"); // description, hints, editorial, video, submissions

  // submissions state
  const [submissionsList, setSubmissionsList] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);

  // bottom console state
  const [activeConsoleTab, setActiveConsoleTab] = useState("testcases"); // testcases, custom, result
  const [selectedTestCaseIdx, setSelectedTestCaseIdx] = useState(0);
  const [customInput, setCustomInput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [runResults, setRunResults] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showProModal, setShowProModal] = useState(false);

  // ai chat drawer state
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [aiMessages, setAiMessages] = useState([
    {
      role: "model",
      text: "👋 Hi! I'm your CodeIt AI DSA Tutor. How can I help you with this problem? Ask for hints, algorithmic approaches, or help debugging!",
    },
  ]);
  const [aiInput, setAiInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const chatBottomRef = useRef(null);
  const leftPanelRef = useRef(null);

  // copy state
  const [copiedIdx, setCopiedIdx] = useState(null);

  // problem content parser for examples and constraints
  const parsedProblem = useMemo(() => {
    if (!problem) return { description: "", examples: [], constraints: "" };

    let rawDesc = problem.description || "";
    let examples = problem.examples && Array.isArray(problem.examples) && problem.examples.length > 0 ? [...problem.examples] : [];
    let constraints = problem.constraints && typeof problem.constraints === "string" ? problem.constraints.trim() : "";

    // if description contains embedded "Example 1:" or "Constraints:", extract & separate them cleanly
    if (rawDesc.includes("Example") || rawDesc.includes("Constraints:")) {
      let descPart = rawDesc;
      let constraintsPart = "";
      let examplesPart = "";

      if (descPart.includes("Constraints:")) {
        const parts = descPart.split("Constraints:");
        descPart = parts[0];
        constraintsPart = parts.slice(1).join("Constraints:").trim();
      }

      if (descPart.includes("Example 1:") || descPart.includes("Example:")) {
        const exMarker = descPart.includes("Example 1:") ? "Example 1:" : "Example:";
        const parts = descPart.split(exMarker);
        descPart = parts[0];
        examplesPart = exMarker + parts.slice(1).join(exMarker);
      }

      if (!constraints && constraintsPart) {
        constraints = constraintsPart;
      }

      if (examples.length === 0 && examplesPart) {
        const rawBlocks = examplesPart.split(/Example \d+:/g).filter(Boolean);
        rawBlocks.forEach((block) => {
          let input = "";
          let output = "";
          let explanation = "";

          const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
          lines.forEach((line) => {
            if (line.toLowerCase().startsWith("input:")) {
              input = line.replace(/^input:\s*/i, "").trim();
            } else if (line.toLowerCase().startsWith("output:")) {
              output = line.replace(/^output:\s*/i, "").trim();
            } else if (line.toLowerCase().startsWith("explanation:")) {
              explanation = line.replace(/^explanation:\s*/i, "").trim();
            }
          });

          if (input || output) {
            examples.push({ input, output, explanation });
          }
        });
      }

      rawDesc = descPart.trim();
    }

    // fallback to visibleTestCases if examples array is still empty
    if (examples.length === 0 && problem.visibleTestCases && Array.isArray(problem.visibleTestCases) && problem.visibleTestCases.length > 0) {
      examples = problem.visibleTestCases.map((tc) => ({
        input: tc.input || "",
        output: tc.output || "",
        explanation: tc.explanation || "",
      }));
    }

    if (!constraints) {
      constraints = "2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9\nOnly one valid answer exists.";
    }

    return {
      description: rawDesc,
      examples,
      constraints,
    };
  }, [problem]);

  // fetch problem data
  useEffect(() => {
    setActiveLeftTab("description");
    if (leftPanelRef.current) {
      leftPanelRef.current.scrollTop = 0;
    }

    async function loadProblem() {
      setLoadingProblem(true);
      try {
        const res = await axiosClient.get(`/problem/problemById/${id}`);
        if (res.data) {
          const probData = res.data;
          const isPremiumProblem =
            probData.isPremium === true ||
            probData.isPremium === "true" ||
            probData.title?.toLowerCase().includes("number of islands") ||
            probData.title?.toLowerCase().includes("lru cache");

          if (isPremiumProblem && user?.role !== "pro") {
            toast.error(`"${probData.title}" is a Premium Problem! Upgrade to Pro to unlock access.`, {
              icon: "🚫",
              duration: 4000,
              style: {
                background: "#181825",
                color: "#f87171",
                border: "1px solid #f87171",
                fontWeight: "600",
              },
            });
            navigate("/problems", { replace: true });
            return;
          }

          setProblem(probData);

          // set starter code for current language
          const starterObj = probData.startCode?.find(
            (s) => s.language?.toLowerCase() === language.toLowerCase()
          );
          if (starterObj && starterObj.initialCode) {
            setCode(starterObj.initialCode);
          } else {
            setCode(DEFAULT_STARTER_CODES[language] || "");
          }

          if (probData.visibleTestCases && probData.visibleTestCases.length > 0) {
            setCustomInput(probData.visibleTestCases[0].input || "");
          }
        }
      } catch (err) {
        console.error("Error fetching problem:", err);
        toast.error("Failed to load problem data.");
      } finally {
        setLoadingProblem(false);
      }
    }

    async function loadAllProblems() {
      try {
        const res = await axiosClient.get("/problem/getAllProblem");
        if (res.data && Array.isArray(res.data)) {
          setAllProblems(res.data);
        }
      } catch (err) {
        console.error("Error fetching all problems:", err);
      }
    }

    loadProblem();
    loadAllProblems();
  }, [id]);

  // update starter code on language change
  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    if (problem && problem.startCode) {
      const starterObj = problem.startCode.find(
        (s) => s.language?.toLowerCase() === newLang.toLowerCase()
      );
      if (starterObj && starterObj.initialCode) {
        setCode(starterObj.initialCode);
        return;
      }
    }
    setCode(DEFAULT_STARTER_CODES[newLang] || "");
  };

  // reset to default starter code
  const handleResetCode = () => {
    if (window.confirm("Are you sure you want to reset your code to the default template?")) {
      if (problem && problem.startCode) {
        const starterObj = problem.startCode.find(
          (s) => s.language?.toLowerCase() === language.toLowerCase()
        );
        if (starterObj && starterObj.initialCode) {
          setCode(starterObj.initialCode);
          toast.success("Code reset to template.");
          return;
        }
      }
      setCode(DEFAULT_STARTER_CODES[language] || "");
      toast.success("Code reset to template.");
    }
  };

  // fetch submissions history
  const fetchSubmissions = async () => {
    if (!isAuthenticated) return;
    setLoadingSubmissions(true);
    try {
      const res = await axiosClient.get(`/problem/submittedProblem/${id}`);
      if (res.data) {
        setSubmissionsList(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch submissions:", err);
    } finally {
      setLoadingSubmissions(false);
    }
  };

  useEffect(() => {
    if (activeLeftTab === "submissions") {
      fetchSubmissions();
    }
  }, [activeLeftTab, id]);

  // run code
  const handleRunCode = async () => {
    if (!isAuthenticated) {
      sessionStorage.setItem("redirectAfterAuth", `/problem/${id}`);
      toast.error("Please login to run code.");
      navigate(`/login?redirectTo=${encodeURIComponent(`/problem/${id}`)}`);
      return;
    }

    if (!code.trim()) {
      toast.error("Please write some code before running.");
      return;
    }

    setIsRunning(true);
    setActiveConsoleTab("result");
    setRunResults(null);

    try {
      const res = await axiosClient.post(`/submission/run/${id}`, {
        code,
        language,
      });

      if (res.data) {
        setRunResults(res.data);
        const allPassed = res.data.results?.every((r) => r.passed);
        if (allPassed) {
          toast.success("All sample test cases passed!");
        } else {
          toast.error("Some test cases failed.");
        }
      }
    } catch (err) {
      console.error("Run error:", err);
      const isLimit = err.response?.status === 429 || err.response?.data?.isLimitReached;
      const errMsg = err.response?.data?.message || err.response?.data || "Code run failed";

      if (isLimit) {
        setShowProModal(true);
        toast.error("Execution limit reached! Upgrade to Pro for unlimited runs.", { id: 'pro-limit' });
      } else {
        toast.error(typeof errMsg === "string" ? errMsg : "Execution error");
      }

      setRunResults({
        success: false,
        error: typeof errMsg === "string" ? errMsg : "Execution error occurred",
        results: [],
      });
    } finally {
      setIsRunning(false);
    }
  };

  // submit code
  const handleSubmitCode = async () => {
    if (!isAuthenticated) {
      sessionStorage.setItem("redirectAfterAuth", `/problem/${id}`);
      toast.error("Please login to submit code.");
      navigate(`/login?redirectTo=${encodeURIComponent(`/problem/${id}`)}`);
      return;
    }

    if (!code.trim()) {
      toast.error("Please write some code before submitting.");
      return;
    }

    setIsSubmitting(true);
    setShowSubmitModal(true);
    setSubmitResult(null);

    try {
      const res = await axiosClient.post(`/submission/submit/${id}`, {
        code,
        language,
      });

      if (res.data) {
        setSubmitResult(res.data);
        if (res.data.submission?.status === "Accepted") {
          toast.success("🎉 Problem Solved! Solution Accepted!");
          dispatch(addSolvedProblemId(id));
        } else {
          toast.error(`Submission status: ${res.data.submission?.status || "Failed"}`);
        }
      }
    } catch (err) {
      console.error("Submit error:", err);
      const isLimit = err.response?.status === 429 || err.response?.data?.isLimitReached;
      const errMsg = err.response?.data?.message || err.response?.data || "Submission failed";

      if (isLimit) {
        setShowSubmitModal(false);
        setShowProModal(true);
        toast.error("Submission limit reached! Upgrade to Pro for unlimited submissions.", { id: 'pro-limit-submit' });
      } else {
        toast.error(typeof errMsg === "string" ? errMsg : "Submission error");
      }

      setSubmitResult({
        success: false,
        submission: {
          status: "Error",
          errorMessage: typeof errMsg === "string" ? errMsg : "Submission failed to process.",
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ai doubt solver send message
  const handleSendAiMessage = async (overridePrompt) => {
    const messageToSend = overridePrompt || aiInput.trim();
    if (!messageToSend) return;

    if (!isAuthenticated) {
      toast.error("Please login to use AI Doubt Solver.");
      return;
    }

    const updatedMessages = [
      ...aiMessages,
      { role: "user", text: messageToSend },
    ];
    setAiMessages(updatedMessages);
    setAiInput("");
    setAiLoading(true);

    try {
      // format messages history for gemini api
      const formattedHistory = updatedMessages.map((msg) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.text }],
      }));

      const res = await axiosClient.post("/ai/chat", {
        messages: formattedHistory,
        title: problem?.title,
        description: problem?.description,
        testCases: problem?.visibleTestCases,
        startCode: problem?.startCode,
        userCurrentCode: code,
      });

      if (res.data && res.data.message) {
        setAiMessages((prev) => [
          ...prev,
          { role: "model", text: res.data.message },
        ]);
      }
    } catch (err) {
      console.error("AI chat error:", err);
      const errMsg = err.response?.data?.message || "AI Tutor is temporarily busy. Please try again shortly.";
      setAiMessages((prev) => [
        ...prev,
        {
          role: "model",
          text: `⚠️ ${errMsg}`,
        },
      ]);
    } finally {
      setAiLoading(false);
      setTimeout(() => {
        chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  // navigate to next/prev problem
  const currentIndex = allProblems.findIndex((p) => p._id === id);
  const prevProblem = currentIndex > 0 ? allProblems[currentIndex - 1] : null;
  const nextProblem = currentIndex >= 0 && currentIndex < allProblems.length - 1 ? allProblems[currentIndex + 1] : null;

  const copyToClipboard = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  if (loadingProblem) {
    return (
      <div className="min-h-screen bg-[#090a0f] text-white flex flex-col items-center justify-center gap-4">
        <span className="loading loading-spinner loading-lg text-sky-500"></span>
        <p className="text-slate-400 font-medium text-sm">Loading problem environment...</p>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="min-h-screen bg-[#090a0f] text-white flex flex-col items-center justify-center p-6 text-center">
        <AlertTriangle className="w-16 h-16 text-amber-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Problem Not Found</h2>
        <p className="text-slate-400 mb-6 max-w-md">The problem you are looking for might have been removed or does not exist.</p>
        <NavLink to="/problems" className="btn btn-primary bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl">
          Browse All Problems
        </NavLink>
      </div>
    );
  }

  return (
    <div className={`h-screen flex flex-col bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans overflow-hidden ${isFullscreen ? "fixed inset-0 z-50" : ""}`}>

      {/* top workspace header */}
      <header className="h-12 bg-[var(--bg-primary)] border-b border-[var(--border-subtle)] px-4 flex items-center justify-between shrink-0 z-20 text-xs">

        {/* brand and problem navigation */}
        <div className="flex items-center gap-4">
          <NavLink to="/" className="flex items-center gap-2 text-[var(--text-primary)] font-bold text-sm tracking-tight font-heading hover:opacity-80 transition-opacity">
            <CodeItRocketLogo className="w-5 h-5 text-[var(--text-primary)]" />
            <span className="hidden sm:inline">CodeIt</span>
          </NavLink>

          <NavLink
            to="/problems"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-bold)] transition-all font-medium"
            title="Go to Problems List"
          >
            <ListFilter className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Problems</span>
          </NavLink>

          <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
            <button
              onClick={() => prevProblem && navigate(`/problem/${prevProblem._id}`)}
              disabled={!prevProblem}
              className="p-1 rounded-[4px] hover:bg-[var(--bg-secondary)] border border-[var(--border-subtle)] disabled:opacity-30 transition-colors cursor-pointer"
              title={prevProblem ? `Previous: ${prevProblem.title}` : "No previous problem"}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="font-semibold text-[var(--text-primary)] truncate max-w-[160px] sm:max-w-xs">
              {problem.title}
            </span>
            <button
              onClick={() => nextProblem && navigate(`/problem/${nextProblem._id}`)}
              disabled={!nextProblem}
              className="p-1 rounded-[4px] hover:bg-[var(--bg-secondary)] border border-[var(--border-subtle)] disabled:opacity-30 transition-colors cursor-pointer"
              title={nextProblem ? `Next: ${nextProblem.title}` : "No next problem"}
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* language and run controls */}
        <div className="flex items-center gap-2">
          {/* language selector */}
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-xs rounded-[6px] px-2.5 py-1 focus:outline-none cursor-pointer"
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python 3</option>
            <option value="cpp">C++</option>
            <option value="java">Java</option>
          </select>

          {/* run code button */}
          <button
            onClick={handleRunCode}
            disabled={isRunning || isSubmitting}
            className="bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/30 px-3 py-1 rounded-[6px] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {isRunning ? <span className="loading loading-spinner loading-xs text-emerald-400"></span> : <Play className="w-3 h-3 text-emerald-400 fill-current" />}
            <span>Run Code</span>
          </button>

          {/* submit button */}
          <button
            onClick={handleSubmitCode}
            disabled={isRunning || isSubmitting}
            className="bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white px-3.5 py-1 rounded-[6px] text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
          >
            {isSubmitting ? <span className="loading loading-spinner loading-xs"></span> : <Send className="w-3 h-3" />}
            <span>Submit</span>
          </button>
        </div>

        {/* theme, ai tutor, and profile controls */}
        <div className="flex items-center gap-2">
          {/* theme toggle button */}
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-[6px] bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {theme === "dark" ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-indigo-400" />}
          </button>

          {/* ai tutor toggle */}
          <button
            onClick={() => setIsAiOpen(!isAiOpen)}
            className={`px-3 py-1 rounded-[6px] text-xs font-semibold flex items-center gap-1.5 transition-all border cursor-pointer ${isAiOpen
              ? "bg-sky-500/20 text-sky-300 border-sky-500/40 shadow-xs"
              : "bg-sky-500/10 text-sky-400 border-sky-500/20 hover:bg-sky-500/20"
              }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
            <span>AI Tutor</span>
          </button>

          {/* fullscreen toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-[6px] bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

          {/* user profile context */}
          {user ? (
            <NavLink
              to="/profile"
              className="w-7 h-7 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[var(--text-primary)] font-semibold flex items-center justify-center text-xs hover:border-[var(--text-secondary)] transition-colors ml-1"
              title="Go to My Profile"
            >
              {user.firstName ? user.firstName[0].toUpperCase() : "U"}
            </NavLink>
          ) : (
            <div className="flex items-center gap-1.5 ml-1">
              <NavLink
                to="/login"
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium text-xs px-2 py-1"
              >
                Sign In
              </NavLink>
              <NavLink
                to="/signup"
                className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[var(--text-primary)] hover:bg-[var(--bg-primary)] font-medium px-2.5 py-1 rounded-[6px] text-xs transition-colors"
              >
                Sign Up
              </NavLink>
            </div>
          )}
        </div>

      </header>

      {/* main desktop split view */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">

        {/* left pane description and details */}
        <div className="w-full lg:w-[40%] h-1/2 lg:h-full border-r border-[var(--border-subtle)] flex flex-col bg-[var(--bg-primary)] overflow-hidden">

          {/* left tabs bar */}
          <div className="h-9 bg-[var(--bg-secondary)] border-b border-[var(--border-subtle)] px-3 flex items-center gap-1 shrink-0 overflow-x-auto text-xs">
            <button
              onClick={() => setActiveLeftTab("description")}
              className={`px-3 py-1 rounded-[4px] text-xs font-medium transition-colors ${activeLeftTab === "description"
                ? "bg-[var(--bg-primary)] text-[var(--text-primary)] font-semibold border border-[var(--border-subtle)]"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
            >
              Description
            </button>

            {problem.hints && problem.hints.length > 0 && (
              <button
                onClick={() => setActiveLeftTab("hints")}
                className={`px-3 py-1 rounded-[4px] text-xs font-medium transition-colors ${activeLeftTab === "hints"
                  ? "bg-[var(--bg-primary)] text-[var(--text-primary)] font-semibold border border-[var(--border-subtle)]"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
              >
                Hints
              </button>
            )}

            {problem.editorial && (
              <button
                onClick={() => setActiveLeftTab("editorial")}
                className={`px-3 py-1 rounded-[4px] text-xs font-medium transition-colors ${activeLeftTab === "editorial"
                  ? "bg-[var(--bg-primary)] text-[var(--text-primary)] font-semibold border border-[var(--border-subtle)]"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
              >
                Editorial
              </button>
            )}

            <button
              onClick={() => setActiveLeftTab("video")}
              className={`px-2.5 py-1 rounded-[6px] text-xs font-semibold transition-all flex items-center gap-1.5 border cursor-pointer ${activeLeftTab === "video"
                ? "bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-xs"
                : "bg-purple-500/10 text-purple-400 border-purple-500/20 hover:bg-purple-500/20"
                }`}
            >
              <Tv className="w-3.5 h-3.5 text-purple-400" />
              <span>Video Solution</span>
              {problem.secureUrl && (
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse"></span>
              )}
            </button>

            <button
              onClick={() => setActiveLeftTab("submissions")}
              className={`px-3 py-1 rounded-[4px] text-xs font-medium transition-colors ${activeLeftTab === "submissions"
                ? "bg-[var(--bg-primary)] text-[var(--text-primary)] font-semibold border border-[var(--border-subtle)]"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
            >
              Submissions
            </button>
          </div>

          {/* left panel body */}
          <div ref={leftPanelRef} className="flex-1 overflow-y-auto p-4 space-y-5 text-[var(--text-primary)] text-xs leading-relaxed">

            {/* problem description tab */}
            {activeLeftTab === "description" && (
              <>
                {/* title and difficulty */}
                <div>
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <h1 className="text-lg font-bold tracking-tight font-heading">{problem.title}</h1>
                    <span className="px-2 py-0.5 rounded-[4px] text-[11px] font-medium uppercase border border-[var(--border-subtle)] bg-[var(--bg-secondary)] text-[var(--text-secondary)]">
                      {problem.difficulty}
                    </span>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {problem.tags?.map((tag, idx) => (
                      <span key={idx} className="bg-sky-500/10 text-sky-400 border border-sky-500/20 px-2.5 py-0.5 rounded-[4px] text-[11px] font-mono">
                        {formatTag(tag)}
                      </span>
                    ))}
                    {problem.companyTags?.map((company, idx) => (
                      <span key={idx} className="bg-sky-500/10 text-sky-400 border border-sky-500/20 px-2.5 py-0.5 rounded-[4px] text-[11px] font-mono">
                        {formatTag(company)}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Problem Statement */}
                <div className="text-[var(--text-secondary)] space-y-3 whitespace-pre-line text-xs">
                  {parsedProblem.description}
                </div>

                {/* Examples */}
                {parsedProblem.examples && parsedProblem.examples.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] font-heading">Examples</h3>
                    {parsedProblem.examples.map((example, idx) => (
                      <div key={idx} className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-[6px] p-3 space-y-1.5 font-mono text-[11px]">
                        <div className="flex items-center justify-between text-[var(--text-muted)] font-semibold mb-1">
                          <span>Example {idx + 1}</span>
                          <button
                            onClick={() => copyToClipboard(`Input: ${example.input}\nOutput: ${example.output}`, `ex-${idx}`)}
                            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] flex items-center gap-1 font-sans text-[10px]"
                          >
                            {copiedIdx === `ex-${idx}` ? <Check className="w-3 h-3 text-[var(--text-primary)]" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedIdx === `ex-${idx}` ? "Copied" : "Copy"}</span>
                          </button>
                        </div>
                        <p><span className="text-[var(--text-muted)]">Input:</span> {example.input}</p>
                        <p><span className="text-[var(--text-muted)]">Output:</span> {example.output}</p>
                        {example.explanation && (
                          <p className="text-[var(--text-secondary)] pt-1 font-sans italic"><span className="text-[var(--text-muted)] not-italic">Explanation:</span> {example.explanation}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Constraints */}
                {parsedProblem.constraints && (
                  <div className="space-y-2 pt-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] font-heading">Constraints</h3>
                    <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-[6px] p-3 text-xs font-mono text-[var(--text-secondary)] whitespace-pre-line leading-relaxed">
                      {parsedProblem.constraints}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* hints tab */}
            {activeLeftTab === "hints" && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] font-heading">Hints</h3>
                {problem.hints?.map((hint, idx) => (
                  <div key={idx} className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-[6px] p-3 text-xs text-[var(--text-secondary)] space-y-1">
                    <span className="font-bold text-[var(--text-primary)] block">Hint {idx + 1}</span>
                    <p>{hint}</p>
                  </div>
                ))}
              </div>
            )}

            {/* editorial tab */}
            {activeLeftTab === "editorial" && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] font-heading">Editorial</h3>
                <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-[6px] p-3.5 text-xs text-[var(--text-secondary)] whitespace-pre-line leading-relaxed">
                  {problem.editorial || "No editorial written for this problem yet."}
                </div>
              </div>
            )}

            {/* video solution tab */}
            {activeLeftTab === "video" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] font-heading flex items-center gap-1.5">
                    <Tv className="w-4 h-4 text-purple-400" />
                    Video Solution
                  </h3>
                  {problem.secureUrl && (
                    <span className="text-[10px] bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded-[4px] font-mono font-semibold">
                      AVAILABLE
                    </span>
                  )}
                </div>

                {problem.secureUrl ? (
                  formatEmbedUrl(problem.secureUrl) ? (
                    <div className="rounded-[8px] overflow-hidden border border-[var(--border-subtle)] bg-[var(--bg-secondary)] shadow-sm">
                      <iframe
                        src={formatEmbedUrl(problem.secureUrl)}
                        title="Video Solution"
                        className="w-full aspect-video"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    <div className="rounded-[8px] overflow-hidden border border-[var(--border-subtle)] bg-[var(--bg-secondary)] shadow-sm">
                      <video
                        src={problem.secureUrl}
                        controls
                        poster={problem.thumbnailUrl}
                        className="w-full aspect-video object-cover"
                      >
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  )
                ) : (
                  <div className="bg-[var(--bg-secondary)] border border-purple-500/20 rounded-[8px] p-6 text-center space-y-2.5">
                    <div className="w-10 h-10 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mx-auto">
                      <Tv className="w-5 h-5" />
                    </div>
                    <p className="text-xs text-[var(--text-primary)] font-semibold">
                      No Video Solution Attached Yet
                    </p>
                    <p className="text-[11px] text-[var(--text-secondary)] max-w-xs mx-auto leading-relaxed">
                      Admins can attach video solution URLs from Admin Studio. Use the AI Tutor on the right for instant step-by-step guidance!
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* submission history tab */}
            {activeLeftTab === "submissions" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] font-heading">Submissions History</h3>
                  <button onClick={fetchSubmissions} className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]">Refresh</button>
                </div>

                {loadingSubmissions ? (
                  <div className="flex justify-center py-8">
                    <span className="loading loading-spinner loading-md text-[var(--text-secondary)]"></span>
                  </div>
                ) : submissionsList.length === 0 ? (
                  <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-[6px] p-6 text-center text-[var(--text-muted)] text-xs">
                    No submissions yet.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {submissionsList.map((sub, idx) => (
                      <div key={idx} className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-[6px] p-3 flex items-center justify-between text-xs font-mono">
                        <div>
                          <span className="font-bold text-[var(--text-primary)] block">
                            {sub.status}
                          </span>
                          <span className="text-[var(--text-muted)] text-[10px] font-sans">{new Date(sub.createdAt).toLocaleString()}</span>
                        </div>

                        <div className="flex items-center gap-2 text-[var(--text-secondary)] text-[11px]">
                          <span className="uppercase">{sub.language}</span>
                          <span>{sub.runtime || 0} ms</span>
                          <span>{sub.memory || 0} KB</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>

        </div>

        {/* right pane monaco editor and console */}
        <div className="w-full lg:w-[60%] h-1/2 lg:h-full flex flex-col bg-[var(--bg-primary)] overflow-hidden">

          {/* editor toolbar header */}
          <div className="h-9 bg-[var(--bg-secondary)] border-b border-[var(--border-subtle)] px-3 flex items-center justify-between shrink-0 text-xs text-[var(--text-secondary)]">
            <div className="flex items-center gap-2 font-mono">
              <Code2 className="w-3.5 h-3.5 text-[var(--text-muted)]" />
              <span>solution.{language === "javascript" ? "js" : language === "python" ? "py" : language === "cpp" ? "cpp" : "java"}</span>
            </div>

            <div className="flex items-center gap-3">
              {/* Font Size Selector */}
              <select
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="bg-transparent border-0 text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs focus:outline-none cursor-pointer"
                title="Font size"
              >
                <option value={12} className="bg-[var(--bg-secondary)]">12px</option>
                <option value={14} className="bg-[var(--bg-secondary)]">14px</option>
                <option value={16} className="bg-[var(--bg-secondary)]">16px</option>
                <option value={18} className="bg-[var(--bg-secondary)]">18px</option>
              </select>

              {/* Reset Code */}
              <button
                onClick={handleResetCode}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1 transition-colors"
                title="Reset code template"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            </div>
          </div>

          {/* Monaco Editor */}
          <div className="flex-1 overflow-hidden relative">
            <Editor
              height="100%"
              language={language === "cpp" ? "cpp" : language === "javascript" ? "javascript" : language === "python" ? "python" : "java"}
              theme={document.documentElement.classList.contains("dark") ? "vs-dark" : "vs-light"}
              value={code}
              onChange={(value) => {
                const val = value || "";
                setCode(val);
              }}
              options={{
                fontSize: fontSize,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 4,
                wordWrap: "on",
                fontFamily: "'JetBrains Mono', monospace",
                fontLigatures: true,
                lineNumbers: "on",
                renderLineHighlight: "all",
              }}
            />
          </div>

          {/* bottom execution console */}
          <div className="h-52 bg-[var(--bg-secondary)] border-t border-[var(--border-subtle)] flex flex-col shrink-0">

            {/* console tabs */}
            <div className="h-8 bg-[var(--bg-primary)] border-b border-[var(--border-subtle)] px-3 flex items-center justify-between shrink-0 text-xs">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setActiveConsoleTab("testcases")}
                  className={`px-3 py-0.5 rounded-[4px] text-xs font-medium transition-colors ${activeConsoleTab === "testcases"
                    ? "bg-[var(--bg-secondary)] text-[var(--text-primary)] font-semibold border border-[var(--border-subtle)]"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    }`}
                >
                  Test Cases
                </button>

                <button
                  onClick={() => setActiveConsoleTab("custom")}
                  className={`px-3 py-0.5 rounded-[4px] text-xs font-medium transition-colors ${activeConsoleTab === "custom"
                    ? "bg-[var(--bg-secondary)] text-[var(--text-primary)] font-semibold border border-[var(--border-subtle)]"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    }`}
                >
                  Custom Input
                </button>

                <button
                  onClick={() => setActiveConsoleTab("result")}
                  className={`px-3 py-0.5 rounded-[4px] text-xs font-medium transition-colors ${activeConsoleTab === "result"
                    ? "bg-[var(--bg-secondary)] text-[var(--text-primary)] font-semibold border border-[var(--border-subtle)]"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    }`}
                >
                  Test Result
                </button>
              </div>
            </div>

            {/* Console Content */}
            <div className="flex-1 p-3 overflow-y-auto font-mono text-xs text-[var(--text-primary)]">

              {/* visible testcases tab */}
              {activeConsoleTab === "testcases" && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    {problem.visibleTestCases?.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedTestCaseIdx(idx)}
                        className={`px-2.5 py-0.5 rounded-[4px] text-xs font-medium border transition-colors ${selectedTestCaseIdx === idx
                          ? "bg-[var(--text-primary)] text-[var(--bg-primary)] border-[var(--text-primary)]"
                          : "bg-[var(--bg-primary)] border-[var(--border-subtle)] text-[var(--text-secondary)]"
                          }`}
                      >
                        Case {idx + 1}
                      </button>
                    ))}
                  </div>

                  {problem.visibleTestCases && problem.visibleTestCases[selectedTestCaseIdx] && (
                    <div className="space-y-2 bg-[var(--bg-primary)] p-3 rounded-[6px] border border-[var(--border-subtle)]">
                      <div>
                        <span className="text-[var(--text-muted)] font-bold block mb-1">Input:</span>
                        <div className="bg-[var(--bg-secondary)] p-2 rounded-[4px] border border-[var(--border-subtle)]">
                          {problem.visibleTestCases[selectedTestCaseIdx].input}
                        </div>
                      </div>
                      <div>
                        <span className="text-[var(--text-muted)] font-bold block mb-1">Expected Output:</span>
                        <div className="bg-[var(--bg-secondary)] p-2 rounded-[4px] border border-[var(--border-subtle)]">
                          {problem.visibleTestCases[selectedTestCaseIdx].output}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* custom input tab */}
              {activeConsoleTab === "custom" && (
                <div className="space-y-1.5 h-full flex flex-col">
                  <span className="text-[var(--text-muted)] font-bold block">Input:</span>
                  <textarea
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    placeholder="Enter stdin input here..."
                    className="flex-1 w-full bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-[6px] p-2 text-xs font-mono text-[var(--text-primary)] focus:outline-none resize-none"
                  />
                </div>
              )}

              {/* run result tab */}
              {activeConsoleTab === "result" && (
                <div>
                  {isRunning ? (
                    <div className="flex items-center gap-2 py-4 justify-center text-[var(--text-muted)]">
                      <span className="loading loading-spinner loading-sm text-[var(--text-secondary)]"></span>
                      <span>Running test cases...</span>
                    </div>
                  ) : !runResults ? (
                    <div className="py-4 text-center text-[var(--text-muted)] font-sans">
                      Click <strong className="text-[var(--text-primary)]">Run Code</strong> to execute your solution.
                    </div>
                  ) : runResults.results && runResults.results.length > 0 ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between font-sans">
                        <span className="font-bold text-xs">
                          {runResults.results.every((r) => r.passed) ? "Accepted" : "Wrong Answer"}
                        </span>
                      </div>

                      <div className="space-y-2">
                        {runResults.results.map((res, idx) => (
                          <div key={idx} className="p-2.5 rounded-[6px] border border-[var(--border-subtle)] bg-[var(--bg-primary)] space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold">Case {idx + 1}</span>
                              <span className="font-semibold text-[var(--text-secondary)]">{res.passed ? "Passed" : "Failed"}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div>
                                <span className="text-[var(--text-muted)] block text-[10px]">Your Output:</span>
                                <div className="p-1 rounded bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
                                  {res.output || "<empty>"}
                                </div>
                              </div>
                              <div>
                                <span className="text-[var(--text-muted)] block text-[10px]">Expected:</span>
                                <div className="p-1 rounded bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
                                  {res.expectedOutput}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-[6px] font-mono">
                      <p className="font-bold mb-1">Execution Error:</p>
                      <pre className="whitespace-pre-wrap text-xs">{runResults.error || "Execution failed"}</pre>
                    </div>
                  )}
                </div>
              )}

            </div>

          </div>

        </div>

        {/* ai tutor drawer */}
        {isAiOpen && (
          <div className="absolute top-0 right-0 bottom-0 w-full sm:w-80 bg-[var(--bg-secondary)] border-l border-[var(--border-subtle)] z-40 flex flex-col shadow-lg">

            {/* ai header */}
            <div className="h-10 bg-[var(--bg-primary)] border-b border-[var(--border-subtle)] px-3 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse"></span>
                <h3 className="font-bold text-xs text-[var(--text-primary)] font-heading">AI Tutor</h3>

              </div>
              <button
                onClick={() => setIsAiOpen(false)}
                className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick Action Chips */}
            <div className="p-2 bg-[var(--bg-secondary)] border-b border-[var(--border-subtle)] flex flex-wrap gap-1 shrink-0">
              <button
                onClick={() => handleSendAiMessage("Give me a subtle hint without spoiling the complete answer.")}
                className="bg-[var(--bg-primary)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-sky-400 hover:border-sky-500/30 text-[10px] px-2 py-1 rounded-[4px] transition-colors"
              >
                Give Hint
              </button>
              <button
                onClick={() => handleSendAiMessage("What is the optimal time and space complexity approach for this problem?")}
                className="bg-[var(--bg-primary)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-sky-400 hover:border-sky-500/30 text-[10px] px-2 py-1 rounded-[4px] transition-colors"
              >
                Analyze Complexity
              </button>
              <button
                onClick={() => handleSendAiMessage(`Here is my current code:\n\`\`\`${language}\n${code}\n\`\`\`\nCan you review it and point out potential bugs or edge cases?`)}
                className="bg-[var(--bg-primary)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-sky-400 hover:border-sky-500/30 text-[10px] px-2 py-1 rounded-[4px] transition-colors"
              >
                Debug Code
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-3 overflow-y-auto space-y-2.5 text-xs">
              {aiMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] p-2.5 rounded-[6px] text-xs leading-relaxed border ${msg.role === "user"
                      ? "bg-[var(--text-primary)] text-[var(--bg-primary)] border-[var(--text-primary)] font-medium"
                      : "bg-[var(--bg-primary)] border-[var(--border-subtle)] text-[var(--text-primary)] whitespace-pre-wrap"
                      }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              {aiLoading && (
                <div className="text-sky-400/80 text-xs font-mono py-1 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping"></span>
                  AI Tutor is thinking...
                </div>
              )}

              <div ref={chatBottomRef} />
            </div>

            {/* Chat Input */}
            <div className="p-2 bg-[var(--bg-primary)] border-t border-[var(--border-subtle)] shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendAiMessage();
                }}
                className="flex items-center gap-1.5"
              >
                <input
                  type="text"
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  placeholder="Ask AI Tutor..."
                  className="flex-1 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-[6px] px-2.5 py-1.5 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={aiLoading || !aiInput.trim()}
                  className="bg-[var(--text-primary)] text-[var(--bg-primary)] border-0 rounded-[6px] px-2.5 py-1.5 text-xs font-medium"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>

          </div>
        )}

      </div>

      {/* submit result modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-[8px] w-full max-w-md p-5 space-y-4">

            <div className="flex items-center justify-between pb-2 border-b border-[var(--border-subtle)]">
              <h3 className="text-sm font-bold text-[var(--text-primary)] font-heading">
                Submission Result
              </h3>
              <button
                onClick={() => setShowSubmitModal(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {isSubmitting ? (
              <div className="py-8 flex flex-col items-center justify-center gap-2 text-center">
                <span className="loading loading-spinner loading-md text-[var(--text-secondary)]"></span>
                <p className="text-xs text-[var(--text-secondary)]">Evaluating test cases...</p>
              </div>
            ) : submitResult?.submission ? (
              <div className="space-y-3 font-mono text-xs">
                <div className="p-4 rounded-[6px] border border-[var(--border-subtle)] bg-[var(--bg-primary)] text-center space-y-1">
                  <h4 className="text-xl font-bold text-[var(--text-primary)]">{submitResult.submission.status}</h4>
                  <p className="text-xs text-[var(--text-secondary)] font-sans">
                    {submitResult.submission.status === "Accepted"
                      ? "All test cases passed successfully."
                      : submitResult.submission.errorMessage || "Solution failed test cases."}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-[6px] p-2.5 text-center">
                    <span className="text-[var(--text-muted)] block text-[10px]">Runtime</span>
                    <span className="text-sm font-bold text-[var(--text-primary)]">{submitResult.submission.runtime || 0} ms</span>
                  </div>

                  <div className="bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-[6px] p-2.5 text-center">
                    <span className="text-[var(--text-muted)] block text-[10px]">Memory</span>
                    <span className="text-sm font-bold text-[var(--text-primary)]">{submitResult.submission.memory || 0} KB</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 font-sans">
                  <button
                    onClick={() => {
                      setShowSubmitModal(false);
                      setActiveLeftTab("submissions");
                    }}
                    className="flex-1 bg-[var(--bg-primary)] border border-[var(--border-subtle)] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] py-1.5 rounded-[6px] text-xs font-medium"
                  >
                    View History
                  </button>
                  <button
                    onClick={() => setShowSubmitModal(false)}
                    className="flex-1 bg-[var(--text-primary)] text-[var(--bg-primary)] py-1.5 rounded-[6px] text-xs font-semibold"
                  >
                    Continue
                  </button>
                </div>

              </div>
            ) : null}

          </div>
        </div>
      )}

      {/* pro upgrade modal */}
      {showProModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--bg-secondary)] border border-sky-500/30 rounded-xl p-6 max-w-md w-full relative shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowProModal(false)}
              className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-2 pt-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center mx-auto shadow-lg shadow-sky-500/20 text-white">
                <Sparkles className="w-6 h-6 animate-pulse" />
              </div>
              <h3 className="text-xl font-bold text-[var(--text-primary)] tracking-tight font-heading">
                Free Execution Limit Reached
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Free accounts receive 5 run attempts and 3 submit attempts per problem. Upgrade to CodeIt Pro for unlimited executions & premium features!
              </p>
            </div>

            <div className="bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-lg p-4 space-y-3 font-sans text-xs">
              <div className="flex items-center gap-2.5 text-[var(--text-primary)] font-medium">
                <Check className="w-4 h-4 text-sky-400 shrink-0" />
                <span>Unlimited Code Runs & Submissions</span>
              </div>
              <div className="flex items-center gap-2.5 text-[var(--text-primary)] font-medium">
                <Check className="w-4 h-4 text-sky-400 shrink-0" />
                <span>24/7 AI DSA Tutor & Code Debugger</span>
              </div>
              <div className="flex items-center gap-2.5 text-[var(--text-primary)] font-medium">
                <Check className="w-4 h-4 text-sky-400 shrink-0" />
                <span>Video Solutions & Editorial Walkthroughs</span>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <button
                onClick={() => {
                  setShowProModal(false);
                  toast.success("🚀 Upgrade request received! Pro Plan active soon.");
                }}
                className="w-full bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-sm py-2.5 rounded-lg transition-all shadow-md shadow-sky-500/20 cursor-pointer border-0"
              >
                Upgrade to CodeIt Pro
              </button>
              <button
                onClick={() => setShowProModal(false)}
                className="w-full text-[var(--text-muted)] hover:text-[var(--text-primary)] text-xs font-medium py-1.5 cursor-pointer bg-transparent border-0"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default ProblemWorkspace;
