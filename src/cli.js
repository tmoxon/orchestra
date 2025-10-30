#!/usr/bin/env node

const path = require("path");
const { loadSpec } = require("./spec");
const { buildPlan, printPlan } = require("./plan");
const { applySteps } = require("./apply");

async function main() {
  const args = process.argv.slice(2);

  // defaults:
  let repoRoot = "/target";
  let dryRun = false;
  let apply = false;

  // parse args
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--repo") {
      repoRoot = args[i + 1];
      i++;
    } else if (args[i] === "--dry-run") {
      dryRun = true;
    } else if (args[i] === "--apply") {
      apply = true;
    }
  }

  const absRepo = path.resolve(repoRoot);
  console.log(`[uni-cli] using repo ${absRepo}`);

  // 1. load spec from claude.md
  const spec = await loadSpec(absRepo);

  // 2. turn actions into plan steps
  const plan = buildPlan(spec);

  // 3. show plan always
  printPlan(plan);

  // 4. if --apply, actually execute it
  if (apply) {
    await applySteps(plan, absRepo);
    console.log("[uni-cli] apply complete");
  } else if (dryRun) {
    console.log("[uni-cli] dry run only (no changes written)");
  } else {
    console.log("[uni-cli] neither --apply nor --dry-run was given");
  }
}

main().catch(err => {
  console.error("[uni-cli] ERROR", err);
  process.exit(1);
});