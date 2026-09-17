const bcrypt = require("bcrypt");
const Problem = require("../models/problem");
const User = require("../models/user");
const env = require("./env");

// starter templates per language. inputs are parsed by the execution drivers so the
// user only has to implement the Solution method (like LeetCode).
const twoSumStarters = [
  {
    language: "cpp",
    initialCode: `#include <vector>
#include <unordered_map>
using namespace std;

class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // Write your solution here
    }
};`,
  },
  {
    language: "java",
    initialCode: `import java.util.*;

class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Write your solution here
        return new int[0];
    }
}`,
  },
  {
    language: "python",
    initialCode: `from typing import List

class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        # Write your solution here
        pass`,
  },
  {
    language: "javascript",
    initialCode: `class Solution {
    /**
     * @param {number[]} nums
     * @param {number} target
     * @return {number[]}
     */
    twoSum(nums, target) {
        // Write your solution here
    }
}`,
  },
];

const trapStarters = [
  {
    language: "cpp",
    initialCode: `#include <vector>
using namespace std;

class Solution {
public:
    int trap(vector<int>& height) {
        // Write your solution here
    }
};`,
  },
  {
    language: "java",
    initialCode: `class Solution {
    public int trap(int[] height) {
        // Write your solution here
        return 0;
    }
}`,
  },
  {
    language: "python",
    initialCode: `from typing import List

class Solution:
    def trap(self, height: List[int]) -> int:
        # Write your solution here
        pass`,
  },
  {
    language: "javascript",
    initialCode: `class Solution {
    /**
     * @param {number[]} height
     * @return {number}
     */
    trap(height) {
        // Write your solution here
    }
}`,
  },
];

const validParenthesesStarters = [
  {
    language: "cpp",
    initialCode: `#include <string>
#include <stack>
using namespace std;

class Solution {
public:
    bool isValid(string s) {
        // Write your solution here
    }
};`,
  },
  {
    language: "java",
    initialCode: `import java.util.*;

class Solution {
    public boolean isValid(String s) {
        // Write your solution here
        return false;
    }
}`,
  },
  {
    language: "python",
    initialCode: `class Solution:
    def isValid(self, s: str) -> bool:
        # Write your solution here
        pass`,
  },
  {
    language: "javascript",
    initialCode: `class Solution {
    /**
     * @param {string} s
     * @return {boolean}
     */
    isValid(s) {
        // Write your solution here
    }
}`,
  },
];

const INITIAL_PROBLEMS = [
  {
    _id: "6a64bb23a1e6865b6a53f5d3",
    title: "1. Two Sum",
    difficulty: "easy",
    tags: ["array", "hashmap"],
    companyTags: ["google", "amazon", "meta", "apple"],
    description: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.

You may assume that each input would have **exactly one solution**, and you may not use the same element twice.

You can return the answer in any order.

**Input format (stdin):** the first line contains n, the second line contains the n integers of nums, the third line contains target.
**Output format:** the two indices separated by a space.`,
    examples: [
      {
        input: "nums = [2,7,11,15], target = 9",
        output: "0 1",
        explanation: "Because nums[0] + nums[1] == 9, we return [0, 1].",
      },
      {
        input: "nums = [3,2,4], target = 6",
        output: "1 2",
        explanation: "nums[1] + nums[2] == 6.",
      },
    ],
    constraints: `2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9\nOnly one valid answer exists.`,
    hints: [
      "A brute force O(n^2) double loop works but is slow. Can you do it in one pass?",
      "For every number, you know exactly which complement you are looking for: target - nums[i].",
      "Use a hash map from value to index for O(1) complement lookup.",
    ],
    editorial: `**Hash map approach (O(n) time, O(n) space)**

Iterate through the array once. For each element nums[i], compute complement = target - nums[i]. If the complement is already in the map, return [map[complement], i]. Otherwise store nums[i] -> i in the map and continue.`,
    visibleTestCases: [
      { input: "4\n2 7 11 15\n9", output: "0 1" },
      { input: "3\n3 2 4\n6", output: "1 2" },
    ],
    hiddenTestCases: [
      { input: "2\n3 3\n6", output: "0 1" },
      { input: "5\n1 2 3 4 5\n9", output: "3 4" },
      { input: "4\n-1 -2 -3 -4\n-6", output: "1 3" },
    ],
    startCode: twoSumStarters,
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
    description: `Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.

**Input format (stdin):** the heights, e.g. \`height = [4,2,0,3,2,5]\` or simply \`4 2 0 3 2 5\`.
**Output format:** a single integer, the total trapped water.`,
    examples: [
      {
        input: "height = [0,1,0,2,1,0,1,3,2,1,2,1]",
        output: "6",
        explanation: "The elevation map traps 6 units of rain water.",
      },
      {
        input: "height = [4,2,0,3,2,5]",
        output: "9",
        explanation: "9 units of rain water are trapped.",
      },
    ],
    constraints: `n == height.length\n1 <= n <= 2 * 10^4\n0 <= height[i] <= 10^5`,
    hints: [
      "Water above bar i is min(maxLeft[i], maxRight[i]) - height[i].",
      "Two pointers from both ends let you compute this in one pass with O(1) extra space.",
    ],
    editorial: `**Two pointer approach (O(n) time, O(1) space)**

Keep pointers l and r with running maxima leftMax and rightMax. Always move the pointer with the smaller height: the water above it is bounded by its own side's maximum, so it can be finalised immediately.`,
    visibleTestCases: [
      { input: "height = [4,2,0,3,2,5]", output: "9", explanation: "9 units of rain water are trapped." },
      { input: "height = [0,1,0,2,1,0,1,3,2,1,2,1]", output: "6" },
    ],
    hiddenTestCases: [
      { input: "height = [3,0,2,0,4]", output: "7" },
      { input: "height = [1,2,3,4]", output: "0" },
      { input: "height = [5,4,1,2]", output: "1" },
    ],
    startCode: trapStarters,
    status: "published",
    acceptedCount: 0,
    submissionCount: 0,
  },
  {
    _id: "6a64bb23a1e6865b6a53f5d6",
    title: "20. Valid Parentheses",
    difficulty: "easy",
    tags: ["string", "stack"],
    companyTags: ["google", "amazon", "microsoft"],
    description: `Given a string \`s\` containing just the characters \`(\`, \`)\`, \`{\`, \`}\`, \`[\` and \`]\`, determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.

**Input format (stdin):** the string s.
**Output format:** \`true\` or \`false\`.`,
    examples: [
      { input: 's = "()"', output: "true", explanation: "Matching pair." },
      { input: 's = "()[]{}"', output: "true", explanation: "All pairs match in order." },
      { input: 's = "(]"', output: "false", explanation: "Mismatched bracket types." },
    ],
    constraints: `1 <= s.length <= 10^4\ns consists of parentheses only '()[]{}'.`,
    hints: [
      "Think about the last opened bracket: it must be the first one closed.",
      "A stack gives you exactly that last-in-first-out behaviour.",
    ],
    editorial: `**Stack approach (O(n) time, O(n) space)**

Push every opening bracket. On a closing bracket, the stack must be non-empty and its top must be the matching opener; otherwise the string is invalid. The string is valid if the stack is empty at the end.`,
    visibleTestCases: [
      { input: "()", output: "true" },
      { input: "(]", output: "false" },
    ],
    hiddenTestCases: [
      { input: "()[]{}", output: "true" },
      { input: "([)]", output: "false" },
      { input: "{[]}", output: "true" },
      { input: "((", output: "false" },
    ],
    startCode: validParenthesesStarters,
    status: "published",
    acceptedCount: 21,
    submissionCount: 34,
  },
];

