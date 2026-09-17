import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useParams, useNavigate, NavLink } from "react-router";
import { useSelector, useDispatch } from "react-redux";
import { addSolvedProblemId } from "../authSlice";
import Editor from "@monaco-editor/react";
import axiosClient, { getErrorMessage } from "../utils/axiosClient";
import { formatTag } from "../utils/tagFormatter";
import toast from "react-hot-toast";
import CodeItRocketLogo from "../components/CodeItRocketLogo";
import Markdown from "../components/Markdown";
import PageLoader from "../components/PageLoader";
import { useTheme } from "../context/ThemeContext";
import {
  Play,
  Send,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Code2,
  CheckCircle2,
  XCircle,
  Tv,
  X,
  Copy,
  Check,
  Maximize2,
  Minimize2,
  AlertTriangle,
  Sun,
  Moon,
  ListFilter,
  Sparkles,
  FileText,
  Lightbulb,
  BookOpen,
  History,
  Bot,
  Terminal,
  Lock,
} from "lucide-react";

const LANGUAGE_OPTIONS = [
  { value: "cpp", label: "C++", ext: "cpp", monaco: "cpp" },
  { value: "java", label: "Java", ext: "java", monaco: "java" },
  { value: "python", label: "Python 3", ext: "py", monaco: "python" },
  { value: "javascript", label: "JavaScript", ext: "js", monaco: "javascript" },
];

const DEFAULT_STARTER_CODES = {
  cpp: `#include <iostream>
#include <vector>
#include <string>
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

const VERDICT_STYLES = {
  Accepted: "verdict-accepted",
  Passed: "verdict-accepted",
  Pending: "verdict-pending",
};
const verdictClass = (status) => VERDICT_STYLES[status] || "verdict-failed";

const formatEmbedUrl = (url) => {
  if (!url) return null;
  const str = String(url).trim();
  try {
    if (str.includes("youtube.com/watch")) {
      const videoId = new URL(str).searchParams.get("v");
      if (videoId) return `https://www.youtube.com/embed/${videoId}`;
    }
    if (str.includes("youtu.be/")) {
      const videoId = str.split("youtu.be/")[1]?.split("?")[0];
      if (videoId) return `https://www.youtube.com/embed/${videoId}`;
    }
    if (str.includes("youtube.com/embed/")) return str;
  } catch (e) {
    return null;
  }
  return null;
};

const checkIsPremium = (prob) =>
  prob?.isPremium === true ||
  prob?.isPremium === "true" ||
  prob?.title?.toLowerCase().includes("number of islands") ||
  prob?.title?.toLowerCase().includes("lru cache");

// drafts are kept per problem + language so a refresh never loses work
const draftKey = (id, language) => `codeit:draft:${id}:${language}`;
const readDraft = (id, language) => {
  try {
    return localStorage.getItem(draftKey(id, language));
  } catch (e) {
    return null;
  }
};
const writeDraft = (id, language, code) => {
  try {
    localStorage.setItem(draftKey(id, language), code);
  } catch (e) {
    // ignore quota / private mode errors
  }
};
const clearDraft = (id, language) => {
  try {
    localStorage.removeItem(draftKey(id, language));
  } catch (e) {
    // ignore
  }
};

const tabButtonClass = (active, accent = false) =>
  `px-3 py-1 rounded-[4px] text-xs font-medium transition-colors whitespace-nowrap inline-flex items-center gap-1.5 ${
    active
      ? accent
        ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
        : "bg-[var(--bg-primary)] text-[var(--text-primary)] font-semibold border border-[var(--border-subtle)]"
      : accent
        ? "text-purple-400 hover:bg-purple-500/10 border border-transparent"
        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-transparent"
  }`;

