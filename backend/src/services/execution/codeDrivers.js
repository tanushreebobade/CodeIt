// generates "driver" code so that LeetCode style `class Solution` snippets can be
// executed as a full program against stdin. If the user already wrote a complete
// program (main function / stdin reading) the code is returned untouched.

// ---------------------------------------------------------------- C++ -----
function parseCppSolutionMethod(code) {
  const classMatch = code.match(/class\s+Solution\s*\{([\s\S]*?)\};/);
  const body = classMatch ? classMatch[1] : code;

  const regex = /([A-Za-z0-9_:<>\s\*\&]+?)\s+([A-Za-z_]\w*)\s*\(([^)]*)\)\s*(?:const\s*)?\{/;
  const match = body.match(regex);
  if (!match) return null;

  const returnType = match[1].replace(/^(public|private|protected)\s*:\s*/i, "").trim();

  return {
    returnType,
    funcName: match[2].trim(),
    paramsStr: match[3].trim(),
  };
}

const CPP_PARSE_HELPERS = `
static vector<long long> __codeit_nums;
static string __codeit_raw;
static string __codeit_str;

static void __codeit_parse_input() {
    string line;
    vector<string> lines;
    while (getline(cin, line)) { lines.push_back(line); __codeit_raw += line + "\\n"; }
    // extract every integer
    string temp;
    for (char c : __codeit_raw) {
        if (isdigit((unsigned char)c) || (c == '-' && temp.empty())) temp += c;
        else { if (!temp.empty() && temp != "-") __codeit_nums.push_back(stoll(temp)); temp.clear(); }
    }
    if (!temp.empty() && temp != "-") __codeit_nums.push_back(stoll(temp));

    // string value: strip "name = " prefix and surrounding quotes / whitespace
    __codeit_str = __codeit_raw;
    while (!__codeit_str.empty() && isspace((unsigned char)__codeit_str.back())) __codeit_str.pop_back();
    size_t start = 0;
    while (start < __codeit_str.size() && isspace((unsigned char)__codeit_str[start])) start++;
    __codeit_str = __codeit_str.substr(start);
    size_t eq = __codeit_str.find('=');
    if (eq != string::npos) {
        bool ident = true;
        for (size_t i = 0; i < eq; i++) if (!(isalnum((unsigned char)__codeit_str[i]) || __codeit_str[i] == '_' || __codeit_str[i] == ' ')) ident = false;
        if (ident) { __codeit_str = __codeit_str.substr(eq + 1); while (!__codeit_str.empty() && isspace((unsigned char)__codeit_str[0])) __codeit_str.erase(0, 1); }
    }
    if (__codeit_str.size() >= 2 && (__codeit_str[0] == '"' || __codeit_str[0] == '\\'') && __codeit_str.back() == __codeit_str[0]) {
        __codeit_str = __codeit_str.substr(1, __codeit_str.size() - 2);
    }

    // drop a leading "count" line (e.g. "4\\n2 7 11 15\\n9") when it matches
    string first;
    for (auto &l : lines) { bool blank = true; for (char c : l) if (!isspace((unsigned char)c)) blank = false; if (!blank) { first = l; break; } }
    bool firstIsInt = !first.empty();
    for (char c : first) if (!(isdigit((unsigned char)c) || c == '-' || isspace((unsigned char)c))) firstIsInt = false;
    if (firstIsInt && __codeit_nums.size() >= 2) {
        long long n = __codeit_nums[0];
        size_t rest = __codeit_nums.size() - 1;
        if (n >= 0 && (rest == (size_t)n || rest == (size_t)n + 1)) __codeit_nums.erase(__codeit_nums.begin());
    }
}

static vector<int> __codeit_int_vec(bool dropLast) {
    vector<int> v;
    size_t n = __codeit_nums.size();
    if (dropLast && n > 0) n--;
    for (size_t i = 0; i < n; i++) v.push_back((int)__codeit_nums[i]);
    return v;
}

template <typename T> static void __codeit_print(const T &value) { cout << value; }
static void __codeit_print(bool value) { cout << (value ? "true" : "false"); }
static void __codeit_print(const string &value) { cout << value; }
template <typename T> static void __codeit_print(const vector<T> &v) {
    for (size_t i = 0; i < v.size(); i++) { if (i) cout << " "; __codeit_print(v[i]); }
}
template <typename T> static void __codeit_print(const vector<vector<T>> &v) {
    for (size_t i = 0; i < v.size(); i++) { if (i) cout << "\\n"; __codeit_print(v[i]); }
}
`;