// inserts seed problems that are missing and refreshes starter templates for seed
// problems that were created by an older seed with fewer languages
async function seedInitialProblemsIfEmpty() {
  try {
    for (const prob of INITIAL_PROBLEMS) {
      const existing = await Problem.findById(prob._id).select("startCode visibleTestCases hiddenTestCases");
      if (!existing) {
        await Problem.create(prob);
        console.log(`Seeded problem "${prob.title}"`);
        continue;
      }
      const existingLangs = new Set((existing.startCode || []).map((s) => s.language));
      const missing = prob.startCode.filter((s) => !existingLangs.has(s.language));
      if (missing.length > 0) {
        await Problem.updateOne(
          { _id: prob._id },
          {
            $set: {
              startCode: [...existing.startCode, ...missing],
              ...(existing.hiddenTestCases.length < prob.hiddenTestCases.length && { hiddenTestCases: prob.hiddenTestCases }),
              ...(existing.visibleTestCases.length < prob.visibleTestCases.length && { visibleTestCases: prob.visibleTestCases }),
            },
          }
        );
        console.log(`Added ${missing.length} starter template(s) to "${prob.title}"`);
      }
    }
  } catch (err) {
    console.error("Problem seeding error:", err.message);
  }
}

// creates the bootstrap admin account from ADMIN_EMAIL / ADMIN_PASSWORD if it does not exist
async function seedAdminIfConfigured() {
  const { email, password, firstName } = env.admin;
  if (!email || !password) return;
  try {
    const normalizedEmail = email.trim().toLowerCase();
    const existing = await User.findOne({ emailId: normalizedEmail });
    if (existing) {
      if (existing.role !== "admin") {
        await User.updateOne({ _id: existing._id }, { $set: { role: "admin" } });
        console.log(`Promoted ${normalizedEmail} to admin`);
      }
      return;
    }
    if (password.length < 8) {
      console.warn("ADMIN_PASSWORD must be at least 8 characters; skipping admin bootstrap");
      return;
    }
    await User.create({
      firstName,
      lastName: "",
      emailId: normalizedEmail,
      password: await bcrypt.hash(password, 10),
      role: "admin",
    });
    console.log(`Created bootstrap admin account ${normalizedEmail}`);
  } catch (err) {
    console.error("Admin bootstrap error:", err.message);
  }
}

module.exports = seedInitialProblemsIfEmpty;
module.exports.seedAdminIfConfigured = seedAdminIfConfigured;
module.exports.INITIAL_PROBLEMS = INITIAL_PROBLEMS;
