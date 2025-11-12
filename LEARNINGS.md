# Learnings

## Uni-Core-Skills

The skills repository demonstrates how effective structured instructions can be for guiding AI behavior. Key observations:

### High Instruction Fidelity
- Claude follows skills instructions with high precision
- Changes to skill files are well understood and applied
- Instructions are interpreted literally and systematically - the AI doesn't "hallucinate" alternate interpretations

### Quality Foundation
The strong adherence likely stems from:
- Well-structured logical reasoning in the skills
- Clear, unambiguous instruction patterns
- Consistent terminology and formatting across skills
- Explicit workflow steps that leave little room for interpretation

### Performance Cost Trade-offs
The files tend to be very large:
- Longer skills files lead to increased token count as the agent reads them
- Each session start loads the full skills context

The trade-off between token cost and reliability appears acceptable so far, but more experience is needed to fully evaluate whether the resource usage is optimal for all use cases.

## Parallel Task Execution

The effectiveness of parallel task execution depends heavily on task dependencies and problem domain characteristics. 

**Current Capabilities:**
- The tool can analyze dependencies and create execution graphs
- Plans identify which tasks can run sequentially vs. in parallel
- Independent tasks (different domains, no shared files) can execute concurrently

**Challenges:**
- Tasks at the same architectural layer often have heavy interdependencies
- Vertical slice implementations may parallelize better than horizontal layers
- Optimal parallelization strategies vary significantly by problem domain

**Future Exploration:**
- More sophisticated dependency analysis
- Better heuristics for identifying parallelizable work
- Metrics to measure parallel execution effectiveness

## Windows and Claude Code

Claude Code does not handle bash script execution natively on Windows. The Claude CLI and skills system relies heavily on bash scripts (`.sh` files) which require a Unix-like environment to run properly.

This led to the decision to create a Docker environment that runs Linux, providing:
- Native bash script execution
- Consistent cross-platform development experience
- Pre-installed tooling (Git, Node.js, GitHub CLI, etc.)
- Isolated environment that matches production setups

Without Docker, Windows users would need WSL2 or Git Bash, and even then may encounter path translation and environment issues. The containerized approach eliminates these platform-specific complications.

## Project Loading

The `/target` directory allows loading external projects into the Uni development environment for analysis and development.

**Challenge:**
Making host machine projects visible and accessible within the Docker container proved more complex than initially anticipated. The core difficulty was establishing a dynamic connection between host directories and the container filesystem.

**Key Problems Encountered:**
1. **Static vs Dynamic Mounting** - Docker volumes are typically defined at container creation time in `docker-compose.yml`, making it difficult to dynamically load new projects without rebuilding
2. **Path Discovery** - The container needs to know what projects exist on the host filesystem, but has no native visibility into host directories

**Solution Approach:**
The solution uses environment variables and volume mounts to bridge host and container filesystems:

1. **Environment Variables:**
   - `${UNI_TARGET_SOURCE}` - Maps to the specific project directory on the host
   - `${UNI_HOST_ROOT}` - Provides broader host filesystem access for project discovery

2. **Volume Mount Strategy:**
   - Persistent `target_workspace` volume for container-side operations
   - Projects remain on host filesystem while being accessible in container

3. **Loading Mechanism:**
   - PowerShell script (`load-project.ps1`) handles the mounting configuration
   - Script copies project files from mounted host location into `/target` workspace

**Result:**
This implementation works around Docker's static volume limitation by using pre-mounted read-only access to host directories, then copying into a working volume. While not as elegant as true dynamic mounting, it:
- **Maintains Isolation** - Development happens in controlled container environment
- **Preserves Host Files** - Original projects remain untouched on host
- **Handles Windows Paths** - PowerShell script manages path translation