#!/bin/bash
# Install local git hooks for the einvoiceops website repo.
# Run once after cloning, with the path of the private name-scan script as the argument
# (or in EINVOICEOPS_NAME_SCAN):
#
#   bash .github/setup-hooks.sh /path/to/website-name-scan.py
#
# Two hooks are installed, both into the shared hooks folder (so every worktree has them):
#   pre-commit  runs the public IP gate over the repository and blocks the commit on a violation.
#   pre-push    runs the public IP gate and then the private name scan (the names of people,
#               customers and prospects, which this public repo may not hold) and blocks the push
#               on any hit. It also blocks when the name-scan script cannot be found or run, so a
#               missing script is never mistaken for a clean scan.
# The location of the name-scan script is stored in the local git config as einvoiceops.namescan.
# To bypass in an emergency: git commit --no-verify / git push --no-verify (use sparingly).

set -e
cd "$(git rev-parse --show-toplevel)"
HOOKS_DIR="$(cd "$(git rev-parse --git-path hooks)" && pwd)"

NAME_SCAN="${1:-${EINVOICEOPS_NAME_SCAN:-$(git config --get einvoiceops.namescan || true)}}"
if [ -z "$NAME_SCAN" ] || [ ! -f "$NAME_SCAN" ]; then
  echo "Name-scan script not found. Give its path:  bash .github/setup-hooks.sh /path/to/website-name-scan.py"
  exit 1
fi
git config einvoiceops.namescan "$NAME_SCAN"

cat > "$HOOKS_DIR/pre-commit" << 'HOOK'
#!/bin/bash
# IP gate pre-commit hook: blocks commits containing IP violations.
REPO_ROOT="$(git rev-parse --show-toplevel)"
SCANNER="$REPO_ROOT/.github/scripts/ip_scanner.py"

if [ ! -f "$SCANNER" ]; then
  echo "IP gate: scanner not found at $SCANNER, skipping"
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
  echo "IP gate: pyyaml not available, skipping scan (run: pip install pyyaml)"
  exit 0
fi

cd "$REPO_ROOT"
echo "IP gate: scanning the repository..."
$PYTHON -I "$SCANNER"
RESULT=$?

if [ $RESULT -ne 0 ]; then
  echo ""
  echo "IP gate BLOCKED this commit. Fix the violations above, then try again."
  exit 1
fi
HOOK

cat > "$HOOKS_DIR/pre-push" << 'HOOK'
#!/bin/bash
# Pre-push: public IP gate, then the private name scan. Blocks the push on any hit or any failure to run.
# It scans the working tree of the checkout the push is made from.
REPO_ROOT="$(git rev-parse --show-toplevel)"
NAME_SCAN="$(git config --get einvoiceops.namescan)"

block() {
  echo ""
  echo "PUSH BLOCKED: $1"
  echo "Fix it and push again. (git push --no-verify skips this check; use it only knowingly.)"
  exit 1
}

PYTHON=""
if [ -f "$HOME/.skills-venv/bin/python" ]; then
  PYTHON="$HOME/.skills-venv/bin/python"
elif command -v python3 &>/dev/null; then
  python3 -c "import yaml" 2>/dev/null && PYTHON="python3"
fi
[ -n "$PYTHON" ] || block "no Python with PyYAML found, so the scans cannot run."

cd "$REPO_ROOT"
echo "Pre-push: public IP gate..."
$PYTHON -I .github/scripts/ip_scanner.py || block "the public IP gate found a violation."

[ -n "$NAME_SCAN" ] && [ -f "$NAME_SCAN" ] || block "the name-scan script is not configured or not found (git config einvoiceops.namescan). Re-run: bash .github/setup-hooks.sh /path/to/website-name-scan.py"
echo "Pre-push: name scan..."
$PYTHON "$NAME_SCAN" "$REPO_ROOT" || block "the name scan found a name that may not be in this repository (or could not run)."
echo "Pre-push: both scans clean."
HOOK

chmod +x "$HOOKS_DIR/pre-commit" "$HOOKS_DIR/pre-push"
echo "pre-commit and pre-push hooks installed in $HOOKS_DIR"
echo "  name scan: $NAME_SCAN"
