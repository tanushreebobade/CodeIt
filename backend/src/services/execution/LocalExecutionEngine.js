const fs = require("fs");
const os = require("os");
const path = require("path");
const crypto = require("crypto");
const { spawn, spawnSync } = require("child_process");
const {
  wrapCppIfNeeded,
  wrapPythonIfNeeded,
  wrapJavaScriptIfNeeded,
  wrapJavaIfNeeded,
} = require("./codeDrivers");

// runs user code with the compilers / runtimes installed on this machine.
// supported: cpp (g++), c (gcc), python, java (javac + java), javascript (node)

const COMPILE_TIMEOUT_MS = 20000;
const RUN_TIMEOUT_MS = 5000;
const MAX_OUTPUT_BYTES = 64 * 1024;
const WORK_ROOT = path.join(os.tmpdir(), "codeit-exec");

const isWindows = process.platform === "win32";

const normalizeLanguage = (language) => {
  const key = String(language || "").toLowerCase();
  if (key === "c++" || key === "cpp") return "cpp";
  if (key === "c") return "c";
  if (key === "py" || key === "python" || key === "python3") return "python";
  if (key === "js" || key === "javascript" || key === "nodejs" || key === "node") return "javascript";
  if (key === "java") return "java";
  return null;
};

// resolve an executable name to an absolute path by scanning PATH
const resolveOnPath = (name) => {
  if (path.isAbsolute(name) && fs.existsSync(name)) return name;
  const dirs = (process.env.PATH || "").split(path.delimiter).filter(Boolean);
  const exts = isWindows ? ["", ".exe", ".cmd", ".bat"] : [""];
  for (const dir of dirs) {
    for (const ext of exts) {
      const candidate = path.join(dir, name + ext);
      try {
        if (fs.statSync(candidate).isFile()) return candidate;
      } catch (err) {
        // keep looking
      }
    }
  }
  return null;
};

// child processes get the tool's own directory first on PATH. this avoids dll
// conflicts on windows (e.g. git's mingw64/bin shadowing msys2's compiler dlls)
const childEnvFor = (toolPath) => {
  const env = { ...process.env };
  if (toolPath && path.isAbsolute(toolPath)) {
    env.PATH = path.dirname(toolPath) + path.delimiter + (process.env.PATH || "");
    env.Path = env.PATH;
  }
  return env;
};

// find a working executable among candidates (cached)
const toolCache = new Map();
const findTool = (candidates, versionArgs = ["--version"]) => {
  const cacheKey = candidates.join("|");
  if (toolCache.has(cacheKey)) return toolCache.get(cacheKey);
  let found = null;
  for (const candidate of candidates) {
    const resolved = resolveOnPath(candidate);
    if (!resolved) continue;
    try {
      const result = spawnSync(resolved, versionArgs, {
        encoding: "utf8",
        timeout: 5000,
        windowsHide: true,
        env: childEnvFor(resolved),
      });
      if (!result.error && (result.status === 0 || (result.stdout + result.stderr).trim())) {
        found = resolved;
        break;
      }
    } catch (err) {
      // try the next candidate
    }
  }
  toolCache.set(cacheKey, found);
  return found;
};

const toolchains = {
  cpp: () => findTool(["g++", "clang++"]),
  c: () => findTool(["gcc", "clang"]),
  python: () => findTool(isWindows ? ["python", "python3", "py"] : ["python3", "python"]),
  javascript: () => process.execPath,
  javac: () => findTool(["javac"], ["-version"]),
  java: () => findTool(["java"], ["-version"]),
};

const supports = (language) => {
  const lang = normalizeLanguage(language);
  if (!lang) return false;
  if (lang === "java") return Boolean(toolchains.javac() && toolchains.java());
  return Boolean(toolchains[lang]());
};

const availableLanguages = () =>
  ["cpp", "c", "python", "java", "javascript"].filter((lang) => supports(lang));

// spawn a process with stdin, timeout and bounded output capture
const runProcess = (command, args, { cwd, stdin = "", timeoutMs, env }) =>
  new Promise((resolve) => {
    const startedAt = process.hrtime.bigint();
    let stdout = "";
    let stderr = "";
    let truncated = false;
    let timedOut = false;
    let settled = false;

    let child;
    try {
      child = spawn(command, args, { cwd, windowsHide: true, stdio: ["pipe", "pipe", "pipe"], env: env || process.env });
    } catch (err) {
      return resolve({ stdout: "", stderr: err.message, code: -1, timedOut: false, durationMs: 0, spawnError: err });
    }

    const timer = setTimeout(() => {
      timedOut = true;
      try {
        if (isWindows) {
          spawnSync("taskkill", ["/pid", String(child.pid), "/T", "/F"], { windowsHide: true });
        } else {
          child.kill("SIGKILL");
        }
      } catch (err) {
        // ignore
      }
    }, timeoutMs);

    const append = (chunk, target) => {
      if (target === "out") {
        if (stdout.length < MAX_OUTPUT_BYTES) stdout += chunk;
        else truncated = true;
      } else if (stderr.length < MAX_OUTPUT_BYTES) {
        stderr += chunk;
      }
    };

    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk) => append(chunk, "out"));
    child.stderr.on("data", (chunk) => append(chunk, "err"));

    const finish = (code, spawnError) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      const durationMs = Number(process.hrtime.bigint() - startedAt) / 1e6;
      resolve({ stdout, stderr, code, timedOut, durationMs, truncated, spawnError });
    };

    child.on("error", (err) => finish(-1, err));
    child.on("close", (code) => finish(code));

    child.stdin.on("error", () => {
      // the process may exit before consuming stdin; that's fine
    });
    try {
      child.stdin.write(stdin || "");
      child.stdin.end();
    } catch (err) {
      // ignore
    }
  });

