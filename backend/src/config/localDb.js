const fs = require("fs");
const path = require("path");
const env = require("./env");

const DATA_DIR = path.join(__dirname, "../../data");
if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (err) {
    console.error("Failed to create data dir:", err.message);
  }
}

const DEFAULT_PROBLEMS = [
  {
    _id: "6a64bb23a1e6865b6a53f5d3",
    title: "1. Two Sum",
    difficulty: "easy",
    tags: ["array", "hashmap"],
    companyTags: ["google", "amazon", "meta", "apple"],
    description: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.

You may assume that each input would have **exactly one solution**, and you may not use the same element twice.

You can return the answer in any order.`,
    examples: [
      {
        input: "nums = [2,7,11,15], target = 9",
        output: "[0,1]",
        explanation: "Because nums[0] + nums[1] == 9, we return [0, 1].",
      },
    ],
    constraints: `2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9\nOnly one valid answer exists.`,
    hints: ["Use a Hash Map for O(N) lookup."],
    editorial: `Hash map approach.`,
    visibleTestCases: [
      { input: "4\n2 7 11 15\n9", output: "0 1" },
      { input: "3\n3 2 4\n6", output: "1 2" },
    ],
    hiddenTestCases: [
      { input: "2\n3 3\n6", output: "0 1" },
      { input: "5\n1 2 3 4 5\n9", output: "3 4" },
    ],
    startCode: [
      {
        language: "cpp",
        initialCode: `#include <vector>
#include <unordered_map>
using namespace std;

class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // Write your solution
    }
};`,
      },
    ],
    status: "published",
    acceptedCount: 9,
    submissionCount: 13,
  },
  {
    _id: "6a6c3bad08eb3055b5937a82",
    title: "42. Trapping Rain Water",
    difficulty: "hard",
    tags: ["array", "twoPointers", "stack"],
    companyTags: ["google", "amazon"],
    description: `Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.`,
    examples: [
      {
        input: "height = [4,2,0,3,2,5]",
        output: "9",
        explanation: "9 units of rain water are trapped.",
      },
    ],
    constraints: `n == height.length\n1 <= n <= 2 * 10^4\n0 <= height[i] <= 10^5`,
    hints: ["Use two pointers."],
    editorial: `Two pointer approach.`,
    visibleTestCases: [
      { input: "height = [4,2,0,3,2,5]", output: "9", explanation: "9 units of rain water are trapped." },
    ],
    hiddenTestCases: [
      { input: "height = [3,0,2,0,4]", output: "7" },
    ],
    startCode: [
      {
        language: "cpp",
        initialCode: `#include <vector>
using namespace std;

