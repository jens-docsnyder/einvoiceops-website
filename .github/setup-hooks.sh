#!/bin/bash
# Install local git hooks for the einvoiceops website repo.
# Run once after cloning: bash .github/setup-hooks.sh

HOOKS_DIR="$(git rev-parse --show-toplevel)/.git/hooks"

cat > "$HOOKS_DIR/pre-commit" << 'HOOK'
#!/bin/bash
# IP gate pre-commit hook — blocks commits containing IP violations.
REPO_ROOT="$(git rev-parse --show-toplevel)"
SCANNER="$REPO_ROOT/.github/scripts/ip_scanner.py"

if [ ! -f "$SCANNER" ]; then
  echo "IP gate: scanner not found at $SCANNER — skipping"
  exit 0
fi

# Try venv first, fall back to system python3
PYTHON=""
if [ -f "$HOME/.skills-venv/bin/python" ]; then
  PYTHON="$HOME/.skills-venv/bin/python"
elif command -v python3 &>/dev/null; then
  python3 -c "import yaml" 2>/dev/null && PYTHON="python3"
fi

if [ -z "$PYTHON" ]; then
  echo "IP gate: pyyaml not available — skipping scan (run: pip install pyyaml)"
  exit 0
fi

cd "$REPO_ROOT"
echo "IP gate: scanning staged files..."
$PYTHON "$SCANNER"
RESULT=$?

if [ $RESULT -ne 0 ]; then
  echo ""
  echo "IP gate BLOCKED this commit. Fix the violations above, then try again."
  exit 1
fi
HOOK

chmod +x "$HOOKS_DIR/pre-commit"
echo "✓ pre-commit hook installed at $HOOKS_DIR/pre-commit"
echo "  Runs the IP gate scanner before every commit."
echo "  To bypass in an emergency: git commit --no-verify (use sparingly)"