const makeWorkDir = () => {
  const dir = path.join(WORK_ROOT, crypto.randomBytes(8).toString("hex"));
  fs.mkdirSync(dir, { recursive: true });
  return dir;
};

const cleanupWorkDir = (dir) => {
  fs.rm(dir, { recursive: true, force: true }, () => {});
};

const cleanStderr = (text, workDir) => {
  if (!text) return "";
  // hide temp paths from the user
  const escaped = workDir.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return text.replace(new RegExp(escaped + "[\\\\/]?", "g"), "").trim();
};

const buildResult = ({ status, output, error, durationMs, exitCode }) => ({
  status, // success | compile_error | runtime_error | time_limit | engine_error
  output: output || "",
  error: error || null,
  statusCode: status === "success" ? 200 : status === "time_limit" ? 408 : 400,
  cpuTime: Math.round(durationMs || 0),
  memory: 0,
  exitCode,
});

const execute = async (code, language, stdin = "") => {
  const lang = normalizeLanguage(language);
  if (!lang || !supports(lang)) {
    return buildResult({
      status: "engine_error",
      error: `Language "${language}" is not available on this server.`,
      durationMs: 0,
    });
  }

  const workDir = makeWorkDir();
  try {
    let compileStep = null;
    let runStep = null;

    if (lang === "cpp" || lang === "c") {
      const isCpp = lang === "cpp";
      const compiler = toolchains[lang]();
      const src = path.join(workDir, isCpp ? "main.cpp" : "main.c");
      const exe = path.join(workDir, isWindows ? "main.exe" : "main");
      fs.writeFileSync(src, isCpp ? wrapCppIfNeeded(code) : code, "utf8");
      const flags = isCpp ? ["-std=c++17", "-O2", src, "-o", exe] : ["-O2", src, "-o", exe, "-lm"];
      compileStep = { command: compiler, args: flags, env: childEnvFor(compiler) };
      // the produced binary may depend on the compiler's runtime dlls
      runStep = { command: exe, args: [], env: childEnvFor(compiler) };
    } else if (lang === "python") {
      const src = path.join(workDir, "main.py");
      fs.writeFileSync(src, wrapPythonIfNeeded(code), "utf8");
      const python = toolchains.python();
      runStep = { command: python, args: ["-u", src], env: childEnvFor(python) };
    } else if (lang === "javascript") {
      const src = path.join(workDir, "main.js");
      fs.writeFileSync(src, wrapJavaScriptIfNeeded(code), "utf8");
      runStep = { command: process.execPath, args: ["--stack-size=4096", src] };
    } else if (lang === "java") {
      const { code: finalCode, className } = wrapJavaIfNeeded(code);
      const src = path.join(workDir, `${className}.java`);
      fs.writeFileSync(src, finalCode, "utf8");
      const javac = toolchains.javac();
      const java = toolchains.java();
      compileStep = { command: javac, args: ["-d", workDir, "-encoding", "UTF-8", src], env: childEnvFor(javac) };
      runStep = { command: java, args: ["-Xss64m", "-cp", workDir, className], env: childEnvFor(java) };
    }

    if (compileStep) {
      const compiled = await runProcess(compileStep.command, compileStep.args, {
        cwd: workDir,
        timeoutMs: COMPILE_TIMEOUT_MS,
        env: compileStep.env,
      });
      if (compiled.spawnError) {
        return buildResult({ status: "engine_error", error: `Compiler failed to start: ${compiled.spawnError.message}`, durationMs: 0 });
      }
      if (compiled.timedOut) {
        return buildResult({ status: "compile_error", error: "Compilation timed out", durationMs: compiled.durationMs });
      }
      if (compiled.code !== 0) {
        const message = cleanStderr(compiled.stderr || compiled.stdout, workDir) || "Compilation failed";
        return buildResult({ status: "compile_error", output: message, error: message, durationMs: compiled.durationMs, exitCode: compiled.code });
      }
    }

    const ran = await runProcess(runStep.command, runStep.args, {
      cwd: workDir,
      stdin,
      timeoutMs: RUN_TIMEOUT_MS,
      env: runStep.env,
    });

    if (ran.spawnError) {
      return buildResult({ status: "engine_error", error: `Runtime failed to start: ${ran.spawnError.message}`, durationMs: 0 });
    }
    if (ran.timedOut) {
      return buildResult({
        status: "time_limit",
        output: ran.stdout,
        error: `Time Limit Exceeded (${RUN_TIMEOUT_MS / 1000}s)`,
        durationMs: ran.durationMs,
      });
    }

    const stderr = cleanStderr(ran.stderr, workDir);
    if (ran.code !== 0) {
      const message = stderr || `Process exited with code ${ran.code}`;
      return buildResult({
        status: "runtime_error",
        output: ran.stdout,
        error: message,
        durationMs: ran.durationMs,
        exitCode: ran.code,
      });
    }

    let output = ran.stdout;
    if (ran.truncated) output += "\n... [output truncated]";
    return buildResult({
      status: "success",
      output,
      error: null,
      durationMs: ran.durationMs,
      exitCode: 0,
    });
  } catch (err) {
    return buildResult({ status: "engine_error", error: err.message, durationMs: 0 });
  } finally {
    cleanupWorkDir(workDir);
  }
};

module.exports = {
  execute,
  supports,
  availableLanguages,
  normalizeLanguage,
  RUN_TIMEOUT_MS,
};