class Solution {
public:
    int trap(vector<int>& height) {
        // Write your C++ solution here
    }
};`,
      },
    ],
    status: "published",
    acceptedCount: 0,
    submissionCount: 0,
  },
];

class LocalDatabase {
  constructor() {
    this.usersFile = path.join(DATA_DIR, "users.json");
    this.problemsFile = path.join(DATA_DIR, "problems.json");
    this.submissionsFile = path.join(DATA_DIR, "submissions.json");
    this.attemptsFile = path.join(DATA_DIR, "attempts.json");

    this.initData();
  }

  initData() {
    if (!fs.existsSync(this.usersFile)) {
      fs.writeFileSync(this.usersFile, JSON.stringify([], null, 2));
    }
    if (!fs.existsSync(this.problemsFile)) {
      fs.writeFileSync(this.problemsFile, JSON.stringify(DEFAULT_PROBLEMS, null, 2));
    }
    if (!fs.existsSync(this.submissionsFile)) {
      fs.writeFileSync(this.submissionsFile, JSON.stringify([], null, 2));
    }
    if (!fs.existsSync(this.attemptsFile)) {
      fs.writeFileSync(this.attemptsFile, JSON.stringify([], null, 2));
    }
  }

  read(file) {
    try {
      if (fs.existsSync(file)) {
        const raw = fs.readFileSync(file, "utf-8");
        return JSON.parse(raw);
      }
    } catch (e) {
      console.error(`Error reading ${file}:`, e.message);
    }
    return [];
  }

  write(file, data) {
    try {
      fs.writeFileSync(file, JSON.stringify(data, null, 2));
    } catch (e) {
      console.error(`Error writing ${file}:`, e.message);
    }
  }

  // Users API
  getUsers() {
    return this.read(this.usersFile);
  }

  findUserById(id) {
    if (!id) return null;
    const users = this.getUsers();
    return users.find((u) => String(u._id) === String(id)) || null;
  }

  findUserByEmail(emailId) {
    if (!emailId) return null;
    const users = this.getUsers();
    return users.find((u) => u.emailId?.toLowerCase() === emailId.toLowerCase()) || null;
  }

  createUser(userData) {
    const users = this.getUsers();
    const newUser = {
      _id: "u_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
      ...userData,
      problemSolved: userData.problemSolved || [],
      problemAttempts: userData.problemAttempts || [],
      role: userData.role || "user",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    users.push(newUser);
    this.write(this.usersFile, users);
    return newUser;
  }

  updateUser(id, updateData) {
    const users = this.getUsers();
    const index = users.findIndex((u) => String(u._id) === String(id));
    if (index === -1) return null;

    users[index] = {
      ...users[index],
      ...updateData,
      updatedAt: new Date().toISOString(),
    };
    this.write(this.usersFile, users);
    return users[index];
  }

  deleteUser(id) {
    const users = this.getUsers();
    const index = users.findIndex((u) => String(u._id) === String(id));
    if (index === -1) return null;
    const [removed] = users.splice(index, 1);
    this.write(this.usersFile, users);
    // cascade delete submissions and attempts owned by the user
    this.write(this.submissionsFile, this.getSubmissions().filter((s) => String(s.userId) !== String(id)));
    this.write(this.attemptsFile, this.getAttempts().filter((a) => String(a.userId) !== String(id)));
    return removed;
  }

  addSolvedProblem(userId, problemId) {
    const users = this.getUsers();
    const user = users.find((u) => String(u._id) === String(userId));
    if (!user) return null;

    if (!user.problemSolved) user.problemSolved = [];
    const exists = user.problemSolved.some((p) => String(p._id || p) === String(problemId));
    if (!exists) {
      const prob = this.findProblemById(problemId);
      user.problemSolved.push(prob ? { _id: prob._id, title: prob.title, difficulty: prob.difficulty } : problemId);
    }
    this.write(this.usersFile, users);
    return user;
  }

  // Problems API
  getProblems() {
    const probs = this.read(this.problemsFile);
    if (probs.length === 0) {
      this.write(this.problemsFile, DEFAULT_PROBLEMS);
      return DEFAULT_PROBLEMS;
    }
    return probs;
  }

  findProblemById(id) {
    if (!id) return null;
    const problems = this.getProblems();
    return problems.find((p) => String(p._id) === String(id)) || null;
  }

  createProblem(problemData) {
    const problems = this.getProblems();
    const newProblem = {
      _id: "p_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
      ...problemData,
      acceptedCount: 0,
      submissionCount: 0,
      status: "published",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    problems.push(newProblem);
    this.write(this.problemsFile, problems);
    return newProblem;
  }

  updateProblem(id, updateData) {
    const problems = this.getProblems();
    const index = problems.findIndex((p) => String(p._id) === String(id));
    if (index === -1) return null;
    problems[index] = {
      ...problems[index],
      ...updateData,
      updatedAt: new Date().toISOString(),
    };
    this.write(this.problemsFile, problems);
    return problems[index];
  }

  deleteProblem(id) {
    const problems = this.getProblems();
    const index = problems.findIndex((p) => String(p._id) === String(id));
    if (index === -1) return null;
    const [removed] = problems.splice(index, 1);
    this.write(this.problemsFile, problems);
    return removed;
  }

  // Submissions API
  getSubmissions() {
    return this.read(this.submissionsFile);
  }

  createSubmission(subData) {
    const subs = this.getSubmissions();
    const newSub = {
      _id: "sub_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
      ...subData,
      createdAt: new Date().toISOString(),
    };
    subs.unshift(newSub);
    this.write(this.submissionsFile, subs);
    return newSub;
  }

  // Attempts API
  getAttempts() {
    return this.read(this.attemptsFile);
  }

  findOrCreateAttempt(userId, problemId) {
    const attempts = this.getAttempts();
    let attempt = attempts.find(
      (a) => String(a.userId) === String(userId) && String(a.problemId) === String(problemId)
    );
    if (!attempt) {
      attempt = {
        _id: "att_" + Date.now(),
        userId: String(userId),
        problemId: String(problemId),
        runAttempts: env.freeRunAttempts,
        submitAttempts: env.freeSubmitAttempts,
        solved: false,
      };
      attempts.push(attempt);
      this.write(this.attemptsFile, attempts);
    }
    return attempt;
  }

  decrementRunAttempt(userId, problemId) {
    const attempts = this.getAttempts();
    const attempt = attempts.find(
      (a) => String(a.userId) === String(userId) && String(a.problemId) === String(problemId)
    );
    if (attempt && attempt.runAttempts > 0) {
      attempt.runAttempts -= 1;
      this.write(this.attemptsFile, attempts);
    }
    return attempt;
  }

  decrementSubmitAttempt(userId, problemId) {
    const attempts = this.getAttempts();
    const attempt = attempts.find(
      (a) => String(a.userId) === String(userId) && String(a.problemId) === String(problemId)
    );
    if (attempt && attempt.submitAttempts > 0) {
      attempt.submitAttempts -= 1;
      this.write(this.attemptsFile, attempts);
    }
    return attempt;
  }

  markSolved(userId, problemId) {
    const attempts = this.getAttempts();
    let attempt = attempts.find(
      (a) => String(a.userId) === String(userId) && String(a.problemId) === String(problemId)
    );
    if (attempt) {
      attempt.solved = true;
    } else {
      attempt = {
        _id: "att_" + Date.now(),
        userId: String(userId),
        problemId: String(problemId),
        runAttempts: env.freeRunAttempts,
        submitAttempts: env.freeSubmitAttempts,
        solved: true,
      };
      attempts.push(attempt);
    }
    this.write(this.attemptsFile, attempts);
    return attempt;
  }
}

module.exports = new LocalDatabase();
