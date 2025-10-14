# Orchestra

Equip Claude with a comprehensive skills library of proven techniques, patterns, and tools.

This builds on the great work provided at [superpowers](https://github.com/obra/superpowers), extending with support for multiple skills sources

## Architecture

The plugin is a shim that:
- Clones/updates configured repos 
- Registers hooks that load skills from the local repository clones
- Offers users the option to fork the skills repos for contributions

## What You Get

- **Testing Skills** - TDD, async testing, anti-patterns
- **Debugging Skills** - Systematic debugging, root cause tracing, verification
- **Collaboration Skills** - Brainstorming, planning, code review, parallel agents
- **Meta Skills** - Creating, testing, and contributing skills

Plus:
- **Slash Commands** - `/brainstorm`, `/write-plan`, `/execute-plan`
- **Skills Search** - Grep-powered discovery of relevant skills
- **Gap Tracking** - Failed searches logged for skill creation

## Learn More

Read the introduction: [Superpowers for Claude Code](https://blog.fsck.com/2025/10/09/superpowers/)

## Installation

### Install the plugin

Run the following (note at time of writing the slash command doesn't work in the vs code extension):
```bash
claude /plugin
```
- Select "add marketplace"
- Enter https://github.com/tmoxon/orchestra
- Agree to set it up
- Follow instructions to install orchestra
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

## Updating Skills

The plugin fetches and fast-forwards your local skills repository on each session start. If your local branch has diverged, Claude notifies you to use the pulling-updates-from-skills-repository skill.

## Contributing Skills

If you forked the skills repository during setup, you can contribute improvements:

1. Edit skills in `~/.config/orchestra/skills/`
2. Commit your changes
3. Push to your fork
4. Open a PR to `obra/orchestra-core-skills`

## Quick Start

### Finding Skills

Find skills before starting any task:

```bash
${ORCHESTRA_SKILLS}/skills/using-skills/find-skills              # All skills with descriptions
${ORCHESTRA_SKILLS}/skills/using-skills/find-skills test         # Filter by pattern
${ORCHESTRA_SKILLS}/skills/using-skills/find-skills 'TDD|debug'  # Regex pattern
```

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
${ORCHESTRA_SKILLS}/skills/using-skills/find-skills              # Show all skills
${ORCHESTRA_SKILLS}/skills/using-skills/find-skills pattern      # Search skills
${ORCHESTRA_SKILLS}/skills/using-skills/skill-run <path> [args]  # Run any skill script
```

## How It Works

1. **SessionStart Hook** - Clone/update skills repo, inject skills context
2. **Skills Discovery** - `find-skills` shows all available skills with descriptions
3. **Mandatory Workflow** - Skills become required when they exist for your task
4. **Gap Tracking** - Failed searches logged for skill development

## Philosophy

- **Test-Driven Development** - Write tests first, always
- **Systematic over ad-hoc** - Process over guessing
- **Complexity reduction** - Simplicity as primary goal
- **Evidence over claims** - Verify before declaring success
- **Domain over implementation** - Work at problem level, not solution level

## Troubleshooting

### Windows Path Handling

On Windows, the plugin uses Git Bash to execute hook scripts. The hooks have been configured to work cross-platform by:
- Using `cd` to change to the plugin directory before executing scripts
- Using `$CLAUDE_PLUGIN_ROOT` environment variable when available
- Avoiding direct Windows path interpolation in bash commands

If you encounter path-related errors, ensure you have Git Bash installed (comes with Git for Windows).

### Permissions Error

If the plugin reports a permissions error executing the shell script, you can explicitly set permissions on the .sh files:

```bash
chmod +x ~/.claude/plugins/cache/orchestra/hooks/session-start.sh
chmod +x ~/.claude/plugins/cache/orchestra/lib/initialize-skills.sh
```

Then reload VS Code. If that still doesn't work, try running session-start.sh directly to debug.

### Uninstalling / Reinstalling plugins

There appear to be bugs in handling plugins through the marketplace connections. If you run into problems and can't uninstall it, then:

1. Delete the folder ~/.config/orchestra
1. Delete the folder ~/.claude/plugins/cache/orchestra
1. Update the file ~/.claude/settings.json to remove orchestra
1. Restart vs code / claude



## License

MIT License - see LICENSE file for details