function wrapCppIfNeeded(code) {
  if (/\bint\s+main\s*\(/.test(code) || /\bvoid\s+main\s*\(/.test(code)) return code;
  if (!/\bclass\s+Solution\b/.test(code)) return code;

  const parsed = parseCppSolutionMethod(code);
  if (!parsed) return code;

  const { returnType, funcName, paramsStr } = parsed;
  const params = paramsStr ? paramsStr.split(",").map((p) => p.trim()) : [];
  const isVoid = returnType === "void";

  const argExprs = [];
  const isVec = (p) => /vector\s*<\s*(int|long|long long)\s*>/.test(p);
  const isStr = (p) => /\bstring\b/.test(p) && !/vector/.test(p);
  const isNum = (p) => /\b(int|long|long long|size_t|double)\b/.test(p) && !/vector|string/.test(p);

  // supported shapes: (vector), (vector, int), (string), (string, int), (int), (int, int)
  let numIdx = 0;
  const trailingNums = params.filter(isNum).length;
  for (const p of params) {
    if (isVec(p)) {
      argExprs.push(`__codeit_int_vec(${trailingNums > 0 ? "true" : "false"})`);
    } else if (isStr(p)) {
      argExprs.push("__codeit_str");
    } else if (isNum(p)) {
      // numbers are taken from the end of the parsed integer list
      const fromEnd = trailingNums - numIdx;
      argExprs.push(`(__codeit_nums.size() >= ${fromEnd} ? (int)__codeit_nums[__codeit_nums.size() - ${fromEnd}] : 0)`);
      numIdx++;
    } else {
      // unknown parameter type: best effort, pass the integer vector
      argExprs.push("__codeit_int_vec(false)");
    }
  }

  let driver = `\n\n#include <iostream>\n#include <sstream>\n#include <string>\n#include <vector>\n#include <cctype>\n#include <algorithm>\nusing namespace std;\n`;
  driver += CPP_PARSE_HELPERS;
  driver += `\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    __codeit_parse_input();\n    Solution __sol;\n`;
  // materialise arguments as named lvalues so reference parameters (vector<int>&) bind
  argExprs.forEach((expr, idx) => {
    driver += `    auto __arg${idx} = ${expr};\n`;
  });
  const call = `__sol.${funcName}(${argExprs.map((_, idx) => `__arg${idx}`).join(", ")})`;
  if (isVoid) {
    driver += `    ${call};\n`;
  } else {
    driver += `    __codeit_print(${call});\n    cout << endl;\n`;
  }
  driver += `    return 0;\n}\n`;

  return code + driver;
}

// ------------------------------------------------------------- Python -----
const PYTHON_DRIVER = `

import sys as __codeit_sys, re as __codeit_re, inspect as __codeit_inspect

def __codeit_main():
    raw = __codeit_sys.stdin.read()
    nums = [int(x) for x in __codeit_re.findall(r'-?\\d+', raw)]
    text = raw.strip()
    m = __codeit_re.match(r'^\\s*[A-Za-z_]\\w*\\s*=\\s*(.*)$', text, __codeit_re.S)
    if m:
        text = m.group(1).strip()
    if len(text) >= 2 and text[0] == text[-1] and text[0] in ('"', "'"):
        text = text[1:-1]
    lines = [l for l in raw.splitlines() if l.strip()]
    if lines and __codeit_re.fullmatch(r'\\s*-?\\d+\\s*', lines[0]) and len(nums) >= 2:
        n = nums[0]
        rest = len(nums) - 1
        if n >= 0 and rest in (n, n + 1):
            nums = nums[1:]

    sol = Solution()
    methods = [n for n, f in __codeit_inspect.getmembers(sol, predicate=__codeit_inspect.ismethod) if not n.startswith('_')]
    if not methods:
        return
    fn = getattr(sol, methods[0])
    params = list(__codeit_inspect.signature(fn).parameters.values())

    def kind(p):
        ann = '' if p.annotation is __codeit_inspect.Parameter.empty else str(p.annotation).lower()
        name = p.name.lower()
        if 'str' in ann or name in ('s', 't', 'word', 'text', 'string', 'pattern'):
            return 'str'
        if ann in ("<class 'int'>", 'int') or name in ('target', 'k', 'n', 'x', 'num', 'val', 'value', 'm'):
            return 'int'
        if 'list' in ann or 'nums' in name or 'arr' in name or 'height' in name or 'prices' in name:
            return 'list'
        return 'auto'

    kinds = [kind(p) for p in params]
    auto_count = kinds.count('auto')
    if auto_count:
        # decide unknown parameters: last unknown becomes int when others exist, else list/str
        for i, k in enumerate(kinds):
            if k == 'auto':
                if len(kinds) >= 2 and i == len(kinds) - 1:
                    kinds[i] = 'int'
                elif not nums or not __codeit_re.search(r'\\d', text):
                    kinds[i] = 'str'
                else:
                    kinds[i] = 'list'

    int_count = kinds.count('int')
    list_nums = nums[:len(nums) - int_count] if int_count else nums
    args = []
    int_idx = 0
    for k in kinds:
        if k == 'str':
            args.append(text)
        elif k == 'int':
            pos = len(nums) - (int_count - int_idx)
            args.append(nums[pos] if 0 <= pos < len(nums) else 0)
            int_idx += 1
        else:
            args.append(list(list_nums))

    res = fn(*args)
    if isinstance(res, bool):
        print('true' if res else 'false')
    elif isinstance(res, (list, tuple)):
        if res and isinstance(res[0], (list, tuple)):
            print('\\n'.join(' '.join(str(x) for x in row) for row in res))
        else:
            print(' '.join(str(x) for x in res))
    elif res is not None:
        print(res)

if __name__ == '__main__':
    __codeit_main()
`;

function wrapPythonIfNeeded(code) {
  if (/\bif\s+__name__\s*==\s*['"]__main__['"]/.test(code)) return code;
  if (/\bsys\.stdin\b|\binput\s*\(/.test(code)) return code;
  if (!/\bclass\s+Solution\b/.test(code)) return code;
  return code + PYTHON_DRIVER;
}

// --------------------------------------------------------- JavaScript -----
const JS_DRIVER = `

;(function __codeitMain() {
  const fs = require("fs");
  let raw = "";
  try { raw = fs.readFileSync(0, "utf8"); } catch (e) { raw = ""; }
  let nums = (raw.match(/-?\\d+/g) || []).map(Number);
  let text = raw.trim();
  const m = text.match(/^\\s*[A-Za-z_]\\w*\\s*=\\s*([\\s\\S]*)$/);
  if (m) text = m[1].trim();
  if (text.length >= 2 && (text[0] === '"' || text[0] === "'") && text[text.length - 1] === text[0]) text = text.slice(1, -1);
  const lines = raw.split(/\\r?\\n/).filter((l) => l.trim());
  if (lines.length && /^\\s*-?\\d+\\s*$/.test(lines[0]) && nums.length >= 2) {
    const n = nums[0];
    const rest = nums.length - 1;
    if (n >= 0 && (rest === n || rest === n + 1)) nums = nums.slice(1);
  }

  let fn = null;
  let arity = 0;
  let paramNames = [];
  if (typeof Solution === "function") {
    const sol = new Solution();
    const proto = Solution.prototype;
    const names = Object.getOwnPropertyNames(proto).filter((n) => n !== "constructor" && typeof proto[n] === "function");
    if (names.length) {
      fn = proto[names[0]].bind(sol);
      arity = proto[names[0]].length;
      const src = proto[names[0]].toString();
      const pm = src.match(/\\(([^)]*)\\)/);
      paramNames = pm ? pm[1].split(",").map((s) => s.trim().split("=")[0].trim()).filter(Boolean) : [];
    }
  } else if (typeof __codeitFn === "function") {
    fn = __codeitFn;
    arity = __codeitFn.length;
    const pm = __codeitFn.toString().match(/\\(([^)]*)\\)/);
    paramNames = pm ? pm[1].split(",").map((s) => s.trim().split("=")[0].trim()).filter(Boolean) : [];
  }
  if (!fn) return;

  const kinds = [];
  for (let i = 0; i < arity; i++) {
    const name = (paramNames[i] || "").toLowerCase();
    if (["s", "t", "word", "text", "string", "pattern", "str"].includes(name)) kinds.push("str");
    else if (["target", "k", "n", "x", "num", "val", "value", "m"].includes(name)) kinds.push("int");
    else if (/nums|arr|height|prices|list/.test(name)) kinds.push("list");
    else kinds.push("auto");
  }
  for (let i = 0; i < kinds.length; i++) {
    if (kinds[i] !== "auto") continue;
    if (kinds.length >= 2 && i === kinds.length - 1) kinds[i] = "int";
    else if (!nums.length || !/\\d/.test(text)) kinds[i] = "str";
    else kinds[i] = "list";
  }
  const intCount = kinds.filter((k) => k === "int").length;
  const listNums = intCount ? nums.slice(0, nums.length - intCount) : nums;
  const args = [];
  let intIdx = 0;
  for (const k of kinds) {
    if (k === "str") args.push(text);
    else if (k === "int") { const pos = nums.length - (intCount - intIdx); args.push(pos >= 0 ? nums[pos] : 0); intIdx++; }
    else args.push(listNums.slice());
  }

  const res = fn(...args);
  const fmt = (v) => {
    if (typeof v === "boolean") return v ? "true" : "false";
    if (Array.isArray(v)) {
      if (v.length && Array.isArray(v[0])) return v.map((row) => row.map(fmt).join(" ")).join("\\n");
      return v.map(fmt).join(" ");
    }
    if (v === null || v === undefined) return "";
    if (typeof v === "object") return JSON.stringify(v);
    return String(v);
  };
  if (res !== undefined) console.log(fmt(res));
})();
`;

function wrapJavaScriptIfNeeded(code) {
  if (/process\.stdin|readline|readFileSync|\/dev\/stdin/.test(code)) return code;
  if (/\bclass\s+Solution\b/.test(code)) return code + JS_DRIVER;
  // single top-level function without any output: call it with parsed stdin
  if (!/console\.log/.test(code)) {
    const fnMatch = code.match(/^\s*(?:function\s+([A-Za-z_]\w*)|(?:const|let|var)\s+([A-Za-z_]\w*)\s*=\s*(?:\([^)]*\)|[A-Za-z_]\w*)\s*=>)/m);
    const name = fnMatch && (fnMatch[1] || fnMatch[2]);
    if (name) return code + `\nconst __codeitFn = ${name};` + JS_DRIVER;
  }
  return code;
}

// --------------------------------------------------------------- Java -----
const JAVA_DRIVER = `

public class Main {
    public static void main(String[] __args) throws Exception {
        java.util.Scanner __sc = new java.util.Scanner(System.in);
        StringBuilder __sb = new StringBuilder();
        java.util.List<String> __lines = new java.util.ArrayList<>();
        while (__sc.hasNextLine()) { String l = __sc.nextLine(); __lines.add(l); __sb.append(l).append('\\n'); }
        String raw = __sb.toString();
        java.util.List<Long> nums = new java.util.ArrayList<>();
        java.util.regex.Matcher __m = java.util.regex.Pattern.compile("-?\\\\d+").matcher(raw);
        while (__m.find()) nums.add(Long.parseLong(__m.group()));
        String text = raw.trim();
        java.util.regex.Matcher __eq = java.util.regex.Pattern.compile("^\\\\s*[A-Za-z_]\\\\w*\\\\s*=\\\\s*([\\\\s\\\\S]*)$").matcher(text);
        if (__eq.find()) text = __eq.group(1).trim();
        if (text.length() >= 2 && (text.charAt(0) == '"' || text.charAt(0) == '\\'') && text.charAt(text.length() - 1) == text.charAt(0)) text = text.substring(1, text.length() - 1);
        String __first = null;
        for (String l : __lines) if (!l.trim().isEmpty()) { __first = l; break; }
        if (__first != null && __first.trim().matches("-?\\\\d+") && nums.size() >= 2) {
            long n = nums.get(0);
            int rest = nums.size() - 1;
            if (n >= 0 && (rest == n || rest == n + 1)) nums.remove(0);
        }

        Solution sol = new Solution();
        java.lang.reflect.Method target = null;
        for (java.lang.reflect.Method m : Solution.class.getDeclaredMethods()) {
            int mod = m.getModifiers();
            if (java.lang.reflect.Modifier.isPublic(mod) && !java.lang.reflect.Modifier.isStatic(mod) && !m.isSynthetic()) { target = m; break; }
        }
        if (target == null) return;
        Class<?>[] types = target.getParameterTypes();
        int intCount = 0;
        for (Class<?> t : types) if (t == int.class || t == long.class || t == Integer.class || t == Long.class) intCount++;
        int listLen = Math.max(0, nums.size() - intCount);
        Object[] argv = new Object[types.length];
        int intIdx = 0;
        for (int i = 0; i < types.length; i++) {
            Class<?> t = types[i];
            if (t == int[].class) { int[] a = new int[listLen]; for (int j = 0; j < listLen; j++) a[j] = nums.get(j).intValue(); argv[i] = a; }
            else if (t == long[].class) { long[] a = new long[listLen]; for (int j = 0; j < listLen; j++) a[j] = nums.get(j); argv[i] = a; }
            else if (t == Integer[].class) { Integer[] a = new Integer[listLen]; for (int j = 0; j < listLen; j++) a[j] = nums.get(j).intValue(); argv[i] = a; }
            else if (java.util.List.class.isAssignableFrom(t)) { java.util.List<Integer> a = new java.util.ArrayList<>(); for (int j = 0; j < listLen; j++) a.add(nums.get(j).intValue()); argv[i] = a; }
            else if (t == String.class) argv[i] = text;
            else if (t == char[].class) argv[i] = text.toCharArray();
            else if (t == int.class || t == Integer.class) { int pos = nums.size() - (intCount - intIdx); argv[i] = pos >= 0 ? nums.get(pos).intValue() : 0; intIdx++; }
            else if (t == long.class || t == Long.class) { int pos = nums.size() - (intCount - intIdx); argv[i] = pos >= 0 ? nums.get(pos) : 0L; intIdx++; }
            else if (t == boolean.class) argv[i] = text.trim().equalsIgnoreCase("true");
            else if (t == double.class) argv[i] = Double.parseDouble(text.trim());
            else throw new RuntimeException("Unsupported parameter type for auto driver: " + t.getName());
        }
        Object res = target.invoke(sol, argv);
        if (target.getReturnType() == void.class) return;
        System.out.println(__format(res));
    }

    static String __format(Object v) {
        if (v == null) return "";
        if (v instanceof Boolean) return ((Boolean) v) ? "true" : "false";
        if (v instanceof int[]) { int[] a = (int[]) v; StringBuilder b = new StringBuilder(); for (int i = 0; i < a.length; i++) { if (i > 0) b.append(' '); b.append(a[i]); } return b.toString(); }
        if (v instanceof long[]) { long[] a = (long[]) v; StringBuilder b = new StringBuilder(); for (int i = 0; i < a.length; i++) { if (i > 0) b.append(' '); b.append(a[i]); } return b.toString(); }
        if (v instanceof int[][]) { int[][] a = (int[][]) v; StringBuilder b = new StringBuilder(); for (int i = 0; i < a.length; i++) { if (i > 0) b.append('\\n'); b.append(__format(a[i])); } return b.toString(); }
        if (v instanceof Object[]) { Object[] a = (Object[]) v; StringBuilder b = new StringBuilder(); for (int i = 0; i < a.length; i++) { if (i > 0) b.append(' '); b.append(__format(a[i])); } return b.toString(); }
        if (v instanceof java.util.List) { StringBuilder b = new StringBuilder(); int i = 0; for (Object o : (java.util.List<?>) v) { if (i++ > 0) b.append(' '); b.append(__format(o)); } return b.toString(); }
        return String.valueOf(v);
    }
}
`;

// returns { code, className } where className is the class that owns main()
function wrapJavaIfNeeded(code) {
  if (/public\s+static\s+void\s+main\s*\(/.test(code)) {
    const publicClass = code.match(/public\s+(?:final\s+)?class\s+([A-Za-z_]\w*)/);
    return { code, className: publicClass ? publicClass[1] : "Main" };
  }
  if (!/\bclass\s+Solution\b/.test(code)) {
    return { code, className: "Main" };
  }
  // Main must be the only public class in Main.java
  const withoutPublic = code.replace(/public\s+(?=(?:final\s+)?class\s+Solution\b)/, "");
  return { code: withoutPublic + JAVA_DRIVER, className: "Main" };
}

module.exports = {
  wrapCppIfNeeded,
  wrapPythonIfNeeded,
  wrapJavaScriptIfNeeded,
  wrapJavaIfNeeded,
};
