#!/bin/bash
# Switch uni skills branch for testing
# Usage: ./switch-skills-branch.sh [branch-name]

CONFIG_DIR=".uni"
CONFIG_FILE="$CONFIG_DIR/config.json"

# Function to get current branch
get_current_branch() {
    if [ -f "$CONFIG_FILE" ]; then
        grep '"skillsBranch"' "$CONFIG_FILE" 2>/dev/null | sed 's/.*"skillsBranch"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/' || echo 'main'
    else
        echo 'main'
    fi
}

# Show usage and current branch if no arguments
if [ -z "$1" ]; then
    echo "Usage: $0 <branch-name>"
    echo "Current branch: $(get_current_branch)"
    exit 1
fi

BRANCH="$1"

echo "Switching uni skills branch to: $BRANCH"

# Create config directory if it doesn't exist
mkdir -p "$CONFIG_DIR"

# Create or update config file
cat > "$CONFIG_FILE" << EOF
{
  "skillsBranch": "$BRANCH"
}
EOF

echo "✅ Skills branch set to: $BRANCH"
echo ""
echo "Changes will take effect on your next Claude session start."
echo "No container restart required - the configuration is read dynamically."