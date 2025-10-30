const fs = require("fs/promises");
const path = require("path");
const matter = require("gray-matter");
const yaml = require("js-yaml");

async function loadSpec(repoRoot) {
  const candidates = [
    "claude.md",
    path.join(".claude", "claude.yaml"),
    path.join(".claude", "claude.yml")
  ];

  for (const rel of candidates) {
    const full = path.join(repoRoot, rel);
    try {
      const raw = await fs.readFile(full, "utf8");

      if (rel.endsWith(".md")) {
        const parsed = matter(raw, {
          engines: { yaml: s => yaml.load(s) }
        });
        return parsed.data;
      } else {
        return yaml.load(raw);
      }
    } catch (err) {
      // ignore and try next candidate
    }
  }

  throw new Error(
    `Spec not found in ${repoRoot}. Expected claude.md or .claude/claude.yaml`
  );
}

module.exports = { loadSpec };