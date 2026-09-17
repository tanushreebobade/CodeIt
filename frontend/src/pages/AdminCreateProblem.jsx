import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import axiosClient, { getErrorMessage } from "../utils/axiosClient";
import toast from "react-hot-toast";
import {
  ShieldAlert,
  Plus,
  Trash2,
  Send,
  Code2,
  FileText,
  CheckCircle2,
  Tv,
  Layers,
  Edit3,
  Search,
  BookOpen,
  Eye,
  Video,
  X,
  RefreshCw,
  Lock,
  Loader2,
} from "lucide-react";

const AVAILABLE_TAGS = [
  "array",
  "linkedList",
  "tree",
  "graph",
  "dp",
  "string",
  "math",
  "greedy",
  "binarySearch",
  "heap",
  "stack",
  "queue",
  "recursion",
  "backtracking",
  "hashmap",
  "twoPointers",
  "slidingWindow",
];

const LANGUAGES = [
  { value: "cpp", label: "C++" },
  { value: "java", label: "Java" },
  { value: "python", label: "Python" },
  { value: "javascript", label: "JavaScript" },
];

// leetcode-style templates: the execution engine wraps class Solution with a stdin driver
const DEFAULT_START_CODE = {
  cpp: `#include <vector>\n#include <string>\nusing namespace std;\n\nclass Solution {\npublic:\n    // Write your solution here\n};`,
  java: `import java.util.*;\n\nclass Solution {\n    // Write your solution here\n}`,
  python: `class Solution:\n    # Write your solution here\n    pass`,
  javascript: `class Solution {\n    // Write your solution here\n}`,
};

const emptyExample = () => ({ input: "", output: "", explanation: "" });
const emptyCase = () => ({ input: "", output: "" });

const cardClass = "bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-[8px] p-4 sm:p-6 space-y-4";
const cardTitleClass = "font-bold text-sm text-[var(--text-primary)] flex items-center gap-2 font-heading";
const labelClass = "text-xs font-bold text-[var(--text-secondary)] block";
const inputClass = "w-full bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-[6px] px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-sky-500";
const textareaClass = `${inputClass} leading-relaxed`;
const smallButtonClass = "px-2.5 py-1 text-xs bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] hover:bg-[var(--bg-primary)] text-[var(--text-primary)] rounded-[6px] inline-flex items-center gap-1 font-medium transition-colors";

