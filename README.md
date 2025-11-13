# Uni!

Equip Claude with a comprehensive skills library of proven techniques, patterns, and tools.

This builds on the great work provided at [superpowers](https://github.com/obra/superpowers), extending with support for multiple skills sources

> 💡 **For developers and contributors**, see [DEVELOPMENT.md](DEVELOPMENT.md) for architecture details, testing workflows, and contribution guidelines.
> 
> 📚 **For project insights and design decisions**, see [LEARNINGS.md](LEARNINGS.md) for lessons learned and implementation notes.

## What You Get

- **Testing Skills** - TDD, async testing, anti-patterns
- **Debugging Skills** - Systematic debugging, root cause tracing, verification
- **Collaboration Skills** - Brainstorming, planning, code review, parallel agents
- **Meta Skills** - Creating, testing, and contributing skills

Plus:
- **Slash Commands** - `/brainstorm`, `/create-adr`, `/write-plan`, `/execute-plan`
- **Skills Search** - Grep-powered discovery of relevant skills
- **Gap Tracking** - Failed searches logged for skill creation

## Learn More

Read the introduction: [Superpowers for Claude Code](https://blog.fsck.com/2025/10/09/superpowers/)

## Prerequisites

- **Python 3.11+** - Required for cross-platform compatibility
- **Git** - For skills repository management
- **Claude Code (VS Code Extension)** - Latest version

## Installation

### Install the plugin

Run the following (note at time of writing the slash command doesn't work in the vs code extension):
```bash
claude /plugin
```
- Select "add marketplace"
- Enter https://github.com/tmoxon/uni
- Agree to set it up
- Follow instructions to install uni
- Restart extensions

The plugin automatically handles skills repository setup on first run.

### Verify Installation

```bash
# Check that commands appear
/help

# Should see:
# /brainstorm - Interactive design refinement
# /write-plan - Create implementation plan
# /execute-plan - Execute plan in batches
```

## Quick Start

### Finding Skills

Find skills before starting any task:

```bash
${UNI_SKILLS}/skills/using-skills/find-skills              # All skills with descriptions
${UNI_SKILLS}/skills/using-skills/find-skills test         # Filter by pattern
${UNI_SKILLS}/skills/using-skills/find-skills 'TDD|debug'  # Regex pattern
```

### Environment Variables

Uni creates full paths to skill files that are available in Claude's session context. These are cross-platform compatible (Windows/macOS/Linux).

**Base Paths:**
```bash
${UNI_ROOT}    # Root directory (~/.config/uni)
${UNI_SKILLS}  # Core skills directory (~/.config/uni/core)
```

**Skill File Paths:**

On session start, Uni discovers all skills and provides their full paths via `UNI_SKILL_*` references in the session context.

For example:
- `UNI_SKILL_BRAINSTORMING` → Full path to brainstorming skill
- `UNI_SKILL_TEST_DRIVEN_DEVELOPMENT` → Full path to TDD skill
- `UNI_SKILL_SYSTEMATIC_DEBUGGING` → Full path to debugging skill

Commands reference these by asking Claude to look them up from the session context. All 32+ skill paths are listed at session start.

**Cross-Platform Compatibility:**

The Python-based session-start hook handles path normalization automatically:
- Windows: `C:/Users/.../.config/uni/core/skills/...`
- macOS/Linux: `/home/user/.config/uni/core/skills/...`
- Git Bash: Converts `/c/Users` to `C:/Users` automatically

### Using Slash Commands

**Brainstorm a design:**
```
/brainstorm
```

**Create an implementation plan:**
```
/write-plan
```

**Execute the plan:**
```
/execute-plan
```

## Working with GitHub Issues

Claude Code can work directly with GitHub issues during brainstorming sessions. Simply provide the repository URL and issue number:

**Example:**
```
/brainstorm
I want to work on https://github.com/tmoxon/uni issue #45
```

Claude will fetch the issue details and use them as context for:
- Understanding feature requests with full discussion
- Addressing bug reports with reproduction steps
- Planning work that's already documented

This works with any public GitHub repository. For private repositories, use the GitHub CLI to authenticate:

```bash
gh auth login
```

The GitHub CLI (`gh`) is included in the Uni Docker container.

## About claude.md Files

The `claude.md` file helps Claude understand your project conventions and setup.

**Location**: Place in your project root

**Purpose**: Documents project-specific context:
- Framework and language choices (React, Next.js, TypeScript, etc.)
- Coding conventions and patterns
- Build and test procedures
- Project structure and file organization

**Format**: Human-readable Markdown documentation with optional executable actions (JSON) for patches and dependencies.

Skills automatically read `claude.md` before generating code, ensuring consistency with your project's existing patterns and conventions.

## What's Inside

### Skills Library

**Testing** (`skills/testing/`)
- test-driven-development - RED-GREEN-REFACTOR cycle
- condition-based-waiting - Async test patterns
- testing-anti-patterns - Common pitfalls to avoid

**Debugging** (`skills/debugging/`)
- systematic-debugging - 4-phase root cause process
- root-cause-tracing - Find the real problem
- verification-before-completion - Ensure it's actually fixed
- defense-in-depth - Multiple validation layers

**Collaboration** (`skills/collaboration/`)
- brainstorming - Socratic design refinement
- writing-plans - Detailed implementation plans
- executing-plans - Batch execution with checkpoints
- dispatching-parallel-agents - Concurrent subagent workflows
- remembering-conversations - Search past work
- using-git-worktrees - Parallel development branches
- requesting-code-review - Pre-review checklist
- receiving-code-review - Responding to feedback

**Meta** (`skills/meta/`)
- writing-skills - TDD for documentation, create new skills
- sharing-skills - Contribute skills back via branch and PR
- testing-skills-with-subagents - Validate skill quality
- pulling-updates-from-skills-repository - Sync with upstream
- gardening-skills-wiki - Maintain and improve skills

### Commands

- **brainstorm.md** - Interactive design refinement using Socratic method
- **write-plan.md** - Create detailed implementation plans
- **execute-plan.md** - Execute plans in batches with review checkpoints

### Tools

- **find-skills** - Unified skill discovery with descriptions
- **skill-run** - Generic runner for any skill script
- **search-conversations** - Semantic search of past Claude sessions (in remembering-conversations skill)

**Using tools:**
```bash
${UNI_SKILLS}/skills/using-skills/find-skills              # Show all skills
${UNI_SKILLS}/skills/using-skills/find-skills pattern      # Search skills
${UNI_SKILLS}/skills/using-skills/skill-run <path> [args]  # Run any skill script
```

## Installation Troubleshooting

### Python Not Found

If you get "python command not found", ensure Python 3.11+ is installed and in your PATH:

**Windows:**
```powershell
python --version  # Should show 3.11 or higher
```

**Mac/Linux:**
```bash
python3 --version  # Should show 3.11 or higher
```

### Testing the Hook Manually

You can test the session-start hook directly:

```bash
# Windows
python hooks/session-start.py

# Mac/Linux
python3 hooks/session-start.py
```

This should output JSON with skill information.

### Uninstalling / Reinstalling

There appear to be bugs in handling plugins through the marketplace connections. If you run into problems and can't uninstall it:

**Use the automated script (Windows):**
```powershell
.\reinstall-plugin.ps1
```

The script will:
1. Remove ~/.config/uni directory
2. Clear ~/.claude/plugins/cache/uni
3. Remove ~/.claude/plugins/marketplaces/uni-marketplace
4. Clear project cache
5. Remove uni from settings.json

Then restart VS Code and reinstall via `/plugin`

**Manual cleanup (if script fails):**
1. Delete the folder ~/.config/uni
2. Delete the folder ~/.claude/plugins/cache/uni
3. Delete the folder ~/.claude/plugins/marketplaces/uni-marketplace
4. Delete the folder ~/.claude/projects/C--dev-uni (or similar project cache)
5. Edit ~/.claude/settings.json and remove the "uni@uni-marketplace" entry from "enabledPlugins"
6. Restart VS Code

## License

MIT License - see LICENSE file for details
