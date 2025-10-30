const fs = require("fs/promises");
const fssync = require("fs");
const path = require("path");
const crypto = require("crypto");
const globLib = require("glob");
const { spawn } = require("child_process");

// helper: get file list under `srcDir`
async function getFileList(srcDir) {
  if (typeof globLib.glob === "function") {
    // glob >=10 promise API
    return globLib.glob("**/*", { cwd: srcDir, nodir: true, dot: true });
  }

  // legacy callback API
  return new Promise((resolve, reject) => {
    globLib("**/*", { cwd: srcDir, nodir: true, dot: true }, (err, matches) => {
      if (err) reject(err);
      else resolve(matches);
    });
  });
}

async function applySteps(steps, repoRoot) {
  for (const step of steps) {
    if (step.kind === "writeFiles") {
      await applyScaffold(repoRoot, step.from, step.to, step.overwrite);
    }
    if (step.kind === "applyPatch") {
      await applyPatch(repoRoot, step.file, step.patch);
    }
    if (step.kind === "npmInstall") {
      console.log("[npmInstall] (not yet implemented in this barebones version)", step.packages);
    }
  }
}

async function applyScaffold(root, fromRel, toRel, overwrite) {
  const srcDir = path.join(root, fromRel);
  const dstDir = path.join(root, toRel);

  const files = await getFileList(srcDir);

  await fs.mkdir(dstDir, { recursive: true });

  for (const rel of files) {
    const absSrc = path.join(srcDir, rel);
    const absDst = path.join(dstDir, rel);

    await fs.mkdir(path.dirname(absDst), { recursive: true });

    const exists = fssync.existsSync(absDst);
    if (!overwrite && exists) {
      const [a, b] = await Promise.all([
        fs.readFile(absSrc),
        fs.readFile(absDst)
      ]);

      if (hash(a) === hash(b)) {
        console.log(`[scaffold] skip (identical) ${absDst}`);
        continue;
      }
    }

    await fs.copyFile(absSrc, absDst);
    console.log(`[scaffold] wrote ${absDst}`);
  }
}

async function applyPatch(root, fileRel, patchText) {
  const abs = path.join(root, fileRel);
  const original = await fs.readFile(abs, "utf8");

  // STEP 1: try git apply first (proper structured patch)
  const gitApplied = await tryGitApply(root, patchText + "\n");
  if (gitApplied) {
    console.log("[patch] applied via git apply");
    return;
  }

  // STEP 2: fallback to "surgical" replace using +/- lines
  const lines = patchText.split("\n");
  const removedLine = lines.find(l => l.startsWith("-") && !l.startsWith("---"));
  const addedLine   = lines.find(l => l.startsWith("+") && !l.startsWith("+++"));

  if (!removedLine || !addedLine) {
    throw new Error("[patch] malformed patch hunk, cannot find +/- lines");
  }

  const beforeText = removedLine.slice(1);
  const afterText  = addedLine.slice(1);

  // already applied?
  if (original.includes(afterText)) {
    console.log("[patch] already applied (afterText already present)");
    return;
  }

  // direct replace (first occurrence)
  if (original.includes(beforeText)) {
    const updated = original.replace(beforeText, afterText);
    await fs.writeFile(abs, updated, "utf8");
    console.log("[patch] applied via fallback replace");
    return;
  }

  // Couldn't land it with git or fallback
  console.log("[patch] fallback failed. Debug info:");
  console.log("  beforeText:", JSON.stringify(beforeText));
  console.log("  file head :", JSON.stringify(original.slice(0, 200)));
  throw new Error("[patch] failed to apply patch (git apply failed, no fallback match)");
}

function tryGitApply(root, patchTextWithNewline) {
  return new Promise(resolve => {
    const child = spawn("git", ["apply", "-p1", "--whitespace=fix"], {
      cwd: root,
      stdio: ["pipe", "pipe", "pipe"]
    });

    let stderrData = "";
    child.stderr.on("data", chunk => {
      stderrData += chunk.toString();
    });

    child.on("close", code => {
      if (code === 0 && !stderrData.trim()) {
        resolve(true);
      } else {
        console.log("[patch] git apply failed or warned:", stderrData.trim());
        resolve(false);
      }
    });

    // send the patch content and close stdin
    child.stdin.write(patchTextWithNewline);
    child.stdin.end();
  });
}

function hash(buf) {
  return crypto.createHash("sha256").update(buf).digest("hex");
}

module.exports = { applySteps };