function AdminCreateProblem() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeTab = searchParams.get("tab") === "create" ? "create" : "manage";
  const setActiveTab = (tab) => setSearchParams(tab === "create" ? { tab } : {}, { replace: true });

  // Manage Problems State
  const [problems, setProblems] = useState([]);
  const [loadingProblems, setLoadingProblems] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [deletingId, setDeletingId] = useState(null);

  // Form State
  const [editingProblemId, setEditingProblemId] = useState(null);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [difficulty, setDifficulty] = useState("easy");
  const [description, setDescription] = useState("");
  const [constraints, setConstraints] = useState("");
  const [editorial, setEditorial] = useState("");
  const [selectedTags, setSelectedTags] = useState(["array"]);
  const [companyTagsInput, setCompanyTagsInput] = useState("");
  const [isPremium, setIsPremium] = useState(false);
  const [examples, setExamples] = useState([emptyExample()]);
  const [hints, setHints] = useState([""]);
  const [visibleTestCases, setVisibleTestCases] = useState([emptyCase()]);
  const [hiddenTestCases, setHiddenTestCases] = useState([emptyCase()]);
  const [startCode, setStartCode] = useState({ ...DEFAULT_START_CODE });
  const [referenceSolution, setReferenceSolution] = useState({ cpp: "", java: "", python: "", javascript: "" });
  const [activeCodeLang, setActiveCodeLang] = useState("cpp");

  // Video Solution Modal State
  const [videoModalProblem, setVideoModalProblem] = useState(null);
  const [videoUrlInput, setVideoUrlInput] = useState("");
  const [savingVideo, setSavingVideo] = useState(false);

  const fetchProblems = async () => {
    setLoadingProblems(true);
    try {
      const res = await axiosClient.get("/problem/getAllProblem");
      setProblems(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to load problems list."));
    } finally {
      setLoadingProblems(false);
    }
  };

  useEffect(() => {
    fetchProblems();
  }, []);

  const resetForm = () => {
    setEditingProblemId(null);
    setTitle("");
    setDifficulty("easy");
    setDescription("");
    setConstraints("");
    setEditorial("");
    setSelectedTags(["array"]);
    setCompanyTagsInput("");
    setIsPremium(false);
    setExamples([emptyExample()]);
    setHints([""]);
    setVisibleTestCases([emptyCase()]);
    setHiddenTestCases([emptyCase()]);
    setStartCode({ ...DEFAULT_START_CODE });
    setReferenceSolution({ cpp: "", java: "", python: "", javascript: "" });
    setActiveCodeLang("cpp");
  };

  const handleEditProblem = async (problemId) => {
    try {
      const res = await axiosClient.get(`/problem/problemById/${problemId}`);
      const prob = res.data;
      setEditingProblemId(prob._id);
      setTitle(prob.title || "");
      setDifficulty(prob.difficulty?.toLowerCase() || "easy");
      setDescription(prob.description || "");
      setConstraints(prob.constraints || "");
      setEditorial(prob.editorial || "");
      setSelectedTags(prob.tags?.length ? prob.tags : []);
      setCompanyTagsInput(prob.companyTags ? prob.companyTags.join(", ") : "");
      setIsPremium(Boolean(prob.isPremium));
      setExamples(prob.examples?.length ? prob.examples.map((e) => ({ input: e.input || "", output: e.output || "", explanation: e.explanation || "" })) : [emptyExample()]);
      setHints(prob.hints?.length ? [...prob.hints] : [""]);
      setVisibleTestCases(prob.visibleTestCases?.length ? prob.visibleTestCases.map((t) => ({ input: t.input || "", output: t.output || "" })) : [emptyCase()]);
      setHiddenTestCases(prob.hiddenTestCases?.length ? prob.hiddenTestCases.map((t) => ({ input: t.input || "", output: t.output || "" })) : [emptyCase()]);

      const starters = { cpp: "", java: "", python: "", javascript: "" };
      (prob.startCode || []).forEach((s) => {
        if (s.language in starters) starters[s.language] = s.initialCode || "";
      });
      setStartCode(starters);

      const refs = { cpp: "", java: "", python: "", javascript: "" };
      (prob.referenceSolution || []).forEach((s) => {
        if (s.language in refs) refs[s.language] = s.completeCode || "";
      });
      setReferenceSolution(refs);

      setActiveTab("create");
      window.scrollTo({ top: 0, behavior: "smooth" });
      toast.success(`Loaded "${prob.title}" into the editor.`);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to load problem details."));
    }
  };

  const handleDeleteProblem = (problemId, problemTitle) => {
    toast(
      (t) => (
        <div className="flex items-center gap-3 text-xs">
          <span>Delete "{problemTitle}"? This cannot be undone.</span>
          <button
            type="button"
            className="px-2.5 py-1 rounded-[4px] bg-rose-500 text-white font-semibold"
            onClick={async () => {
              toast.dismiss(t.id);
              setDeletingId(problemId);
              try {
                await axiosClient.delete(`/problem/delete/${problemId}`);
                toast.success("Problem deleted.");
                setProblems((prev) => prev.filter((p) => p._id !== problemId));
              } catch (err) {
                toast.error(getErrorMessage(err, "Failed to delete problem."));
              } finally {
                setDeletingId(null);
              }
            }}
          >
            Delete
          </button>
          <button type="button" className="px-2 py-1 rounded-[4px] border border-[var(--border-subtle)]" onClick={() => toast.dismiss(t.id)}>
            Cancel
          </button>
        </div>
      ),
      { id: `delete-${problemId}`, duration: 8000 }
    );
  };

  const openVideoModal = (problem) => {
    setVideoModalProblem(problem);
    setVideoUrlInput(problem.secureUrl || "");
  };

  const handleSaveVideoMetadata = async () => {
    const url = videoUrlInput.trim();
    if (!/^https?:\/\//i.test(url)) {
      toast.error("Please enter a valid http(s) video URL.");
      return;
    }
    setSavingVideo(true);
    try {
      await axiosClient.post("/video/save", { problemId: videoModalProblem._id, secureUrl: url });
      toast.success("Video solution attached.");
      setVideoModalProblem(null);
      fetchProblems();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to save video."));
    } finally {
      setSavingVideo(false);
    }
  };

  const handleRemoveVideo = async () => {
    setSavingVideo(true);
    try {
      await axiosClient.delete(`/video/delete/${videoModalProblem._id}`);
      toast.success("Video solution removed.");
      setVideoModalProblem(null);
      fetchProblems();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to remove video."));
    } finally {
      setSavingVideo(false);
    }
  };

  const toggleTag = (tag) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const updateAt = (setter) => (idx, field, value) =>
    setter((prev) => prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item)));
  const removeAt = (setter) => (idx) => setter((prev) => prev.filter((_, i) => i !== idx));

  const updateExample = updateAt(setExamples);
  const updateVisible = updateAt(setVisibleTestCases);
  const updateHidden = updateAt(setHiddenTestCases);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !description.trim()) {
      toast.error("Please fill in the title and description.");
      return;
    }
    const cleanVisible = visibleTestCases.filter((tc) => tc.input.trim() || tc.output.trim());
    const cleanHidden = hiddenTestCases.filter((tc) => tc.input.trim() || tc.output.trim());
    if (cleanVisible.length === 0 || cleanHidden.length === 0) {
      toast.error("Add at least one visible and one hidden test case.");
      return;
    }
    if ([...cleanVisible, ...cleanHidden].some((tc) => !tc.output.trim())) {
      toast.error("Every test case needs an expected output.");
      return;
    }

    setSaving(true);
    const payload = {
      title: title.trim(),
      difficulty,
      description: description.trim(),
      constraints,
      editorial,
      tags: selectedTags,
      companyTags: companyTagsInput.split(",").map((c) => c.trim().toLowerCase()).filter(Boolean),
      examples: examples.filter((ex) => ex.input.trim() || ex.output.trim()),
      hints: hints.map((h) => h.trim()).filter(Boolean),
      visibleTestCases: cleanVisible,
      hiddenTestCases: cleanHidden,
      startCode: LANGUAGES.filter((l) => startCode[l.value]?.trim()).map((l) => ({ language: l.value, initialCode: startCode[l.value] })),
      referenceSolution: LANGUAGES.filter((l) => referenceSolution[l.value]?.trim()).map((l) => ({ language: l.value, completeCode: referenceSolution[l.value] })),
      isPremium,
    };

    const hasReference = payload.referenceSolution.length > 0;
    const toastId = hasReference ? toast.loading("Verifying reference solution against all test cases...") : null;

    try {
      if (editingProblemId) {
        await axiosClient.put(`/problem/update/${editingProblemId}`, payload);
        toast.success("Problem updated successfully!", { id: toastId || undefined });
      } else {
        await axiosClient.post("/problem/create", payload);
        toast.success("Problem published successfully!", { id: toastId || undefined });
      }
      resetForm();
      fetchProblems();
      setActiveTab("manage");
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to save problem"), { id: toastId || undefined, duration: 8000 });
    } finally {
      setSaving(false);
    }
  };

  const filteredProblems = problems.filter((prob) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = prob.title?.toLowerCase().includes(q) || prob.tags?.some((t) => t.toLowerCase().includes(q));
    if (!matchesSearch) return false;
    if (selectedDifficulty !== "all" && prob.difficulty?.toLowerCase() !== selectedDifficulty) return false;
    return true;
  });

  const counts = {
    easy: problems.filter((p) => p.difficulty?.toLowerCase() === "easy").length,
    medium: problems.filter((p) => p.difficulty?.toLowerCase() === "medium").length,
    hard: problems.filter((p) => p.difficulty?.toLowerCase() === "hard").length,
  };

  const renderCaseList = (list, update, remove, add, label, Icon, placeholderInput) => (
    <div className={cardClass}>
      <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
        <h3 className={cardTitleClass}>
          <Icon className="w-4 h-4 text-[var(--text-secondary)]" aria-hidden="true" />
          {label}
        </h3>
        <button type="button" onClick={add} className={smallButtonClass}>
          <Plus className="w-3.5 h-3.5" aria-hidden="true" /> Add
        </button>
      </div>

      {list.map((tc, idx) => (
        <div key={idx} className="p-3 bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-[6px] space-y-2 text-xs font-mono">
          <div className="flex justify-between items-center text-[var(--text-muted)] font-bold">
            <span>Case {idx + 1}</span>
            {list.length > 1 && (
              <button type="button" onClick={() => remove(idx)} className="text-[var(--text-muted)] hover:text-red-400 transition-colors" aria-label={`Remove case ${idx + 1}`}>
                <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            )}
          </div>
          <textarea
            placeholder={placeholderInput}
            rows={3}
            value={tc.input}
            onChange={(e) => update(idx, "input", e.target.value)}
            spellCheck={false}
            aria-label={`${label} ${idx + 1} input`}
            className={`${textareaClass} bg-[var(--bg-secondary)] font-mono`}
          />
          <textarea
            placeholder="Expected output"
            rows={1}
            value={tc.output}
            onChange={(e) => update(idx, "output", e.target.value)}
            spellCheck={false}
            aria-label={`${label} ${idx + 1} expected output`}
            className={`${textareaClass} bg-[var(--bg-secondary)] font-mono`}
          />
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-dvh bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans flex flex-col justify-between transition-colors duration-200">
      <div>
        <Navbar />

        <main className="max-w-6xl mx-auto px-4 lg:px-8 py-6 sm:py-8 w-full space-y-5">

          {/* header & stats */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-[8px] p-5 sm:p-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[6px] bg-[var(--bg-primary)] border border-[var(--border-subtle)] text-[var(--text-secondary)] text-xs font-semibold mb-2">
                <ShieldAlert className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Admin Studio</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-[var(--text-primary)] tracking-tight font-heading">
                Problem Management & Authoring
              </h1>
              <p className="text-[var(--text-secondary)] text-xs mt-1">
                Manage, edit, delete, and author DSA challenges for CodeIt.
              </p>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {[
                ["Total", problems.length],
                ["Easy", counts.easy],
                ["Medium", counts.medium],
                ["Hard", counts.hard],
              ].map(([label, value]) => (
                <div key={label} className="bg-[var(--bg-primary)] border border-[var(--border-subtle)] px-2 sm:px-3 py-2 rounded-[6px] text-center min-w-0">
                  <span className="block text-sm font-bold text-[var(--text-primary)] font-mono">{value}</span>
                  <span className="text-[10px] text-[var(--text-muted)] font-medium uppercase">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* tab navigation */}
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-[8px] p-1.5 flex items-center gap-2 text-xs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "manage"}
              onClick={() => setActiveTab("manage")}
              className={`flex-1 py-2 rounded-[6px] font-semibold transition-colors flex items-center justify-center gap-2 ${
                activeTab === "manage"
                  ? "bg-[var(--bg-primary)] text-[var(--text-primary)] border border-[var(--border-subtle)]"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Manage ({problems.length})</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "create"}
              onClick={() => {
                if (activeTab !== "create") resetForm();
                setActiveTab("create");
              }}
              className={`flex-1 py-2 rounded-[6px] font-semibold transition-colors flex items-center justify-center gap-2 ${
                activeTab === "create"
                  ? "bg-[var(--bg-primary)] text-[var(--text-primary)] border border-[var(--border-subtle)]"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              {editingProblemId ? <Edit3 className="w-3.5 h-3.5" aria-hidden="true" /> : <Plus className="w-3.5 h-3.5" aria-hidden="true" />}
              <span>{editingProblemId ? "Edit Problem" : "Create Problem"}</span>
            </button>
          </div>

          {/* manage tab */}
          {activeTab === "manage" && (
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-[8px] space-y-4 p-4">

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative w-full sm:w-72">
                  <label htmlFor="admin-search" className="sr-only">Search problems</label>
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" aria-hidden="true" />
                  <input
                    id="admin-search"
                    type="search"
                    placeholder="Search problem title or tag..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`${inputClass} pl-9`}
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <label htmlFor="admin-difficulty" className="sr-only">Difficulty filter</label>
                  <select
                    id="admin-difficulty"
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                    className={`${inputClass} flex-1 sm:w-40 cursor-pointer`}
                  >
                    <option value="all">All Difficulties</option>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>

                  <button
                    type="button"
                    onClick={fetchProblems}
                    className="p-2 rounded-[6px] bg-[var(--bg-primary)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                    title="Refresh List"
                    aria-label="Refresh list"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loadingProblems ? "animate-spin" : ""}`} aria-hidden="true" />
                  </button>
                </div>
              </div>

              {loadingProblems ? (
                <div className="py-12 text-center text-xs text-[var(--text-muted)] flex flex-col items-center justify-center gap-2" role="status">
                  <span className="loading loading-spinner loading-md text-[var(--text-secondary)]"></span>
                  <span>Loading problems...</span>
                </div>
              ) : filteredProblems.length === 0 ? (
                <div className="py-12 text-center text-xs text-[var(--text-muted)]">No problems found matching criteria.</div>
              ) : (
                <div className="overflow-x-auto border border-[var(--border-subtle)] rounded-[6px]">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-primary)] text-[var(--text-secondary)] font-semibold">
                        <th scope="col" className="py-2.5 px-3 sm:px-4">Problem</th>
                        <th scope="col" className="py-2.5 px-3 sm:px-4">Difficulty</th>
                        <th scope="col" className="py-2.5 px-4 hidden md:table-cell">Tags</th>
                        <th scope="col" className="py-2.5 px-4 hidden sm:table-cell">Video</th>
                        <th scope="col" className="py-2.5 px-3 sm:px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-subtle)] text-[var(--text-primary)]">
                      {filteredProblems.map((prob) => (
                        <tr key={prob._id} className="hover:bg-[var(--bg-primary)] transition-colors">
                          <td className="py-3 px-3 sm:px-4 font-semibold">
                            <span className="inline-flex items-center gap-2 flex-wrap">
                              {prob.title}
                              {prob.isPremium && (
                                <span className="inline-flex items-center gap-1 text-amber-400 bg-amber-400/10 border border-amber-400/30 px-1.5 py-0.5 rounded text-[10px] font-bold">
                                  <Lock className="w-3 h-3" aria-hidden="true" /> PRO
                                </span>
                              )}
                            </span>
                            <span className="block text-[10px] text-[var(--text-muted)] font-mono font-normal mt-0.5">
                              {prob.acceptedCount || 0}/{prob.submissionCount || 0} accepted
                            </span>
                          </td>

                          <td className="py-3 px-3 sm:px-4 capitalize">
                            <span className={`px-2 py-0.5 rounded-[4px] text-[10px] font-semibold ${prob.difficulty === "easy" ? "badge-easy" : prob.difficulty === "medium" ? "badge-medium" : "badge-hard"}`}>
                              {prob.difficulty}
                            </span>
                          </td>

                          <td className="py-3 px-4 hidden md:table-cell">
                            <div className="flex flex-wrap gap-1">
                              {prob.tags?.slice(0, 3).map((t, idx) => (
                                <span key={idx} className="bg-sky-500/10 text-sky-400 border border-sky-500/20 px-2 py-0.5 rounded-[4px] text-[11px] font-mono">
                                  {t}
                                </span>
                              ))}
                            </div>
                          </td>

                          <td className="py-3 px-4 hidden sm:table-cell text-xs">
                            {prob.hasVideo ? (
                              <button type="button" onClick={() => openVideoModal(prob)} className="text-emerald-500 font-medium inline-flex items-center gap-1 hover:underline">
                                <Tv className="w-3.5 h-3.5" aria-hidden="true" /> Attached
                              </button>
                            ) : (
                              <button type="button" onClick={() => openVideoModal(prob)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] underline inline-flex items-center gap-1 text-[11px]">
                                <Plus className="w-3 h-3" aria-hidden="true" /> Add video
                              </button>
                            )}
                          </td>

                          <td className="py-3 px-3 sm:px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button type="button" onClick={() => navigate(`/problem/${prob._id}`)} className="p-1.5 rounded-[4px] bg-[var(--bg-primary)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]" title="Open workspace" aria-label={`Open ${prob.title}`}>
                                <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                              </button>
                              <button type="button" onClick={() => handleEditProblem(prob._id)} className="p-1.5 rounded-[4px] bg-[var(--bg-primary)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]" title="Edit problem" aria-label={`Edit ${prob.title}`}>
                                <Edit3 className="w-3.5 h-3.5" aria-hidden="true" />
                              </button>
                              <button type="button" onClick={() => openVideoModal(prob)} className="p-1.5 rounded-[4px] bg-[var(--bg-primary)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] sm:hidden" title="Video solution" aria-label={`Video for ${prob.title}`}>
                                <Video className="w-3.5 h-3.5" aria-hidden="true" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteProblem(prob._id, prob.title)}
                                disabled={deletingId === prob._id}
                                className="p-1.5 rounded-[4px] bg-[var(--bg-primary)] border border-[var(--border-subtle)] text-red-400 hover:text-red-300 disabled:opacity-50"
                                title="Delete problem"
                                aria-label={`Delete ${prob.title}`}
                              >
                                {deletingId === prob._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" /> : <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* create / edit tab */}
          {activeTab === "create" && (
            <form onSubmit={handleSubmit} className="space-y-5">

              {editingProblemId && (
                <div className="bg-sky-500/10 border border-sky-500/30 p-3 rounded-[6px] flex items-center justify-between gap-3 text-xs text-[var(--text-primary)]">
                  <span>Editing: <strong>{title}</strong></span>
                  <button type="button" onClick={resetForm} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] underline whitespace-nowrap">
                    Cancel editing
                  </button>
                </div>
              )}

              {/* overview */}
              <div className={cardClass}>
                <h3 className={`${cardTitleClass} border-b border-[var(--border-subtle)] pb-3`}>
                  <FileText className="w-4 h-4 text-[var(--text-secondary)]" aria-hidden="true" />
                  Problem Overview
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  <div className="md:col-span-7 space-y-1.5">
                    <label htmlFor="p-title" className={labelClass}>Problem Title *</label>
                    <input id="p-title" type="text" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. 1. Two Sum" className={`${inputClass} font-semibold`} />
                  </div>
                  <div className="md:col-span-3 space-y-1.5">
                    <label htmlFor="p-difficulty" className={labelClass}>Difficulty *</label>
                    <select id="p-difficulty" value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className={`${inputClass} font-semibold cursor-pointer`}>
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                  <div className="md:col-span-2 space-y-1.5">
                    <span className={labelClass}>Access</span>
                    <label className="flex items-center gap-2 text-xs cursor-pointer h-[34px]">
                      <input type="checkbox" checked={isPremium} onChange={(e) => setIsPremium(e.target.checked)} className="checkbox checkbox-xs" />
                      <span className="inline-flex items-center gap-1"><Lock className="w-3 h-3 text-amber-400" aria-hidden="true" /> Premium</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className={labelClass}>Category Tags</span>
                  <div className="flex flex-wrap gap-1.5" role="group" aria-label="Category tags">
                    {AVAILABLE_TAGS.map((tag) => (
                      <button
                        type="button"
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        aria-pressed={selectedTags.includes(tag)}
                        className={`px-2.5 py-1 rounded-[4px] text-xs font-mono transition-all ${
                          selectedTags.includes(tag)
                            ? "bg-[var(--text-primary)] text-[var(--bg-primary)] font-bold"
                            : "bg-[var(--bg-primary)] text-[var(--text-secondary)] border border-[var(--border-subtle)] hover:text-[var(--text-primary)]"
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="p-companies" className={labelClass}>Company Tags (comma separated)</label>
                  <input id="p-companies" type="text" value={companyTagsInput} onChange={(e) => setCompanyTagsInput(e.target.value)} placeholder="Google, Amazon, Meta, Microsoft" className={inputClass} />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="p-description" className={labelClass}>Problem Description * <span className="font-normal text-[var(--text-muted)]">(markdown supported)</span></label>
                  <textarea id="p-description" required rows={7} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target..." className={textareaClass} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="p-constraints" className={labelClass}>Constraints</label>
                    <textarea id="p-constraints" rows={4} value={constraints} onChange={(e) => setConstraints(e.target.value)} placeholder={"2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9"} className={`${textareaClass} font-mono`} />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="p-editorial" className={labelClass}>Editorial <span className="font-normal text-[var(--text-muted)]">(markdown supported)</span></label>
                    <textarea id="p-editorial" rows={4} value={editorial} onChange={(e) => setEditorial(e.target.value)} placeholder="Explain the optimal approach and its complexity..." className={textareaClass} />
                  </div>
                </div>
              </div>

              {/* examples & hints */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className={cardClass}>
                  <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
                    <h3 className={cardTitleClass}>
                      <Layers className="w-4 h-4 text-[var(--text-secondary)]" aria-hidden="true" />
                      Examples
                    </h3>
                    <button type="button" onClick={() => setExamples((p) => [...p, emptyExample()])} className={smallButtonClass}>
                      <Plus className="w-3.5 h-3.5" aria-hidden="true" /> Add
                    </button>
                  </div>

                  {examples.map((ex, idx) => (
                    <div key={idx} className="p-3 bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-[6px] space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-[var(--text-secondary)]">
                        <span>Example {idx + 1}</span>
                        {examples.length > 1 && (
                          <button type="button" onClick={() => removeAt(setExamples)(idx)} className="text-[var(--text-muted)] hover:text-red-400 transition-colors" aria-label={`Remove example ${idx + 1}`}>
                            <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                          </button>
                        )}
                      </div>
                      <input type="text" placeholder="Input (e.g. nums = [2,7,11,15], target = 9)" value={ex.input} onChange={(e) => updateExample(idx, "input", e.target.value)} aria-label={`Example ${idx + 1} input`} className={`${inputClass} bg-[var(--bg-secondary)]`} />
                      <input type="text" placeholder="Output (e.g. 0 1)" value={ex.output} onChange={(e) => updateExample(idx, "output", e.target.value)} aria-label={`Example ${idx + 1} output`} className={`${inputClass} bg-[var(--bg-secondary)]`} />
                      <input type="text" placeholder="Explanation (optional)" value={ex.explanation} onChange={(e) => updateExample(idx, "explanation", e.target.value)} aria-label={`Example ${idx + 1} explanation`} className={`${inputClass} bg-[var(--bg-secondary)]`} />
                    </div>
                  ))}
                </div>

                <div className={cardClass}>
                  <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
                    <h3 className={cardTitleClass}>
                      <CheckCircle2 className="w-4 h-4 text-[var(--text-secondary)]" aria-hidden="true" />
                      Hints
                    </h3>
                    <button type="button" onClick={() => setHints((p) => [...p, ""])} className={smallButtonClass}>
                      <Plus className="w-3.5 h-3.5" aria-hidden="true" /> Add
                    </button>
                  </div>
                  <p className="text-[11px] text-[var(--text-muted)]">Hints are revealed one at a time in the workspace.</p>
                  {hints.map((hint, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="text-xs font-mono text-[var(--text-muted)] pt-2 w-5 shrink-0">{idx + 1}.</span>
                      <textarea rows={2} value={hint} onChange={(e) => setHints((prev) => prev.map((h, i) => (i === idx ? e.target.value : h)))} placeholder="Think about which data structure gives O(1) lookups..." aria-label={`Hint ${idx + 1}`} className={textareaClass} />
                      {hints.length > 1 && (
                        <button type="button" onClick={() => setHints((prev) => prev.filter((_, i) => i !== idx))} className="text-[var(--text-muted)] hover:text-red-400 pt-2" aria-label={`Remove hint ${idx + 1}`}>
                          <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* test cases */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {renderCaseList(visibleTestCases, updateVisible, removeAt(setVisibleTestCases), () => setVisibleTestCases((p) => [...p, emptyCase()]), "Visible Test Cases", CheckCircle2, "Input (stdin), e.g.\n4\n2 7 11 15\n9")}
                {renderCaseList(hiddenTestCases, updateHidden, removeAt(setHiddenTestCases), () => setHiddenTestCases((p) => [...p, emptyCase()]), "Hidden Test Cases", ShieldAlert, "Input (stdin)")}
              </div>

              {/* code templates */}
              <div className={cardClass}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-3">
                  <h3 className={cardTitleClass}>
                    <Code2 className="w-4 h-4 text-[var(--text-secondary)]" aria-hidden="true" />
                    Code Templates
                  </h3>
                  <div className="flex items-center gap-1 rounded-[6px] border border-[var(--border-subtle)] p-0.5 bg-[var(--bg-primary)]" role="tablist" aria-label="Template language">
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang.value}
                        type="button"
                        role="tab"
                        aria-selected={activeCodeLang === lang.value}
                        onClick={() => setActiveCodeLang(lang.value)}
                        className={`px-2.5 py-1 rounded-[4px] text-xs font-semibold ${
                          activeCodeLang === lang.value
                            ? "bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-subtle)]"
                            : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                        }`}
                      >
                        {lang.label}
                        {referenceSolution[lang.value]?.trim() && <span className="ml-1 text-emerald-500" aria-label="has reference solution">•</span>}
                      </button>
                    ))}
                  </div>
                </div>

                <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                  Starter code is what users see in the editor. Write a <code className="font-mono">class Solution</code> with a single public method: the engine parses stdin (integers, lists and strings) into the method arguments and prints the return value. Full programs that read stdin directly also work.
                </p>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor={`start-${activeCodeLang}`} className={labelClass}>Starter code ({LANGUAGES.find((l) => l.value === activeCodeLang)?.label})</label>
                    <textarea
                      id={`start-${activeCodeLang}`}
                      rows={12}
                      value={startCode[activeCodeLang] || ""}
                      onChange={(e) => setStartCode((prev) => ({ ...prev, [activeCodeLang]: e.target.value }))}
                      spellCheck={false}
                      className={`${textareaClass} font-mono text-[11px]`}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor={`ref-${activeCodeLang}`} className={labelClass}>
                      Reference solution <span className="font-normal text-[var(--text-muted)]">(optional, verified against all test cases on save)</span>
                    </label>
                    <textarea
                      id={`ref-${activeCodeLang}`}
                      rows={12}
                      value={referenceSolution[activeCodeLang] || ""}
                      onChange={(e) => setReferenceSolution((prev) => ({ ...prev, [activeCodeLang]: e.target.value }))}
                      placeholder="Leave empty to skip verification"
                      spellCheck={false}
                      className={`${textareaClass} font-mono text-[11px]`}
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setActiveTab("manage");
                  }}
                  className="px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-[6px] text-xs font-medium hover:bg-[var(--bg-tertiary)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white rounded-[6px] text-xs font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
                >
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" /> : <Send className="w-3.5 h-3.5" aria-hidden="true" />}
                  <span>{saving ? "Saving..." : editingProblemId ? "Update Problem" : "Publish Problem"}</span>
                </button>
              </div>
            </form>
          )}

        </main>
      </div>

      {/* video modal */}
      {videoModalProblem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4" role="dialog" aria-modal="true" aria-labelledby="video-modal-title">
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-t-[12px] sm:rounded-[8px] w-full max-w-md p-5 space-y-4 text-xs animate-fade-in-up">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2">
              <h3 id="video-modal-title" className="font-bold text-sm text-[var(--text-primary)] font-heading flex items-center gap-2">
                <Tv className="w-4 h-4" aria-hidden="true" />
                <span>Video Solution</span>
              </h3>
              <button type="button" onClick={() => setVideoModalProblem(null)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]" aria-label="Close">
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            <p className="text-[var(--text-secondary)]">
              Attach a YouTube link or a direct video URL (MP4 / Cloudinary) for <strong>{videoModalProblem.title}</strong>.
              {videoModalProblem.hasVideo && " A video is currently attached; saving replaces it."}
            </p>

            <div className="space-y-1.5">
              <label htmlFor="video-url" className={labelClass}>Video URL *</label>
              <input id="video-url" type="url" value={videoUrlInput} onChange={(e) => setVideoUrlInput(e.target.value)} placeholder="https://www.youtube.com/watch?v=..." className={inputClass} />
            </div>

            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center sm:justify-between gap-2 pt-2">
              {videoModalProblem.hasVideo ? (
                <button type="button" onClick={handleRemoveVideo} disabled={savingVideo} className="px-3 py-2 rounded-[6px] border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 font-medium disabled:opacity-50">
                  Remove video
                </button>
              ) : (
                <span />
              )}
              <div className="flex items-center gap-2 justify-end">
                <button type="button" onClick={() => setVideoModalProblem(null)} className="px-3 py-2 rounded-[6px] bg-[var(--bg-primary)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium">
                  Cancel
                </button>
                <button type="button" onClick={handleSaveVideoMetadata} disabled={savingVideo} className="px-4 py-2 rounded-[6px] bg-[var(--text-primary)] text-[var(--bg-primary)] font-semibold disabled:opacity-60">
                  {savingVideo ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default AdminCreateProblem;
