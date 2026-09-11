// format raw tag key to clean user facing label
export const formatTag = (tag) => {
  if (!tag) return "";
  const tagMap = {
    array: "Array",
    arrays: "Arrays",
    hashmap: "Hash Map",
    linkedlist: "Linked List",
    binarysearch: "Binary Search",
    slidingwindow: "Sliding Window",
    dp: "Dynamic Programming",
    string: "String",
    strings: "Strings",
    stack: "Stack",
    queue: "Queue",
    tree: "Tree",
    trees: "Trees",
    graph: "Graph",
    graphs: "Graphs",
    math: "Math",
    matrix: "Matrix",
    backtracking: "Backtracking",
    heap: "Heap",
    greedy: "Greedy",
    recursion: "Recursion",
    trie: "Trie",
    bitmanipulation: "Bit Manipulation"
  };

  const key = String(tag).toLowerCase().replace(/[^a-z]/g, "");
  if (tagMap[key]) return tagMap[key];

  return String(tag)
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
};