function ProblemWorkspace() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { theme, toggleTheme } = useTheme();

  // problem state
  const [problem, setProblem] = useState(null);
  const [loadingProblem, setLoadingProblem] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [allProblems, setAllProblems] = useState([]);

  // editor state
  const [language, setLanguage] = useState("cpp");
  const [code, setCode] = useState("");
  const [fontSize, setFontSize] = useState(() => {
    try {
      return Number(localStorage.getItem("codeit:fontSize")) || 13;
    } catch (e) {
      return 13;
    }
  });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mobileView, setMobileView] = useState("problem"); // problem | code (below lg)

  // left panel
  const [activeLeftTab, setActiveLeftTab] = useState("description");
  const [revealedHints, setRevealedHints] = useState(0);
  const [submissionsList, setSubmissionsList] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);

  // console
  const [consoleOpen, setConsoleOpen] = useState(true);
  const [activeConsoleTab, setActiveConsoleTab] = useState("testcases");
  const [selectedTestCaseIdx, setSelectedTestCaseIdx] = useState(0);
  const [customInput, setCustomInput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [runResults, setRunResults] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showProModal, setShowProModal] = useState(false);
  const [attempts, setAttempts] = useState(null);

  // ai tutor
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [aiMessages, setAiMessages] = useState([
    {
      role: "model",
      text: "Hi! I'm your CodeIt AI tutor. Ask for hints, an approach, complexity analysis, or help debugging your code for this problem.",
    },
  ]);
  const [aiInput, setAiInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const chatBottomRef = useRef(null);
  const leftPanelRef = useRef(null);
  const [copiedIdx, setCopiedIdx] = useState(null);

  const languageMeta = LANGUAGE_OPTIONS.find((l) => l.value === language) || LANGUAGE_OPTIONS[0];
  const isSolved = useMemo(() => {
    if (!user?.problemSolved) return false;
    return user.problemSolved.some((p) => String(typeof p === "object" && p !== null ? (p._id || p) : p) === String(id));
  }, [user, id]);

  // ---------------------------------------------------------- helpers ----
  const starterFor = useCallback(
    (lang, prob = problem) => {
      const starterObj = prob?.startCode?.find((s) => s.language?.toLowerCase() === lang.toLowerCase());
      return starterObj?.initialCode || DEFAULT_STARTER_CODES[lang] || "";
    },
    [problem]
  );

  const requireAuth = (action) => {
    if (isAuthenticated) return true;
    try {
      sessionStorage.setItem("redirectAfterAuth", `/problem/${id}`);
    } catch (e) {
      // ignore
    }
    toast.error(`Please sign in to ${action}.`, { id: "auth-required" });
    navigate(`/login?redirectTo=${encodeURIComponent(`/problem/${id}`)}`);
    return false;
  };

  const applyAttempts = (data) => {
    if (!data) return;
    if (data.runAttemptsLeft !== undefined || data.submitAttemptsLeft !== undefined) {
      setAttempts({
        runLeft: data.runAttemptsLeft,
        submitLeft: data.submitAttemptsLeft,
        runTotal: data.runAttemptsTotal,
        submitTotal: data.submitAttemptsTotal,
        unlimited: data.unlimited,
      });
    }
  };

  // -------------------------------------------------------- fullscreen ----
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => setIsFullscreen((f) => !f));
    } else {
      document.exitFullscreen?.().catch(() => setIsFullscreen(false));
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("codeit:fontSize", String(fontSize));
    } catch (e) {
      // ignore
    }
  }, [fontSize]);

  // ------------------------------------------------------ data loading ----
  useEffect(() => {
    let cancelled = false;
    setActiveLeftTab("description");
    setRevealedHints(0);
    setRunResults(null);
    setSubmitResult(null);
    setAttempts(null);
    setSelectedTestCaseIdx(0);
    setActiveConsoleTab("testcases");
    if (leftPanelRef.current) leftPanelRef.current.scrollTop = 0;

    async function loadProblem() {
      setLoadingProblem(true);
      setLoadError(null);
      try {
        const res = await axiosClient.get(`/problem/problemById/${id}`);
        if (cancelled) return;
        const probData = res.data;

        if (checkIsPremium(probData) && user?.role !== "pro" && user?.role !== "admin") {
          toast.error(`"${probData.title}" is a Premium problem. Upgrade to Pro to unlock it.`, { id: "premium", icon: "🔒" });
          navigate("/problems", { replace: true });
          return;
        }

        setProblem(probData);

        // pick the first language the problem ships starter code for
        const available = (probData.startCode || []).map((s) => s.language?.toLowerCase());
        let preferred = language;
        try {
          preferred = localStorage.getItem("codeit:language") || language;
        } catch (e) {
          // ignore
        }
        const initialLang = available.includes(preferred) ? preferred : available[0] || preferred;
        setLanguage(initialLang);
        setCode(readDraft(id, initialLang) ?? starterFor(initialLang, probData));

        if (probData.visibleTestCases?.length > 0) {
          setCustomInput(probData.visibleTestCases[0].input || "");
        }
      } catch (err) {
        if (cancelled) return;
        setLoadError(err.response?.status === 404 ? "This problem does not exist or was removed." : getErrorMessage(err, "Failed to load problem."));
      } finally {
        if (!cancelled) setLoadingProblem(false);
      }
    }

    async function loadAllProblems() {
      try {
        const res = await axiosClient.get("/problem/getAllProblem");
        if (!cancelled && Array.isArray(res.data)) setAllProblems(res.data);
      } catch (err) {
        // navigation between problems is optional
      }
    }

    loadProblem();
    loadAllProblems();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // attempts left for signed-in users
  useEffect(() => {
    if (!isAuthenticated || !problem) return;
    let cancelled = false;
    axiosClient
      .get(`/submission/attempts/${id}`)
      .then((res) => {
        if (!cancelled) applyAttempts(res.data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, problem, id]);

  // persist drafts (debounced)
  useEffect(() => {
    if (!problem) return;
    const timer = setTimeout(() => {
      if (code && code !== starterFor(language)) writeDraft(id, language, code);
      else clearDraft(id, language);
    }, 400);
    return () => clearTimeout(timer);
  }, [code, id, language, problem, starterFor]);

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    try {
      localStorage.setItem("codeit:language", newLang);
    } catch (e) {
      // ignore
    }
    setCode(readDraft(id, newLang) ?? starterFor(newLang));
    setRunResults(null);
  };

  const handleResetCode = () => {
    toast(
      (t) => (
        <div className="flex items-center gap-3 text-xs">
          <span>Reset code to the starter template?</span>
          <button
            type="button"
            className="px-2.5 py-1 rounded-[4px] bg-rose-500 text-white font-semibold"
            onClick={() => {
              setCode(starterFor(language));
              clearDraft(id, language);
              toast.dismiss(t.id);
              toast.success("Code reset to template.");
            }}
          >
            Reset
          </button>
          <button type="button" className="px-2 py-1 rounded-[4px] border border-[var(--border-subtle)]" onClick={() => toast.dismiss(t.id)}>
            Cancel
          </button>
        </div>
      ),
      { id: "reset-confirm", duration: 6000 }
    );
  };

  const fetchSubmissions = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoadingSubmissions(true);
    try {
      const res = await axiosClient.get(`/problem/submittedProblem/${id}`);
      setSubmissionsList(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not load submissions"), { id: "subs-load" });
    } finally {
      setLoadingSubmissions(false);
    }
  }, [id, isAuthenticated]);

  useEffect(() => {
    if (activeLeftTab === "submissions") fetchSubmissions();
  }, [activeLeftTab, fetchSubmissions]);

  // ---------------------------------------------------------- actions ----
  const handleRunCode = async (useCustom = false) => {
    if (!requireAuth("run code")) return;
    if (!code.trim()) {
      toast.error("Please write some code before running.");
      return;
    }
    if (isRunning || isSubmitting) return;

    setIsRunning(true);
    setConsoleOpen(true);
    setActiveConsoleTab("result");
    setRunResults(null);
    setMobileView("code");

    try {
      const payload = { code, language };
      if (useCustom) payload.customInput = customInput;
      const res = await axiosClient.post(`/submission/run/${id}`, payload);
      setRunResults(res.data);
      applyAttempts(res.data);
      const allPassed = res.data.results?.every((r) => r.passed);
      if (res.data.mode === "custom") toast.success("Executed with custom input.");
      else if (allPassed) toast.success("All sample test cases passed!");
      else toast.error(`${res.data.status || "Some test cases failed"}.`);
    } catch (err) {
      const isLimit = err.response?.status === 429 && err.response?.data?.isLimitReached;
      const errMsg = getErrorMessage(err, "Code run failed");
      applyAttempts(err.response?.data);
      if (isLimit) {
        setShowProModal(true);
      } else {
        toast.error(errMsg);
      }
      setRunResults({ success: false, error: errMsg, results: [] });
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmitCode = async () => {
    if (!requireAuth("submit code")) return;
    if (!code.trim()) {
      toast.error("Please write some code before submitting.");
      return;
    }
    if (isRunning || isSubmitting) return;

    setIsSubmitting(true);
    setShowSubmitModal(true);
    setSubmitResult(null);

    try {
      const res = await axiosClient.post(`/submission/submit/${id}`, { code, language });
      setSubmitResult(res.data);
      applyAttempts(res.data);
      if (res.data.submission?.status === "Accepted") {
        toast.success("Accepted! Problem solved.");
        dispatch(addSolvedProblemId({ _id: id, title: problem?.title, difficulty: problem?.difficulty }));
      } else {
        toast.error(`${res.data.submission?.status || "Submission failed"}`);
      }
    } catch (err) {
      const isLimit = err.response?.status === 429 && err.response?.data?.isLimitReached;
      const errMsg = getErrorMessage(err, "Submission failed");
      applyAttempts(err.response?.data);
      if (isLimit) {
        setShowSubmitModal(false);
        setShowProModal(true);
      } else {
        toast.error(errMsg);
      }
      setSubmitResult({ success: false, submission: { status: "Error", errorMessage: errMsg } });
    } finally {
      setIsSubmitting(false);
    }
  };

  // keyboard shortcuts: ctrl/cmd+enter runs, ctrl/cmd+shift+enter submits.
  // handlers are kept in a ref so monaco's command (registered once on mount) always sees fresh state
  const actionsRef = useRef({ run: () => {}, submit: () => {} });
  actionsRef.current = { run: () => handleRunCode(false), submit: handleSubmitCode };

  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        if (e.shiftKey) actionsRef.current.submit();
        else actionsRef.current.run();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // monaco swallows ctrl+enter (insert line below) unless we bind it ourselves
  const handleEditorMount = (editor, monaco) => {
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => actionsRef.current.run());
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.Enter, () => actionsRef.current.submit());
  };

  const handleSendAiMessage = async (overridePrompt) => {
    const messageToSend = (overridePrompt || aiInput).trim();
    if (!messageToSend || aiLoading) return;
    if (!isAuthenticated) {
      toast.error("Please sign in to use the AI tutor.", { id: "auth-required" });
      return;
    }

    const updatedMessages = [...aiMessages, { role: "user", text: messageToSend }];
    setAiMessages(updatedMessages);
    setAiInput("");
    setAiLoading(true);

    try {
      const formattedHistory = updatedMessages.slice(1).map((msg) => ({
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
        language,
      });

      if (res.data?.message) {
        setAiMessages((prev) => [...prev, { role: "model", text: res.data.message }]);
      }
    } catch (err) {
      const errMsg = getErrorMessage(err, "The AI tutor is temporarily busy. Please try again shortly.");
      setAiMessages((prev) => [...prev, { role: "model", text: `⚠️ ${errMsg}`, isError: true }]);
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    if (isAiOpen) chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [aiMessages, aiLoading, isAiOpen]);

  const copyToClipboard = async (text, idx) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIdx(idx);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopiedIdx(null), 2000);
    } catch (e) {
      toast.error("Clipboard is not available.");
    }
  };

  // problem navigation
  const currentIndex = allProblems.findIndex((p) => p._id === id);
  const prevProblem = currentIndex > 0 ? allProblems[currentIndex - 1] : null;
  const nextProblem = currentIndex >= 0 && currentIndex < allProblems.length - 1 ? allProblems[currentIndex + 1] : null;

  // parsed problem content
  const parsedProblem = useMemo(() => {
    if (!problem) return { description: "", examples: [], constraints: "" };
    let rawDesc = problem.description || "";
    let examples = Array.isArray(problem.examples) && problem.examples.length > 0 ? [...problem.examples] : [];
    let constraints = typeof problem.constraints === "string" ? problem.constraints.trim() : "";

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
      if (!constraints && constraintsPart) constraints = constraintsPart;
      if (examples.length === 0 && examplesPart) {
        examplesPart.split(/Example \d+:|Example:/g).filter(Boolean).forEach((block) => {
          let input = "";
          let output = "";
          let explanation = "";
          block.split("\n").map((l) => l.trim()).filter(Boolean).forEach((line) => {
            if (/^input:/i.test(line)) input = line.replace(/^input:\s*/i, "").trim();
            else if (/^output:/i.test(line)) output = line.replace(/^output:\s*/i, "").trim();
            else if (/^explanation:/i.test(line)) explanation = line.replace(/^explanation:\s*/i, "").trim();
          });
          if (input || output) examples.push({ input, output, explanation });
        });
      }
      rawDesc = descPart.trim();
    }

    if (examples.length === 0 && Array.isArray(problem.visibleTestCases) && problem.visibleTestCases.length > 0) {
      examples = problem.visibleTestCases.map((tc) => ({ input: tc.input || "", output: tc.output || "", explanation: tc.explanation || "" }));
    }

    return { description: rawDesc, examples, constraints };
  }, [problem]);

  // ----------------------------------------------------------- render ----
  if (loadingProblem) {
    return <PageLoader message="Loading problem environment..." />;
  }

  if (!problem) {
    return (
      <div className="min-h-dvh bg-[var(--bg-primary)] text-[var(--text-primary)] flex flex-col items-center justify-center p-6 text-center">
        <AlertTriangle className="w-14 h-14 text-amber-500 mb-4" aria-hidden="true" />
        <h2 className="text-2xl font-bold mb-2 font-heading">Problem Not Found</h2>
        <p className="text-[var(--text-secondary)] mb-6 max-w-md text-sm">{loadError || "The problem you are looking for might have been removed or does not exist."}</p>
        <NavLink to="/problems" className="bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-semibold text-sm px-5 py-2.5 rounded-[6px]">
          Browse All Problems
        </NavLink>
      </div>
    );
  }

  const attemptsLabel = attempts && !attempts.unlimited
    ? `Runs ${attempts.runLeft ?? "—"}/${attempts.runTotal ?? "—"} · Submits ${attempts.submitLeft ?? "—"}/${attempts.submitTotal ?? "—"}`
    : attempts?.unlimited
      ? "Unlimited runs"
      : null;

  const runButton = (
    <button
      type="button"
      onClick={() => handleRunCode(activeConsoleTab === "custom")}
      disabled={isRunning || isSubmitting}
      className="bg-emerald-500/15 text-emerald-500 dark:text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/30 px-3 py-1.5 rounded-[6px] text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-60"
      title="Run (Ctrl+Enter)"
    >
      {isRunning ? <span className="loading loading-spinner loading-xs"></span> : <Play className="w-3 h-3 fill-current" aria-hidden="true" />}
      <span>Run</span>
    </button>
  );

  const submitButton = (
    <button
      type="button"
      onClick={handleSubmitCode}
      disabled={isRunning || isSubmitting}
      className="bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white px-3.5 py-1.5 rounded-[6px] text-xs font-bold flex items-center gap-1.5 transition-all disabled:opacity-60"
      title="Submit (Ctrl+Shift+Enter)"
    >
      {isSubmitting ? <span className="loading loading-spinner loading-xs"></span> : <Send className="w-3 h-3" aria-hidden="true" />}
      <span>Submit</span>
    </button>
  );

  const languageSelect = (
    <>
      <label htmlFor="language-select" className="sr-only">Language</label>
      <select
        id="language-select"
        value={language}
        onChange={(e) => handleLanguageChange(e.target.value)}
        className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-xs rounded-[6px] px-2 py-1.5 focus:outline-none cursor-pointer"
      >
        {LANGUAGE_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </>
  );

  return (
    <div className={`h-dvh flex flex-col bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans overflow-hidden ${isFullscreen ? "fixed inset-0 z-50" : ""}`}>

      {/* top workspace header */}
      <header className="bg-[var(--bg-primary)] border-b border-[var(--border-subtle)] shrink-0 z-20 text-xs">
        <div className="h-12 px-3 sm:px-4 flex items-center justify-between gap-2">

          {/* brand and problem navigation */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <NavLink to="/" className="flex items-center gap-2 text-[var(--text-primary)] font-bold text-sm tracking-tight font-heading hover:opacity-80 transition-opacity shrink-0" aria-label="CodeIt home">
              <CodeItRocketLogo className="w-5 h-5 text-[var(--text-primary)]" />
              <span className="hidden sm:inline">CodeIt</span>
            </NavLink>

            <NavLink
              to="/problems"
              className="flex items-center gap-1.5 px-2 py-1 rounded-[6px] bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all font-medium shrink-0"
              title="Go to Problems List"
            >
              <ListFilter className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="hidden md:inline">Problems</span>
            </NavLink>

            <div className="flex items-center gap-1 text-xs text-[var(--text-secondary)] min-w-0">
              <button
                type="button"
                onClick={() => prevProblem && navigate(`/problem/${prevProblem._id}`)}
                disabled={!prevProblem}
                className="p-1 rounded-[4px] hover:bg-[var(--bg-secondary)] border border-[var(--border-subtle)] disabled:opacity-30 transition-colors hidden sm:inline-flex"
                title={prevProblem ? `Previous: ${prevProblem.title}` : "No previous problem"}
                aria-label="Previous problem"
              >
                <ChevronLeft className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
              <span className="font-semibold text-[var(--text-primary)] truncate max-w-[120px] sm:max-w-[200px] lg:max-w-xs flex items-center gap-1.5">
                {isSolved && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" aria-label="Solved" />}
                <span className="truncate">{problem.title}</span>
              </span>
              <button
                type="button"
                onClick={() => nextProblem && navigate(`/problem/${nextProblem._id}`)}
                disabled={!nextProblem}
                className="p-1 rounded-[4px] hover:bg-[var(--bg-secondary)] border border-[var(--border-subtle)] disabled:opacity-30 transition-colors hidden sm:inline-flex"
                title={nextProblem ? `Next: ${nextProblem.title}` : "No next problem"}
                aria-label="Next problem"
              >
                <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* language and run controls (desktop) */}
          <div className="hidden lg:flex items-center gap-2">
            {attemptsLabel && (
              <span className="text-[11px] text-[var(--text-muted)] font-mono hidden xl:inline" title="Free-tier attempts remaining for this problem">
                {attemptsLabel}
              </span>
            )}
            {languageSelect}
            {runButton}
            {submitButton}
          </div>

          {/* theme, ai tutor, and profile controls */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              type="button"
              onClick={toggleTheme}
              className="p-1.5 rounded-[6px] bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? <Sun className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" /> : <Moon className="w-3.5 h-3.5 text-indigo-400" aria-hidden="true" />}
            </button>

            <button
              type="button"
              onClick={() => setIsAiOpen(!isAiOpen)}
              className={`px-2.5 py-1.5 rounded-[6px] text-xs font-semibold flex items-center gap-1.5 transition-all border ${
                isAiOpen
                  ? "bg-sky-500/20 text-sky-400 border-sky-500/40"
                  : "bg-sky-500/10 text-sky-500 dark:text-sky-400 border-sky-500/20 hover:bg-sky-500/20"
              }`}
              aria-pressed={isAiOpen}
              aria-label="Toggle AI tutor"
            >
              <Bot className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">AI Tutor</span>
            </button>

            <button
              type="button"
              onClick={toggleFullscreen}
              className="p-1.5 rounded-[6px] bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors hidden sm:inline-flex"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
              aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" aria-hidden="true" /> : <Maximize2 className="w-3.5 h-3.5" aria-hidden="true" />}
            </button>

            {user ? (
              <NavLink
                to="/profile"
                className="w-7 h-7 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[var(--text-primary)] font-semibold flex items-center justify-center text-xs hover:border-[var(--text-secondary)] transition-colors"
                title="Go to My Profile"
                aria-label="My profile"
              >
                {user.firstName ? user.firstName[0].toUpperCase() : "U"}
              </NavLink>
            ) : (
              <NavLink
                to={`/login?redirectTo=${encodeURIComponent(`/problem/${id}`)}`}
                className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] font-medium px-2.5 py-1.5 rounded-[6px] text-xs transition-colors whitespace-nowrap"
              >
                Sign In
              </NavLink>
            )}
          </div>
        </div>

        {/* mobile / tablet second row: view switch + run controls */}
        <div className="lg:hidden h-11 px-2 sm:px-3 border-t border-[var(--border-subtle)] flex items-center justify-between gap-2 bg-[var(--bg-secondary)] overflow-x-auto scrollbar-none">
          <div className="flex items-center rounded-[6px] border border-[var(--border-subtle)] p-0.5 bg-[var(--bg-primary)] shrink-0" role="tablist" aria-label="Workspace view">
            <button
              type="button"
              role="tab"
              aria-selected={mobileView === "problem"}
              onClick={() => setMobileView("problem")}
              className={`px-2.5 py-1 rounded-[4px] text-xs font-semibold flex items-center gap-1 ${mobileView === "problem" ? "bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-subtle)]" : "text-[var(--text-secondary)]"}`}
            >
              <FileText className="w-3.5 h-3.5" aria-hidden="true" /> <span className="hidden min-[440px]:inline">Problem</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mobileView === "code"}
              onClick={() => setMobileView("code")}
              className={`px-2.5 py-1 rounded-[4px] text-xs font-semibold flex items-center gap-1 ${mobileView === "code" ? "bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-subtle)]" : "text-[var(--text-secondary)]"}`}
            >
              <Code2 className="w-3.5 h-3.5" aria-hidden="true" /> <span className="hidden min-[440px]:inline">Code</span>
            </button>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {languageSelect}
            {runButton}
            {submitButton}
          </div>
        </div>
      </header>

      {/* main split view */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative min-h-0">

        {/* left pane: description and details */}
        <section
          className={`w-full lg:w-[42%] xl:w-[40%] h-full lg:border-r border-[var(--border-subtle)] flex-col bg-[var(--bg-primary)] overflow-hidden ${mobileView === "problem" ? "flex" : "hidden"} lg:flex`}
          aria-label="Problem details"
        >
          <div className="h-10 bg-[var(--bg-secondary)] border-b border-[var(--border-subtle)] px-2 sm:px-3 flex items-center gap-1 shrink-0 overflow-x-auto scrollbar-none text-xs" role="tablist">
            <button type="button" role="tab" aria-selected={activeLeftTab === "description"} onClick={() => setActiveLeftTab("description")} className={tabButtonClass(activeLeftTab === "description")}>
              <FileText className="w-3.5 h-3.5" aria-hidden="true" /> Description
            </button>
            {problem.hints?.length > 0 && (
              <button type="button" role="tab" aria-selected={activeLeftTab === "hints"} onClick={() => setActiveLeftTab("hints")} className={tabButtonClass(activeLeftTab === "hints")}>
                <Lightbulb className="w-3.5 h-3.5" aria-hidden="true" /> Hints
              </button>
            )}
            {problem.editorial && (
              <button type="button" role="tab" aria-selected={activeLeftTab === "editorial"} onClick={() => setActiveLeftTab("editorial")} className={tabButtonClass(activeLeftTab === "editorial")}>
                <BookOpen className="w-3.5 h-3.5" aria-hidden="true" /> Editorial
              </button>
            )}
            <button type="button" role="tab" aria-selected={activeLeftTab === "video"} onClick={() => setActiveLeftTab("video")} className={tabButtonClass(activeLeftTab === "video", true)}>
              <Tv className="w-3.5 h-3.5" aria-hidden="true" /> Video
              {problem.secureUrl && <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" aria-label="available"></span>}
            </button>
            <button type="button" role="tab" aria-selected={activeLeftTab === "submissions"} onClick={() => setActiveLeftTab("submissions")} className={tabButtonClass(activeLeftTab === "submissions")}>
              <History className="w-3.5 h-3.5" aria-hidden="true" /> Submissions
            </button>
          </div>

          <div ref={leftPanelRef} className="flex-1 overflow-y-auto p-4 space-y-5 text-[var(--text-primary)] text-xs leading-relaxed">

            {activeLeftTab === "description" && (
              <>
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h1 className="text-lg font-bold tracking-tight font-heading">{problem.title}</h1>
                    <span className={`px-2 py-0.5 rounded-[4px] text-[11px] font-semibold capitalize shrink-0 ${problem.difficulty === "easy" ? "badge-easy" : problem.difficulty === "medium" ? "badge-medium" : "badge-hard"}`}>
                      {problem.difficulty}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1 mt-2">
                    {problem.tags?.map((tag, idx) => (
                      <span key={`t-${idx}`} className="bg-sky-500/10 text-sky-500 dark:text-sky-400 border border-sky-500/20 px-2.5 py-0.5 rounded-[4px] text-[11px] font-mono">
                        {formatTag(tag)}
                      </span>
                    ))}
                    {problem.companyTags?.map((company, idx) => (
                      <span key={`c-${idx}`} className="bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border-subtle)] px-2.5 py-0.5 rounded-[4px] text-[11px] font-mono capitalize">
                        {company}
                      </span>
                    ))}
                    {isSolved && (
                      <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2.5 py-0.5 rounded-[4px] text-[11px] font-semibold inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" aria-hidden="true" /> Solved
                      </span>
                    )}
                  </div>
                </div>

                <Markdown content={parsedProblem.description} className="text-[var(--text-secondary)] text-xs" />

                {parsedProblem.examples.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] font-heading">Examples</h2>
                    {parsedProblem.examples.map((example, idx) => (
                      <div key={idx} className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-[6px] p-3 space-y-1.5 font-mono text-[11px]">
                        <div className="flex items-center justify-between text-[var(--text-muted)] font-semibold mb-1">
                          <span>Example {idx + 1}</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(`Input: ${example.input}\nOutput: ${example.output}`, `ex-${idx}`)}
                            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] flex items-center gap-1 font-sans text-[10px]"
                            aria-label={`Copy example ${idx + 1}`}
                          >
                            {copiedIdx === `ex-${idx}` ? <Check className="w-3 h-3" aria-hidden="true" /> : <Copy className="w-3 h-3" aria-hidden="true" />}
                            <span>{copiedIdx === `ex-${idx}` ? "Copied" : "Copy"}</span>
                          </button>
                        </div>
                        <p className="whitespace-pre-wrap break-words"><span className="text-[var(--text-muted)]">Input:</span> {example.input}</p>
                        <p className="whitespace-pre-wrap break-words"><span className="text-[var(--text-muted)]">Output:</span> {example.output}</p>
                        {example.explanation && (
                          <p className="text-[var(--text-secondary)] pt-1 font-sans"><span className="text-[var(--text-muted)]">Explanation:</span> {example.explanation}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {parsedProblem.constraints && (
                  <div className="space-y-2 pt-2">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] font-heading">Constraints</h2>
                    <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-[6px] p-3 text-xs font-mono text-[var(--text-secondary)] whitespace-pre-line leading-relaxed">
                      {parsedProblem.constraints}
                    </div>
                  </div>
                )}
              </>
            )}

            {activeLeftTab === "hints" && (
              <div className="space-y-3">
                <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] font-heading">Hints</h2>
                <p className="text-[var(--text-muted)]">Reveal hints one at a time. Try to solve it yourself first!</p>
                {problem.hints?.map((hint, idx) => (
                  <div key={idx} className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-[6px] p-3 text-xs text-[var(--text-secondary)] space-y-1">
                    <span className="font-bold text-[var(--text-primary)] block">Hint {idx + 1}</span>
                    {idx < revealedHints ? (
                      <p>{hint}</p>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setRevealedHints(idx + 1)}
                        disabled={idx > revealedHints}
                        className="text-sky-500 dark:text-sky-400 font-semibold hover:underline disabled:opacity-40 disabled:no-underline"
                      >
                        {idx > revealedHints ? "Reveal the previous hint first" : "Reveal hint"}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {activeLeftTab === "editorial" && (
              <div className="space-y-3">
                <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] font-heading">Editorial</h2>
                <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-[6px] p-3.5 text-xs text-[var(--text-secondary)] leading-relaxed">
                  <Markdown content={problem.editorial || "No editorial written for this problem yet."} />
                </div>
              </div>
            )}

            {activeLeftTab === "video" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] font-heading flex items-center gap-1.5">
                    <Tv className="w-4 h-4 text-purple-400" aria-hidden="true" /> Video Solution
                  </h2>
                  {problem.secureUrl && (
                    <span className="text-[10px] bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded-[4px] font-mono font-semibold">AVAILABLE</span>
                  )}
                </div>

                {problem.secureUrl ? (
                  formatEmbedUrl(problem.secureUrl) ? (
                    <div className="rounded-[8px] overflow-hidden border border-[var(--border-subtle)] bg-black">
                      <iframe
                        src={formatEmbedUrl(problem.secureUrl)}
                        title={`Video solution for ${problem.title}`}
                        className="w-full aspect-video"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    <div className="rounded-[8px] overflow-hidden border border-[var(--border-subtle)] bg-black">
                      <video src={problem.secureUrl} controls poster={problem.thumbnailUrl || undefined} className="w-full aspect-video" preload="metadata">
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  )
                ) : (
                  <div className="bg-[var(--bg-secondary)] border border-purple-500/20 rounded-[8px] p-6 text-center space-y-2.5">
                    <div className="w-10 h-10 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mx-auto">
                      <Tv className="w-5 h-5" aria-hidden="true" />
                    </div>
                    <p className="text-xs text-[var(--text-primary)] font-semibold">No video solution yet</p>
                    <p className="text-[11px] text-[var(--text-secondary)] max-w-xs mx-auto leading-relaxed">
                      Admins can attach a video from Admin Studio. Meanwhile, ask the AI tutor for step-by-step guidance.
                    </p>
                    <button type="button" onClick={() => setIsAiOpen(true)} className="text-xs font-semibold text-sky-500 dark:text-sky-400 hover:underline">
                      Open AI Tutor
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeLeftTab === "submissions" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] font-heading">Submission History</h2>
                  <button type="button" onClick={fetchSubmissions} className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]">Refresh</button>
                </div>

                {!isAuthenticated ? (
                  <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-[6px] p-6 text-center text-[var(--text-muted)] text-xs space-y-2">
                    <Lock className="w-5 h-5 mx-auto" aria-hidden="true" />
                    <p>Sign in to see your submissions for this problem.</p>
                  </div>
                ) : loadingSubmissions ? (
                  <div className="flex justify-center py-8" role="status">
                    <span className="loading loading-spinner loading-md text-[var(--text-secondary)]"></span>
                  </div>
                ) : submissionsList.length === 0 ? (
                  <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-[6px] p-6 text-center text-[var(--text-muted)] text-xs">
                    No submissions yet. Submit your solution to see it here.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {submissionsList.map((sub, idx) => (
                      <details key={sub._id || idx} className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-[6px] text-xs font-mono group">
                        <summary className="p-3 flex items-center justify-between gap-3 cursor-pointer list-none">
                          <div className="min-w-0">
                            <span className={`font-bold block ${verdictClass(sub.status)}`}>{sub.status}</span>
                            <span className="text-[var(--text-muted)] text-[10px] font-sans">{new Date(sub.createdAt).toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-2 text-[var(--text-secondary)] text-[11px] shrink-0">
                            <span className="uppercase">{sub.language}</span>
                            <span>{sub.testCasesPassed ?? 0}/{sub.totalTestCases ?? 0}</span>
                            {sub.runtime ? <span>{sub.runtime} ms</span> : null}
                            <ChevronDown className="w-3.5 h-3.5 group-open:rotate-180 transition-transform" aria-hidden="true" />
                          </div>
                        </summary>
                        <div className="border-t border-[var(--border-subtle)] p-3 space-y-2">
                          {sub.errorMessage && (
                            <pre className="text-[11px] text-rose-400 whitespace-pre-wrap break-words">{sub.errorMessage}</pre>
                          )}
                          <pre className="text-[11px] whitespace-pre-wrap break-words max-h-48 overflow-auto bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-[4px] p-2">{sub.code}</pre>
                          <button
                            type="button"
                            onClick={() => {
                              if (sub.language && sub.language !== language) handleLanguageChange(sub.language);
                              setCode(sub.code || "");
                              setMobileView("code");
                              toast.success("Loaded submission into the editor.");
                            }}
                            className="text-[11px] font-sans font-semibold text-sky-500 dark:text-sky-400 hover:underline"
                          >
                            Load into editor
                          </button>
                        </div>
                      </details>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* right pane: editor and console */}
        <section
          className={`w-full lg:w-[58%] xl:w-[60%] h-full flex-col bg-[var(--bg-primary)] overflow-hidden ${mobileView === "code" ? "flex" : "hidden"} lg:flex`}
          aria-label="Code editor"
        >
          <div className="h-10 bg-[var(--bg-secondary)] border-b border-[var(--border-subtle)] px-3 flex items-center justify-between shrink-0 text-xs text-[var(--text-secondary)]">
            <div className="flex items-center gap-2 font-mono min-w-0">
              <Code2 className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" aria-hidden="true" />
              <span className="truncate">solution.{languageMeta.ext}</span>
              {attemptsLabel && (
                <span className="text-[10px] text-[var(--text-muted)] hidden sm:inline xl:hidden truncate" title="Free-tier attempts remaining">· {attemptsLabel}</span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <label htmlFor="font-size" className="sr-only">Font size</label>
              <select
                id="font-size"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="bg-transparent border-0 text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs focus:outline-none cursor-pointer"
                title="Font size"
              >
                {[12, 13, 14, 16, 18].map((size) => (
                  <option key={size} value={size}>{size}px</option>
                ))}
              </select>

              <button
                type="button"
                onClick={handleResetCode}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1 transition-colors"
                title="Reset code template"
              >
                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-hidden relative min-h-[120px]">
            <Editor
              height="100%"
              language={languageMeta.monaco}
              theme={theme === "dark" ? "vs-dark" : "light"}
              value={code}
              onChange={(value) => setCode(value || "")}
              onMount={handleEditorMount}
              loading={<div className="h-full flex items-center justify-center text-xs text-[var(--text-muted)]">Loading editor...</div>}
              options={{
                fontSize,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 4,
                wordWrap: "on",
                fontFamily: "'JetBrains Mono', ui-monospace, monospace",
                fontLigatures: true,
                lineNumbers: "on",
                renderLineHighlight: "all",
                padding: { top: 10 },
                smoothScrolling: true,
                scrollbar: { verticalScrollbarSize: 8, horizontalScrollbarSize: 8 },
              }}
            />
          </div>

          {/* bottom execution console */}
          <div className={`bg-[var(--bg-secondary)] border-t border-[var(--border-subtle)] flex flex-col shrink-0 transition-[height] ${consoleOpen ? "h-[45%] sm:h-56 lg:h-60" : "h-9"}`}>
            <div className="h-9 bg-[var(--bg-primary)] border-b border-[var(--border-subtle)] px-2 sm:px-3 flex items-center justify-between shrink-0 text-xs">
              <div className="flex items-center gap-1 overflow-x-auto scrollbar-none" role="tablist" aria-label="Console">
                {[
                  { key: "testcases", label: "Test Cases" },
                  { key: "custom", label: "Custom Input" },
                  { key: "result", label: "Result" },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    role="tab"
                    aria-selected={activeConsoleTab === tab.key}
                    onClick={() => {
                      setActiveConsoleTab(tab.key);
                      setConsoleOpen(true);
                    }}
                    className={`px-2.5 py-0.5 rounded-[4px] text-xs font-medium transition-colors whitespace-nowrap ${
                      activeConsoleTab === tab.key && consoleOpen
                        ? "bg-[var(--bg-secondary)] text-[var(--text-primary)] font-semibold border border-[var(--border-subtle)]"
                        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-transparent"
                    }`}
                  >
                    {tab.label}
                    {tab.key === "result" && runResults?.results?.length > 0 && (
                      <span className={`ml-1.5 inline-block w-1.5 h-1.5 rounded-full ${runResults.results.every((r) => r.passed) ? "bg-emerald-500" : "bg-rose-500"}`} aria-hidden="true"></span>
                    )}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span className="hidden md:inline text-[10px] text-[var(--text-muted)] font-mono">Ctrl+Enter to run</span>
                <button
                  type="button"
                  onClick={() => setConsoleOpen((o) => !o)}
                  className="p-1 rounded-[4px] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  aria-label={consoleOpen ? "Collapse console" : "Expand console"}
                  aria-expanded={consoleOpen}
                >
                  {consoleOpen ? <ChevronDown className="w-4 h-4" aria-hidden="true" /> : <ChevronUp className="w-4 h-4" aria-hidden="true" />}
                </button>
              </div>
            </div>

            {consoleOpen && (
              <div className="flex-1 p-3 overflow-y-auto font-mono text-xs text-[var(--text-primary)]">

                {activeConsoleTab === "testcases" && (
                  <div className="space-y-3">
                    {problem.visibleTestCases?.length > 0 ? (
                      <>
                        <div className="flex items-center gap-2 flex-wrap">
                          {problem.visibleTestCases.map((_, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setSelectedTestCaseIdx(idx)}
                              className={`px-2.5 py-0.5 rounded-[4px] text-xs font-medium border transition-colors ${
                                selectedTestCaseIdx === idx
                                  ? "bg-[var(--text-primary)] text-[var(--bg-primary)] border-[var(--text-primary)]"
                                  : "bg-[var(--bg-primary)] border-[var(--border-subtle)] text-[var(--text-secondary)]"
                              }`}
                            >
                              Case {idx + 1}
                            </button>
                          ))}
                        </div>
                        {problem.visibleTestCases[selectedTestCaseIdx] && (
                          <div className="space-y-2 bg-[var(--bg-primary)] p-3 rounded-[6px] border border-[var(--border-subtle)]">
                            <div>
                              <span className="text-[var(--text-muted)] font-bold block mb-1">Input (stdin):</span>
                              <pre className="bg-[var(--bg-secondary)] p-2 rounded-[4px] border border-[var(--border-subtle)] whitespace-pre-wrap break-words">{problem.visibleTestCases[selectedTestCaseIdx].input}</pre>
                            </div>
                            <div>
                              <span className="text-[var(--text-muted)] font-bold block mb-1">Expected Output:</span>
                              <pre className="bg-[var(--bg-secondary)] p-2 rounded-[4px] border border-[var(--border-subtle)] whitespace-pre-wrap break-words">{problem.visibleTestCases[selectedTestCaseIdx].output}</pre>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="text-[var(--text-muted)] font-sans">This problem has no sample test cases. Use Custom Input to try your code.</p>
                    )}
                  </div>
                )}

                {activeConsoleTab === "custom" && (
                  <div className="space-y-2 h-full flex flex-col">
                    <div className="flex items-center justify-between gap-2">
                      <label htmlFor="custom-input" className="text-[var(--text-muted)] font-bold">Input (stdin):</label>
                      <button
                        type="button"
                        onClick={() => handleRunCode(true)}
                        disabled={isRunning || isSubmitting}
                        className="inline-flex items-center gap-1 text-[11px] font-sans font-semibold text-emerald-500 dark:text-emerald-400 hover:underline disabled:opacity-50"
                      >
                        <Terminal className="w-3 h-3" aria-hidden="true" /> Run with this input
                      </button>
                    </div>
                    <textarea
                      id="custom-input"
                      value={customInput}
                      onChange={(e) => setCustomInput(e.target.value)}
                      placeholder="Enter stdin input here..."
                      spellCheck={false}
                      className="flex-1 min-h-[80px] w-full bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-[6px] p-2 text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:border-sky-500 resize-none"
                    />
                  </div>
                )}

                {activeConsoleTab === "result" && (
                  <div>
                    {isRunning ? (
                      <div className="flex items-center gap-2 py-4 justify-center text-[var(--text-muted)]" role="status">
                        <span className="loading loading-spinner loading-sm text-[var(--text-secondary)]"></span>
                        <span>Compiling and running...</span>
                      </div>
                    ) : !runResults ? (
                      <div className="py-4 text-center text-[var(--text-muted)] font-sans">
                        Press <strong className="text-[var(--text-primary)]">Run</strong> to execute your code against the sample cases.
                      </div>
                    ) : runResults.results?.length > 0 ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between font-sans flex-wrap gap-2">
                          <span className={`font-bold text-sm ${runResults.mode === "custom" ? "text-[var(--text-primary)]" : verdictClass(runResults.status)}`}>
                            {runResults.mode === "custom" ? "Custom run" : runResults.status}
                          </span>
                          {runResults.mode !== "custom" && (
                            <span className="text-[11px] text-[var(--text-muted)]">
                              {runResults.results.filter((r) => r.passed).length}/{runResults.results.length} passed
                            </span>
                          )}
                        </div>

                        {runResults.results.map((res, idx) => (
                          <div key={idx} className={`p-2.5 rounded-[6px] border bg-[var(--bg-primary)] space-y-1.5 ${res.passed ? "border-emerald-500/30" : "border-rose-500/30"}`}>
                            <div className="flex items-center justify-between">
                              <span className="font-bold">{runResults.mode === "custom" ? "Output" : `Case ${idx + 1}`}</span>
                              <span className={`font-semibold inline-flex items-center gap-1 ${res.passed ? "verdict-accepted" : "verdict-failed"}`}>
                                {res.passed ? <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" /> : <XCircle className="w-3.5 h-3.5" aria-hidden="true" />}
                                {res.status || (res.passed ? "Passed" : "Failed")}
                                {res.runtime ? <span className="text-[var(--text-muted)] font-normal ml-1">{res.runtime} ms</span> : null}
                              </span>
                            </div>
                            {res.error && (
                              <pre className="text-[11px] text-rose-400 whitespace-pre-wrap break-words bg-rose-500/5 border border-rose-500/20 rounded p-2">{res.error}</pre>
                            )}
                            <div className={`grid gap-2 text-xs ${res.expectedOutput !== null && res.expectedOutput !== undefined ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-1"}`}>
                              <div>
                                <span className="text-[var(--text-muted)] block text-[10px]">Input:</span>
                                <pre className="p-1.5 rounded bg-[var(--bg-secondary)] border border-[var(--border-subtle)] whitespace-pre-wrap break-words">{res.input || "<empty>"}</pre>
                              </div>
                              <div>
                                <span className="text-[var(--text-muted)] block text-[10px]">Your Output:</span>
                                <pre className="p-1.5 rounded bg-[var(--bg-secondary)] border border-[var(--border-subtle)] whitespace-pre-wrap break-words">{res.output || "<empty>"}</pre>
                              </div>
                              {res.expectedOutput !== null && res.expectedOutput !== undefined && (
                                <div>
                                  <span className="text-[var(--text-muted)] block text-[10px]">Expected:</span>
                                  <pre className="p-1.5 rounded bg-[var(--bg-secondary)] border border-[var(--border-subtle)] whitespace-pre-wrap break-words">{res.expectedOutput}</pre>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-3 bg-rose-500/5 border border-rose-500/20 rounded-[6px] font-mono">
                        <p className="font-bold mb-1 text-rose-400">Execution Error</p>
                        <pre className="whitespace-pre-wrap break-words text-xs">{runResults.error || "Execution failed"}</pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* ai tutor drawer */}
        {isAiOpen && (
          <aside className="absolute top-0 right-0 bottom-0 w-full sm:w-96 bg-[var(--bg-secondary)] border-l border-[var(--border-subtle)] z-40 flex flex-col shadow-2xl animate-slide-in-right" aria-label="AI tutor">
            <div className="h-10 bg-[var(--bg-primary)] border-b border-[var(--border-subtle)] px-3 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" aria-hidden="true"></span>
                <h3 className="font-bold text-xs text-[var(--text-primary)] font-heading">AI Tutor</h3>
                <span className="text-[10px] text-[var(--text-muted)] hidden sm:inline">· scoped to this problem</span>
              </div>
              <button type="button" onClick={() => setIsAiOpen(false)} className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)]" aria-label="Close AI tutor">
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            <div className="p-2 bg-[var(--bg-secondary)] border-b border-[var(--border-subtle)] flex flex-wrap gap-1 shrink-0">
              {[
                { label: "Give a hint", prompt: "Give me a subtle hint without spoiling the complete answer." },
                { label: "Best approach", prompt: "What is the optimal approach for this problem? Explain the intuition and the time and space complexity." },
                { label: "Debug my code", prompt: `Here is my current ${languageMeta.label} code:\n\`\`\`${language}\n${code}\n\`\`\`\nReview it and point out bugs, edge cases I missed, or improvements.` },
                { label: "Edge cases", prompt: "List tricky edge cases and test inputs I should verify for this problem." },
              ].map((chip) => (
                <button
                  key={chip.label}
                  type="button"
                  onClick={() => handleSendAiMessage(chip.prompt)}
                  disabled={aiLoading}
                  className="bg-[var(--bg-primary)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-sky-400 hover:border-sky-500/30 text-[10px] px-2 py-1 rounded-[4px] transition-colors disabled:opacity-50"
                >
                  {chip.label}
                </button>
              ))}
            </div>

            <div className="flex-1 p-3 overflow-y-auto space-y-2.5 text-xs" aria-live="polite">
              {aiMessages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[88%] p-2.5 rounded-[8px] text-xs leading-relaxed border ${
                      msg.role === "user"
                        ? "bg-sky-500/15 border-sky-500/30 text-[var(--text-primary)] whitespace-pre-wrap"
                        : msg.isError
                          ? "bg-rose-500/5 border-rose-500/30 text-[var(--text-primary)]"
                          : "bg-[var(--bg-primary)] border-[var(--border-subtle)] text-[var(--text-primary)]"
                    }`}
                  >
                    {msg.role === "user" ? msg.text : <Markdown content={msg.text} />}
                  </div>
                </div>
              ))}

              {aiLoading && (
                <div className="text-sky-400/80 text-xs font-mono py-1 flex items-center gap-1.5" role="status">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping" aria-hidden="true"></span>
                  Thinking...
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendAiMessage();
              }}
              className="p-2 bg-[var(--bg-primary)] border-t border-[var(--border-subtle)] shrink-0 flex items-center gap-1.5 safe-bottom"
            >
              <label htmlFor="ai-input" className="sr-only">Message the AI tutor</label>
              <input
                id="ai-input"
                type="text"
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                placeholder={isAuthenticated ? "Ask about this problem..." : "Sign in to chat with the AI tutor"}
                disabled={!isAuthenticated || aiLoading}
                className="flex-1 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-[6px] px-2.5 py-2 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-sky-500 disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={aiLoading || !aiInput.trim() || !isAuthenticated}
                className="bg-sky-500 hover:bg-sky-400 text-white border-0 rounded-[6px] px-3 py-2 text-xs font-medium disabled:opacity-50"
                aria-label="Send message"
              >
                <Send className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </form>
          </aside>
        )}
      </div>

      {/* submit result modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4" role="dialog" aria-modal="true" aria-labelledby="submit-modal-title">
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-t-[12px] sm:rounded-[8px] w-full max-w-md p-5 space-y-4 animate-fade-in-up max-h-[90dvh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--border-subtle)]">
              <h3 id="submit-modal-title" className="text-sm font-bold text-[var(--text-primary)] font-heading">Submission Result</h3>
              <button type="button" onClick={() => setShowSubmitModal(false)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]" aria-label="Close">
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            {isSubmitting ? (
              <div className="py-8 flex flex-col items-center justify-center gap-2 text-center" role="status">
                <span className="loading loading-spinner loading-md text-[var(--text-secondary)]"></span>
                <p className="text-xs text-[var(--text-secondary)]">Evaluating against all test cases...</p>
              </div>
            ) : submitResult?.submission ? (
              <div className="space-y-3 font-mono text-xs">
                <div className="p-4 rounded-[6px] border border-[var(--border-subtle)] bg-[var(--bg-primary)] text-center space-y-1">
                  <h4 className={`text-xl font-bold ${verdictClass(submitResult.submission.status)}`}>{submitResult.submission.status}</h4>
                  <p className="text-xs text-[var(--text-secondary)] font-sans">
                    {submitResult.submission.status === "Accepted"
                      ? `All ${submitResult.submission.totalTestCases ?? ""} test cases passed.`
                      : submitResult.submission.totalTestCases
                        ? `${submitResult.submission.testCasesPassed ?? 0}/${submitResult.submission.totalTestCases} test cases passed.`
                        : submitResult.submission.errorMessage || "Solution failed."}
                  </p>
                </div>

                {submitResult.submission.status !== "Accepted" && submitResult.submission.failedCase && (
                  <div className="p-3 rounded-[6px] border border-rose-500/30 bg-rose-500/5 space-y-1.5 text-[11px]">
                    <p className="font-bold text-rose-400 font-sans">Failed test case</p>
                    {submitResult.submission.failedCase.error && (
                      <pre className="whitespace-pre-wrap break-words text-rose-400">{submitResult.submission.failedCase.error}</pre>
                    )}
                    <p><span className="text-[var(--text-muted)]">Input:</span> <span className="whitespace-pre-wrap break-words">{submitResult.submission.failedCase.input}</span></p>
                    <p><span className="text-[var(--text-muted)]">Expected:</span> <span className="whitespace-pre-wrap break-words">{submitResult.submission.failedCase.expectedOutput}</span></p>
                    <p><span className="text-[var(--text-muted)]">Got:</span> <span className="whitespace-pre-wrap break-words">{submitResult.submission.failedCase.output || "<empty>"}</span></p>
                  </div>
                )}

                {submitResult.submission.status !== "Accepted" && !submitResult.submission.failedCase && submitResult.submission.errorMessage && (
                  <pre className="p-3 rounded-[6px] border border-rose-500/30 bg-rose-500/5 text-[11px] text-rose-400 whitespace-pre-wrap break-words">{submitResult.submission.errorMessage}</pre>
                )}

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-[6px] p-2.5 text-center">
                    <span className="text-[var(--text-muted)] block text-[10px]">Runtime</span>
                    <span className="text-sm font-bold text-[var(--text-primary)]">{submitResult.submission.runtime ? `${submitResult.submission.runtime} ms` : "—"}</span>
                  </div>
                  <div className="bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-[6px] p-2.5 text-center">
                    <span className="text-[var(--text-muted)] block text-[10px]">Language</span>
                    <span className="text-sm font-bold text-[var(--text-primary)] uppercase">{submitResult.submission.language || language}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 font-sans">
                  <button
                    type="button"
                    onClick={() => {
                      setShowSubmitModal(false);
                      setActiveLeftTab("submissions");
                      setMobileView("problem");
                    }}
                    className="flex-1 bg-[var(--bg-primary)] border border-[var(--border-subtle)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] py-2 rounded-[6px] text-xs font-medium"
                  >
                    View History
                  </button>
                  {submitResult.submission.status === "Accepted" && nextProblem ? (
                    <button
                      type="button"
                      onClick={() => {
                        setShowSubmitModal(false);
                        navigate(`/problem/${nextProblem._id}`);
                      }}
                      className="flex-1 bg-gradient-to-r from-sky-500 to-indigo-600 text-white py-2 rounded-[6px] text-xs font-semibold"
                    >
                      Next Problem →
                    </button>
                  ) : (
                    <button type="button" onClick={() => setShowSubmitModal(false)} className="flex-1 bg-[var(--text-primary)] text-[var(--bg-primary)] py-2 rounded-[6px] text-xs font-semibold">
                      Continue
                    </button>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* pro upgrade modal */}
      {showProModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" role="dialog" aria-modal="true" aria-labelledby="pro-modal-title">
          <div className="bg-[var(--bg-secondary)] border border-sky-500/30 rounded-t-[12px] sm:rounded-xl p-6 max-w-md w-full relative shadow-2xl space-y-5 animate-fade-in-up">
            <button type="button" onClick={() => setShowProModal(false)} className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1 rounded-lg transition-colors" aria-label="Close">
              <X className="w-5 h-5" aria-hidden="true" />
            </button>

            <div className="text-center space-y-2 pt-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center mx-auto shadow-lg shadow-sky-500/20 text-white">
                <Sparkles className="w-6 h-6" aria-hidden="true" />
              </div>
              <h3 id="pro-modal-title" className="text-xl font-bold text-[var(--text-primary)] tracking-tight font-heading">Free Limit Reached</h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Free accounts get {attempts?.runTotal ?? 10} runs and {attempts?.submitTotal ?? 5} submissions per problem. Upgrade to CodeIt Pro for unlimited executions and premium problems.
              </p>
            </div>

            <div className="bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-lg p-4 space-y-3 font-sans text-xs">
              {["Unlimited code runs & submissions", "Premium problem set", "Priority AI tutor access"].map((perk) => (
                <div key={perk} className="flex items-center gap-2.5 text-[var(--text-primary)] font-medium">
                  <Check className="w-4 h-4 text-sky-400 shrink-0" aria-hidden="true" />
                  <span>{perk}</span>
                </div>
              ))}
            </div>

            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setShowProModal(false);
                  toast.success("Upgrade request received! We'll be in touch.");
                }}
                className="w-full bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-sm py-2.5 rounded-lg transition-all shadow-md shadow-sky-500/20 border-0"
              >
                Upgrade to CodeIt Pro
              </button>
              <button type="button" onClick={() => setShowProModal(false)} className="w-full text-[var(--text-muted)] hover:text-[var(--text-primary)] text-xs font-medium py-1.5 bg-transparent border-0">
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
