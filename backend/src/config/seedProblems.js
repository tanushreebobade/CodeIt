const Problem = require("../models/problem");

const INITIAL_PROBLEMS = [
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

async function seedInitialProblemsIfEmpty() {
  try {
    const count = await Problem.countDocuments();
    if (count === 0) {
      console.log("Seeding initial problems to MongoDB...");
      for (const prob of INITIAL_PROBLEMS) {
        await Problem.create(prob);
      }
      console.log(`Successfully seeded ${INITIAL_PROBLEMS.length} problems to MongoDB!`);
    }
  } catch (err) {
    console.error("Problem seeding error:", err.message);
  }
}

module.exports = seedInitialProblemsIfEmpty;
