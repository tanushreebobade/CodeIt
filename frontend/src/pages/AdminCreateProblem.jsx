import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import axiosClient from "../utils/axiosClient";
import toast from "react-hot-toast";
import {
  ShieldAlert,
  Plus,
  Trash2,
  Send,
  Code2,
  FileText,
  Lightbulb,
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

function AdminCreateProblem() {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  // Active View Tab: 'manage', 'create', 'videos'
  const [activeTab, setActiveTab] = useState("manage");

  // Manage Problems State
  const [problems, setProblems] = useState([]);
  const [loadingProblems, setLoadingProblems] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");

  // Form State
  const [editingProblemId, setEditingProblemId] = useState(null);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [difficulty, setDifficulty] = useState("easy");
  const [description, setDescription] = useState("");
  const [constraints, setConstraints] = useState("");
  const [editorial, setEditorial] = useState("");
  const [selectedTags, setSelectedTags] = useState(["array"]);
  const [companyTagsInput, setCompanyTagsInput] = useState("Google, Amazon, Microsoft");

  // Examples
  const [examples, setExamples] = useState([
    { input: "nums = [2,7,11,15], target = 9", output: "[0,1]", explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]." },
  ]);

  // Hints
  const [hints, setHints] = useState(["Try using a hash table to store indices of visited numbers."]);

  // Visible Test Cases
  const [visibleTestCases, setVisibleTestCases] = useState([
    { input: "2 7 11 15\n9", output: "0 1" },
  ]);

  // Hidden Test Cases
  const [hiddenTestCases, setHiddenTestCases] = useState([
    { input: "3 2 4\n6", output: "1 2" },
    { input: "3 3\n6", output: "0 1" },
  ]);

  // Starter Code
  const [startCode, setStartCode] = useState([
    {
      language: "javascript",
      initialCode: `function solve(input) {\n    // Enter your code here\n}`,
    },
    {
      language: "python",
      initialCode: `def solve():\n    # Enter your code here\n    pass\n\nif __name__ == '__main__':\n    solve()`,
    },
    {
      language: "cpp",
      initialCode: `#include <iostream>\nusing namespace std;\n\nint main() {\n    // Enter your code here\n    return 0;\n}`,
    },
    {
      language: "java",
      initialCode: `import java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        // Enter your code here\n    }\n}`,
    },
  ]);

  // Reference Solution
  const [referenceSolution, setReferenceSolution] = useState([
    {
      language: "javascript",
      completeCode: `const fs = require('fs');\nconst input = fs.readFileSync('/dev/stdin', 'utf-8').trim().split('\\n');\nif (input.length >= 2) {\n    const nums = input[0].split(' ').map(Number);\n    const target = Number(input[1]);\n    const map = new Map();\n    for (let i = 0; i < nums.length; i++) {\n        const comp = target - nums[i];\n        if (map.has(comp)) {\n            console.log(map.get(comp) + ' ' + i);\n            process.exit(0);\n        }\n        map.set(nums[i], i);\n    }\n}`,
    },
  ]);

  // Video Solution Modal State
  const [videoModalProblem, setVideoModalProblem] = useState(null);
  const [videoUrlInput, setVideoUrlInput] = useState("");
  const [savingVideo, setSavingVideo] = useState(false);

  // Fetch All Problems for Manage Tab
  const fetchProblems = async () => {
    setLoadingProblems(true);
    try {
      const res = await axiosClient.get("/problem/getAllProblem");
      if (res.data && Array.isArray(res.data)) {
        setProblems(res.data);
      }
    } catch (err) {
      console.error("Error fetching problems:", err);
      toast.error("Failed to load problems list.");
    } finally {
      setLoadingProblems(false);
    }
  };

  useEffect(() => {
    fetchProblems();
  }, []);

  // Reset form to blank defaults
  const resetForm = () => {
    setEditingProblemId(null);
    setTitle("");
    setDifficulty("easy");
    setDescription("");
    setConstraints("");
    setEditorial("");
    setSelectedTags(["array"]);
    setCompanyTagsInput("Google, Amazon, Microsoft");
    setExamples([
      { input: "nums = [2,7,11,15], target = 9", output: "[0,1]", explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]." },
    ]);
    setHints(["Try using a hash table to store indices of visited numbers."]);
    setVisibleTestCases([{ input: "2 7 11 15\n9", output: "0 1" }]);
    setHiddenTestCases([
      { input: "3 2 4\n6", output: "1 2" },
      { input: "3 3\n6", output: "0 1" },
    ]);
  };

  // Populate Form for Editing
  const handleEditProblem = async (problemId) => {
    try {
      const res = await axiosClient.get(`/problem/problemById/${problemId}`);
      if (res.data) {
        const prob = res.data;
        setEditingProblemId(prob._id);
        setTitle(prob.title || "");
        setDifficulty(prob.difficulty?.toLowerCase() || "easy");
        setDescription(prob.description || "");
        setConstraints(prob.constraints || "");
        setEditorial(prob.editorial || "");
        setSelectedTags(prob.tags && prob.tags.length > 0 ? prob.tags : ["array"]);
        setCompanyTagsInput(prob.companyTags ? prob.companyTags.join(", ") : "");
        setExamples(prob.examples && prob.examples.length > 0 ? prob.examples : []);
        setHints(prob.hints && prob.hints.length > 0 ? prob.hints : []);
        setVisibleTestCases(prob.visibleTestCases && prob.visibleTestCases.length > 0 ? prob.visibleTestCases : []);
        setHiddenTestCases(prob.hiddenTestCases && prob.hiddenTestCases.length > 0 ? prob.hiddenTestCases : []);
        if (prob.startCode) setStartCode(prob.startCode);
        if (prob.referenceSolution) setReferenceSolution(prob.referenceSolution);

        setActiveTab("create");
        toast.success(`Loaded "${prob.title}" into editor.`);
      }
    } catch (err) {
      console.error("Failed to load problem for edit:", err);
      toast.error("Failed to load problem details.");
    }
  };

  // Delete Problem Handler
  const handleDeleteProblem = async (problemId, problemTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${problemTitle}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await axiosClient.delete(`/problem/delete/${problemId}`);
      toast.success("Problem deleted successfully.");
      setProblems((prev) => prev.filter((p) => p._id !== problemId));
    } catch (err) {
      console.error("Delete error:", err);
      const errMsg = err.response?.data?.message || err.response?.data || "Failed to delete problem.";
      toast.error(typeof errMsg === "string" ? errMsg : "Delete failed.");
    }
  };

  // Open Video Solution Modal
  const openVideoModal = (problem) => {
    setVideoModalProblem(problem);
    setVideoUrlInput(problem.secureUrl || "");
  };

  // Save Video Solution Metadata
  const handleSaveVideoMetadata = async () => {
    if (!videoUrlInput.trim()) {
      toast.error("Please enter a valid video URL.");
      return;
    }

    setSavingVideo(true);
    try {
      await axiosClient.post("/video/save", {
        problemId: videoModalProblem._id,
        secureUrl: videoUrlInput.trim(),
        duration: 300,
      });
      toast.success("Video solution URL saved successfully!");
      setVideoModalProblem(null);
      fetchProblems();
    } catch (err) {
      console.error("Video save error:", err);
      toast.error("Failed to save video metadata.");
    } finally {
      setSavingVideo(false);
    }
  };

  // Tag toggle
  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  // Add/Remove helpers
  const addExample = () => setExamples([...examples, { input: "", output: "", explanation: "" }]);
  const removeExample = (idx) => setExamples(examples.filter((_, i) => i !== idx));

  const addHint = () => setHints([...hints, ""]);
  const removeHint = (idx) => setHints(hints.filter((_, i) => i !== idx));

  const addVisibleTestCase = () => setVisibleTestCases([...visibleTestCases, { input: "", output: "" }]);
  const removeVisibleTestCase = (idx) => setVisibleTestCases(visibleTestCases.filter((_, i) => i !== idx));

  const addHiddenTestCase = () => setHiddenTestCases([...hiddenTestCases, { input: "", output: "" }]);
  const removeHiddenTestCase = (idx) => setHiddenTestCases(hiddenTestCases.filter((_, i) => i !== idx));

  // Submit Handler (Create or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !description.trim()) {
      toast.error("Please fill in Title and Description.");
      return;
    }

    if (visibleTestCases.length === 0 || hiddenTestCases.length === 0) {
      toast.error("Please add at least one visible and one hidden test case.");
      return;
    }

    setSaving(true);
    const companyTags = companyTagsInput
      .split(",")
      .map((c) => c.trim().toLowerCase())
      .filter(Boolean);

    const payload = {
      title,
      difficulty,
      description,
      constraints,
      editorial,
      tags: selectedTags,
      companyTags,
      examples,
      hints,
      visibleTestCases,
      hiddenTestCases,
      startCode,
      referenceSolution,
    };

    try {
      if (editingProblemId) {
        await axiosClient.put(`/problem/update/${editingProblemId}`, payload);
        toast.success("Problem updated successfully!");
      } else {
        await axiosClient.post("/problem/create", payload);
        toast.success("Problem published successfully!");
      }

      resetForm();
      fetchProblems();
      setActiveTab("manage");
    } catch (err) {
      console.error("Save problem error:", err);
      const errMsg = err.response?.data?.message || err.response?.data || "Failed to save problem";
      toast.error(typeof errMsg === "string" ? errMsg : "Failed to save problem");
    } finally {
      setSaving(false);
    }
  };

  // Filtered problems list
  const filteredProblems = problems.filter((prob) => {
    const matchesSearch =
      prob.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prob.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (selectedDifficulty !== "all") {
      if (prob.difficulty?.toLowerCase() !== selectedDifficulty.toLowerCase()) {
        return false;
      }
    }
    return true;
  });

  // Metrics
  const easyCount = problems.filter((p) => p.difficulty?.toLowerCase() === "easy").length;
  const mediumCount = problems.filter((p) => p.difficulty?.toLowerCase() === "medium").length;
  const hardCount = problems.filter((p) => p.difficulty?.toLowerCase() === "hard").length;

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans flex flex-col justify-between transition-colors duration-200">
      <div>
        <Navbar />

        <main className="max-w-6xl mx-auto px-4 lg:px-8 py-8 w-full space-y-6">
          
          {/* HEADER & TOP STATS */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-[8px] p-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[6px] bg-[var(--bg-primary)] border border-[var(--border-subtle)] text-[var(--text-secondary)] text-xs font-semibold mb-2">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Admin Studio</span>
              </div>
              <h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight font-heading">
                Problem Management & Authoring
              </h1>
              <p className="text-[var(--text-secondary)] text-xs mt-1">
                Manage, edit, delete, and author algorithmic DSA challenges for CodeIt.
              </p>
            </div>

            {/* Quick Stats Badges */}
            <div className="flex items-center gap-2">
              <div className="bg-[var(--bg-primary)] border border-[var(--border-subtle)] px-3 py-2 rounded-[6px] text-center min-w-20">
                <span className="block text-xs font-bold text-[var(--text-primary)] font-mono">{problems.length}</span>
                <span className="text-[10px] text-[var(--text-muted)] font-medium uppercase">Total</span>
              </div>
              <div className="bg-[var(--bg-primary)] border border-[var(--border-subtle)] px-3 py-2 rounded-[6px] text-center min-w-20">
                <span className="block text-xs font-bold text-[var(--text-primary)] font-mono">{easyCount}</span>
                <span className="text-[10px] text-[var(--text-muted)] font-medium uppercase">Easy</span>
              </div>
              <div className="bg-[var(--bg-primary)] border border-[var(--border-subtle)] px-3 py-2 rounded-[6px] text-center min-w-20">
                <span className="block text-xs font-bold text-[var(--text-primary)] font-mono">{mediumCount}</span>
                <span className="text-[10px] text-[var(--text-muted)] font-medium uppercase">Medium</span>
              </div>
              <div className="bg-[var(--bg-primary)] border border-[var(--border-subtle)] px-3 py-2 rounded-[6px] text-center min-w-20">
                <span className="block text-xs font-bold text-[var(--text-primary)] font-mono">{hardCount}</span>
                <span className="text-[10px] text-[var(--text-muted)] font-medium uppercase">Hard</span>
              </div>
            </div>
          </div>

          {/* TAB NAVIGATION BAR */}
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-[8px] p-1.5 flex items-center gap-2 text-xs">
            <button
              onClick={() => setActiveTab("manage")}
              className={`flex-1 py-2 rounded-[6px] font-semibold transition-colors flex items-center justify-center gap-2 ${
                activeTab === "manage"
                  ? "bg-[var(--bg-primary)] text-[var(--text-primary)] border border-[var(--border-subtle)]"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Manage Problems ({problems.length})</span>
            </button>

            <button
              onClick={() => {
                resetForm();
                setActiveTab("create");
              }}
              className={`flex-1 py-2 rounded-[6px] font-semibold transition-colors flex items-center justify-center gap-2 ${
                activeTab === "create"
                  ? "bg-[var(--bg-primary)] text-[var(--text-primary)] border border-[var(--border-subtle)]"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{editingProblemId ? "Edit Problem" : "Create New Problem"}</span>
            </button>
          </div>

          {/* ============================================================ */}
          {/* TAB 1: MANAGE PROBLEMS LIST TABLE                            */}
          {/* ============================================================ */}
          {activeTab === "manage" && (
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-[8px] overflow-hidden space-y-4 p-4">
              
              {/* Search & Filter Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-72">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                  <input
                    type="text"
                    placeholder="Search problem title or tag..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-[6px] pl-9 pr-3 py-1.5 text-xs text-[var(--text-primary)] focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <select
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                    className="bg-[var(--bg-primary)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-xs rounded-[6px] px-3 py-1.5 focus:outline-none"
                  >
                    <option value="all">All Difficulties</option>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>

                  <button
                    onClick={fetchProblems}
                    className="p-1.5 rounded-[6px] bg-[var(--bg-primary)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                    title="Refresh List"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Table */}
              {loadingProblems ? (
                <div className="py-12 text-center text-xs text-[var(--text-muted)] flex flex-col items-center justify-center gap-2">
                  <span className="loading loading-spinner loading-md text-[var(--text-secondary)]"></span>
                  <span>Loading problems...</span>
                </div>
              ) : filteredProblems.length === 0 ? (
                <div className="py-12 text-center text-xs text-[var(--text-muted)]">
                  No problems found matching criteria.
                </div>
              ) : (
                <div className="overflow-x-auto border border-[var(--border-subtle)] rounded-[6px]">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-primary)] text-[var(--text-secondary)] font-semibold">
                        <th className="py-2.5 px-4">Problem Title</th>
                        <th className="py-2.5 px-4">Difficulty</th>
                        <th className="py-2.5 px-4 hidden md:table-cell">Tags</th>
                        <th className="py-2.5 px-4 hidden sm:table-cell">Video Solution</th>
                        <th className="py-2.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-subtle)] text-[var(--text-primary)]">
                      {filteredProblems.map((prob) => (
                        <tr key={prob._id} className="hover:bg-[var(--bg-primary)] transition-colors">
                          
                          {/* Title */}
                          <td className="py-3 px-4 font-semibold">
                            <span>{prob.title}</span>
                          </td>

                          {/* Difficulty */}
                          <td className="py-3 px-4 capitalize">
                            <span className="px-2 py-0.5 rounded-[4px] text-[10px] font-medium border border-[var(--border-subtle)] bg-[var(--bg-primary)] text-[var(--text-secondary)]">
                              {prob.difficulty}
                            </span>
                          </td>

                          {/* Tags */}
                          <td className="py-3 px-4 hidden md:table-cell">
                            <div className="flex flex-wrap gap-1">
                              {prob.tags?.slice(0, 3).map((t, idx) => (
                                <span key={idx} className="bg-sky-500/10 text-sky-400 border border-sky-500/20 px-2.5 py-0.5 rounded-[4px] text-[11px] font-mono">
                                  {t}
                                </span>
                              ))}
                            </div>
                          </td>

                          {/* Video */}
                          <td className="py-3 px-4 hidden sm:table-cell text-xs">
                            {prob.hasVideo || prob.secureUrl ? (
                              <span className="text-emerald-500 font-medium flex items-center gap-1">
                                <Tv className="w-3.5 h-3.5" /> Attached
                              </span>
                            ) : (
                              <button
                                onClick={() => openVideoModal(prob)}
                                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] underline flex items-center gap-1 text-[11px]"
                              >
                                <Plus className="w-3 h-3" /> Add Video URL
                              </button>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Preview */}
                              <button
                                onClick={() => navigate(`/problem/${prob._id}`)}
                                className="p-1.5 rounded-[4px] bg-[var(--bg-primary)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                                title="View Problem Workspace"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>

                              {/* Edit */}
                              <button
                                onClick={() => handleEditProblem(prob._id)}
                                className="p-1.5 rounded-[4px] bg-[var(--bg-primary)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                                title="Edit Problem"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>

                              {/* Attach Video */}
                              <button
                                onClick={() => openVideoModal(prob)}
                                className="p-1.5 rounded-[4px] bg-[var(--bg-primary)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                                title="Attach Video Solution"
                              >
                                <Video className="w-3.5 h-3.5" />
                              </button>

                              {/* Delete */}
                              <button
                                onClick={() => handleDeleteProblem(prob._id, prob.title)}
                                className="p-1.5 rounded-[4px] bg-[var(--bg-primary)] border border-[var(--border-subtle)] text-red-400 hover:text-red-300"
                                title="Delete Problem"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
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

          {/* ============================================================ */}
          {/* TAB 2: CREATE / EDIT PROBLEM FORM                             */}
          {/* ============================================================ */}
          {activeTab === "create" && (
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Editing Notification Banner */}
              {editingProblemId && (
                <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] p-3 rounded-[6px] flex items-center justify-between text-xs text-[var(--text-primary)]">
                  <span>✏️ Currently Editing: <strong>{title}</strong></span>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="text-[var(--text-muted)] hover:text-[var(--text-primary)] underline"
                  >
                    Cancel Editing
                  </button>
                </div>
              )}

              {/* Card 1: Basic Information */}
              <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-[6px] p-6 space-y-5">
                <h3 className="font-bold text-sm text-[var(--text-primary)] flex items-center gap-2 border-b border-[var(--border-subtle)] pb-3 font-heading">
                  <FileText className="w-4 h-4 text-[var(--text-secondary)]" />
                  Problem Overview
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  <div className="md:col-span-8 space-y-1.5">
                    <label className="text-xs font-bold text-[var(--text-secondary)]">Problem Title *</label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. 1. Two Sum"
                      className="w-full bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-[6px] px-3.5 py-2 text-xs text-[var(--text-primary)] focus:outline-none font-semibold"
                    />
                  </div>

                  <div className="md:col-span-4 space-y-1.5">
                    <label className="text-xs font-bold text-[var(--text-secondary)]">Difficulty *</label>
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value)}
                      className="w-full bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-[6px] px-3.5 py-2 text-xs text-[var(--text-primary)] focus:outline-none font-semibold"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                </div>

                {/* Tags Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[var(--text-secondary)]">Category Tags</label>
                  <div className="flex flex-wrap gap-1.5">
                    {AVAILABLE_TAGS.map((tag) => (
                      <button
                        type="button"
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={`px-2.5 py-1 rounded-[4px] text-xs font-mono capitalize transition-all ${
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

                {/* Company Tags */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[var(--text-secondary)]">Company Tags (comma separated)</label>
                  <input
                    type="text"
                    value={companyTagsInput}
                    onChange={(e) => setCompanyTagsInput(e.target.value)}
                    placeholder="Google, Amazon, Meta, Microsoft"
                    className="w-full bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-[6px] px-3.5 py-2 text-xs text-[var(--text-primary)] focus:outline-none"
                  />
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[var(--text-secondary)]">Problem Description *</label>
                  <textarea
                    required
                    rows={6}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target..."
                    className="w-full bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-[6px] p-3.5 text-xs text-[var(--text-primary)] focus:outline-none leading-relaxed font-sans"
                  />
                </div>

                {/* Constraints */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[var(--text-secondary)]">Constraints</label>
                  <textarea
                    rows={3}
                    value={constraints}
                    onChange={(e) => setConstraints(e.target.value)}
                    placeholder="2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\nOnly one valid answer exists."
                    className="w-full bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-[6px] p-3.5 text-xs text-[var(--text-primary)] font-mono focus:outline-none leading-relaxed"
                  />
                </div>
              </div>

              {/* Card 2: Examples */}
              <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-[6px] p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
                  <h3 className="font-bold text-sm text-[var(--text-primary)] flex items-center gap-2 font-heading">
                    <Layers className="w-4 h-4 text-[var(--text-secondary)]" />
                    Examples
                  </h3>
                  <button
                    type="button"
                    onClick={addExample}
                    className="px-2.5 py-1 text-xs bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] hover:bg-[var(--bg-primary)] text-[var(--text-primary)] rounded-[6px] flex items-center gap-1 font-medium transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Example
                  </button>
                </div>

                {examples.map((ex, idx) => (
                  <div key={idx} className="p-4 bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-[6px] space-y-3 relative">
                    <div className="flex items-center justify-between text-xs font-bold text-[var(--text-secondary)]">
                      <span>Example {idx + 1}</span>
                      {examples.length > 1 && (
                        <button type="button" onClick={() => removeExample(idx)} className="text-[var(--text-muted)] hover:text-red-400 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <input
                        type="text"
                        placeholder="Input (e.g. nums = [2,7,11,15], target = 9)"
                        value={ex.input}
                        onChange={(e) => {
                          const updated = [...examples];
                          updated[idx].input = e.target.value;
                          setExamples(updated);
                        }}
                        className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-[6px] p-2 text-xs text-[var(--text-primary)]"
                      />
                      <input
                        type="text"
                        placeholder="Output (e.g. [0,1])"
                        value={ex.output}
                        onChange={(e) => {
                          const updated = [...examples];
                          updated[idx].output = e.target.value;
                          setExamples(updated);
                        }}
                        className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-[6px] p-2 text-xs text-[var(--text-primary)]"
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Explanation (optional)"
                      value={ex.explanation}
                      onChange={(e) => {
                        const updated = [...examples];
                        updated[idx].explanation = e.target.value;
                        setExamples(updated);
                      }}
                      className="w-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-[6px] p-2 text-xs text-[var(--text-primary)]"
                    />
                  </div>
                ))}
              </div>

              {/* Card 3: Test Cases (Visible & Hidden) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Visible Test Cases */}
                <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-[6px] p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
                    <h3 className="font-bold text-sm text-[var(--text-primary)] flex items-center gap-2 font-heading">
                      <CheckCircle2 className="w-4 h-4 text-[var(--text-secondary)]" />
                      Visible Test Cases
                    </h3>
                    <button type="button" onClick={addVisibleTestCase} className="px-2.5 py-1 text-xs bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] hover:bg-[var(--bg-primary)] text-[var(--text-primary)] rounded-[6px] flex items-center gap-1 font-medium transition-colors">
                      <Plus className="w-3.5 h-3.5" /> Add
                    </button>
                  </div>

                  {visibleTestCases.map((tc, idx) => (
                    <div key={idx} className="p-3 bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-[6px] space-y-2 text-xs font-mono">
                      <div className="flex justify-between items-center text-[var(--text-muted)] font-bold">
                        <span>Sample Case {idx + 1}</span>
                        {visibleTestCases.length > 1 && (
                          <button type="button" onClick={() => removeVisibleTestCase(idx)} className="text-[var(--text-muted)] hover:text-red-400 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <textarea
                        placeholder="Input string (stdin)"
                        rows={2}
                        value={tc.input}
                        onChange={(e) => {
                          const updated = [...visibleTestCases];
                          updated[idx].input = e.target.value;
                          setVisibleTestCases(updated);
                        }}
                        className="w-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-[6px] p-2 text-xs text-[var(--text-primary)]"
                      />
                      <textarea
                        placeholder="Expected Output string"
                        rows={1}
                        value={tc.output}
                        onChange={(e) => {
                          const updated = [...visibleTestCases];
                          updated[idx].output = e.target.value;
                          setVisibleTestCases(updated);
                        }}
                        className="w-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-[6px] p-2 text-xs text-[var(--text-primary)]"
                      />
                    </div>
                  ))}
                </div>

                {/* Hidden Test Cases */}
                <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-[6px] p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
                    <h3 className="font-bold text-sm text-[var(--text-primary)] flex items-center gap-2 font-heading">
                      <ShieldAlert className="w-4 h-4 text-[var(--text-secondary)]" />
                      Hidden Test Cases
                    </h3>
                    <button type="button" onClick={addHiddenTestCase} className="px-2.5 py-1 text-xs bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] hover:bg-[var(--bg-primary)] text-[var(--text-primary)] rounded-[6px] flex items-center gap-1 font-medium transition-colors">
                      <Plus className="w-3.5 h-3.5" /> Add
                    </button>
                  </div>

                  {hiddenTestCases.map((tc, idx) => (
                    <div key={idx} className="p-3 bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-[6px] space-y-2 text-xs font-mono">
                      <div className="flex justify-between items-center text-[var(--text-muted)] font-bold">
                        <span>Hidden Case {idx + 1}</span>
                        {hiddenTestCases.length > 1 && (
                          <button type="button" onClick={() => removeHiddenTestCase(idx)} className="text-[var(--text-muted)] hover:text-red-400 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <textarea
                        placeholder="Input string (stdin)"
                        rows={2}
                        value={tc.input}
                        onChange={(e) => {
                          const updated = [...hiddenTestCases];
                          updated[idx].input = e.target.value;
                          setHiddenTestCases(updated);
                        }}
                        className="w-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-[6px] p-2 text-xs text-[var(--text-primary)]"
                      />
                      <textarea
                        placeholder="Expected Output string"
                        rows={1}
                        value={tc.output}
                        onChange={(e) => {
                          const updated = [...hiddenTestCases];
                          updated[idx].output = e.target.value;
                          setHiddenTestCases(updated);
                        }}
                        className="w-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-[6px] p-2 text-xs text-[var(--text-primary)]"
                      />
                    </div>
                  ))}
                </div>

              </div>

              {/* Submit Action */}
              <div className="flex justify-end gap-4">
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
                  className="px-4 py-2 bg-[#1E1E1E] dark:bg-[#2E2E2E] hover:bg-[#2A2A2A] dark:hover:bg-[#3A3A3A] border border-neutral-700 text-white rounded-[6px] text-xs font-semibold flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  {saving ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> : <Send className="w-3.5 h-3.5" />}
                  <span>{editingProblemId ? "Update Problem" : "Publish Problem"}</span>
                </button>
              </div>

            </form>
          )}

        </main>
      </div>

      {/* VIDEO SOLUTION METADATA MODAL */}
      {videoModalProblem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-[8px] w-full max-w-md p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2">
              <h3 className="font-bold text-sm text-[var(--text-primary)] font-heading flex items-center gap-2">
                <Tv className="w-4 h-4 text-[var(--text-primary)]" />
                <span>Attach Video Solution</span>
              </h3>
              <button
                onClick={() => setVideoModalProblem(null)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[var(--text-secondary)]">
              Attach a video solution URL (Cloudinary, YouTube, MP4) for: <strong>{videoModalProblem.title}</strong>
            </p>

            <div className="space-y-1.5">
              <label className="font-bold text-[var(--text-secondary)]">Video Stream URL *</label>
              <input
                type="url"
                value={videoUrlInput}
                onChange={(e) => setVideoUrlInput(e.target.value)}
                placeholder="https://res.cloudinary.com/..."
                className="w-full bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-[6px] px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setVideoModalProblem(null)}
                className="px-3 py-1.5 rounded-[6px] bg-[var(--bg-primary)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveVideoMetadata}
                disabled={savingVideo}
                className="px-4 py-1.5 rounded-[6px] bg-[var(--text-primary)] text-[var(--bg-primary)] font-semibold"
              >
                {savingVideo ? "Saving..." : "Save Video Solution"}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default AdminCreateProblem;
