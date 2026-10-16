#!/usr/bin/env python3
"""
einvoiceops IP gate scanner.
Runs against the whole repository before every deploy and before every commit.
Exit 0 = clean. Exit 1 = critical or high violation found, or the rule file is malformed.

Hardening added 2026-10-16 (row 1339):
  - every text file is scanned, whatever its extension (binary files are skipped by content);
  - lines are normalised before matching: compatibility forms folded, zero-width and other
    invisible format characters removed, every space-like character turned into a plain space;
  - path rules (patterns.yaml, path_rules) fail on a forbidden file or folder by path alone;
  - every exception must name the rule it relaxes (a rule-less exception would switch off all
    rules for a line) and the loader rejects one that does not;
  - exclusions are real paths from the repository root, not names that match at any depth.
"""

import argparse
import os
import re
import subprocess
import sys
import unicodedata
import yaml

PATTERNS_FILE = ".github/ip-protection/patterns.yaml"

# Everything under the repository root is scanned.
SCAN_DIRS = ["."]

# Binary formats are skipped by extension; anything else is read and skipped only if it holds NUL bytes.
BINARY_EXTENSIONS = {
    ".png", ".jpg", ".jpeg", ".gif", ".webp", ".avif", ".ico", ".bmp", ".tiff",
    ".woff", ".woff2", ".ttf", ".otf", ".eot", ".pdf", ".zip", ".gz", ".tgz",
    ".mp4", ".mov", ".webm", ".mp3", ".wav", ".wasm",
}

# Real paths from the repository root. The scanner and the rule file hold the trigger words by design.
EXCLUDED_PATHS = {
    ".github/ip-protection/patterns.yaml",
    ".github/scripts/ip_scanner.py",
    "package-lock.json",
    ".git",  # in a linked worktree this is a one-line file holding a machine path
    # Local-only pages: gitignored, never in the CI checkout. Excluded at these exact paths only;
    # the same file name anywhere else is scanned, and a tracked copy fails the path rule.
    "src/pages/status.astro",
    "src/pages/cockpit.astro",
}

# Directories excluded, at the repository root only. A folder of the same name deeper in the tree is scanned.
EXCLUDED_ROOT_DIRS = {"node_modules", "dist", ".astro", ".git"}

_ENTITY_SPACE = re.compile(r"&(?:nbsp|ensp|emsp|thinsp|#160|#x0*a0|#8194|#8195|#8201);", re.IGNORECASE)
_ENTITY_INVISIBLE = re.compile(
    r"&(?:shy|zwnj|zwj|#173|#x0*ad|#8203|#x200b|#8204|#x200c|#8205|#x200d|#8288|#x2060|#65279|#xfeff);",
    re.IGNORECASE,
)


def normalize(line):
    """Fold the forms a person could use to slip a phrase past a regex."""
    line = _ENTITY_INVISIBLE.sub("", line)
    line = _ENTITY_SPACE.sub(" ", line)
    line = unicodedata.normalize("NFKC", line)
    out = []
    for ch in line:
        cat = unicodedata.category(ch)
        if cat == "Cf":  # zero-width space and joiners, soft hyphen, BOM, bidi controls
            continue
        if cat == "Zs":  # no-break space and the other space forms
            out.append(" ")
            continue
        out.append(ch)
    return "".join(out)


def fail(message):
    print(f"::error::{message}")
    sys.exit(1)


def validate(config):
    """Reject a rule file in which an exception could switch off more than one rule."""
    rules = config.get("rules", []) or []
    ids = {r.get("id") for r in rules}
    for r in rules:
        if not r.get("id"):
            fail("IP gate rule without an id.")
    for ex in config.get("exceptions", []) or []:
        rule = ex.get("rule")
        label = ex.get("regex") or ex.get("pattern") or "?"
        if not rule:
            fail(f"IP gate exception has no 'rule:' key (it would switch off every rule on its line): {label}")
        for rid in ([rule] if isinstance(rule, str) else list(rule)):
            if rid not in ids:
                fail(f"IP gate exception names an unknown rule '{rid}': {label}")
        if not (ex.get("regex") or ex.get("pattern")):
            fail(f"IP gate exception has neither 'regex' nor 'pattern': {rule}")
    for pr in config.get("path_rules", []) or []:
        if not pr.get("id") or not pr.get("regex"):
            fail("IP gate path rule needs an id and a regex.")


def load_patterns(private_file=None):
    with open(PATTERNS_FILE, "r", encoding="utf-8") as f:
        config = yaml.safe_load(f)
    # Names of customers, prospects and the owner are matched from a list kept outside this repository.
    # Same rule format as the public file. Absent in CI, present on the working machine.
    if private_file:
        with open(private_file, "r", encoding="utf-8") as f:
            private = yaml.safe_load(f) or {}
        config["rules"] = list(config.get("rules", [])) + list(private.get("rules", []))
        config["exceptions"] = list(config.get("exceptions", [])) + list(private.get("exceptions", []))
        config["_private_rules"] = len(private.get("rules", []))
    validate(config)
    return config


def rel_path(path):
    norm = os.path.normpath(path).replace("\\", "/")
    return norm[2:] if norm.startswith("./") else norm


def is_excluded(path):
    return rel_path(path) in EXCLUDED_PATHS


def _applies(ex, rule_id):
    rule = ex.get("rule")
    return rule == rule_id if isinstance(rule, str) else rule_id in rule


def _in_scope(ex, rel):
    """File scoping: exact path, path prefix, or suffix."""
    if ex.get("path") and rel != ex["path"]:
        return False
    if ex.get("path_prefix") and not rel.startswith(ex["path_prefix"]):
        return False
    if ex.get("file") and not rel.endswith(ex["file"]):
        return False
    if ex.get("file_suffix") and not rel.endswith(ex["file_suffix"]):
        return False
    return True


def mask_line(line, path, exceptions, rule_id):
    """A masking exception removes only the text it matches, so the rest of the line is still tested.
    This is how an allowed span (a public address, a name in a contact block) is let through
    without letting a leak that shares its line through."""
    rel = rel_path(path)
    for ex in exceptions:
        if ex.get("mask") and ex.get("regex") and _applies(ex, rule_id) and _in_scope(ex, rel):
            line = re.sub(ex["regex"], " ", line, flags=re.IGNORECASE)
    return line


def is_exception(line, path, exceptions, rule_id):
    """Line-level exception: the whole line is let through for this one rule."""
    rel = rel_path(path)
    for ex in exceptions:
        if ex.get("mask") or not _applies(ex, rule_id) or not _in_scope(ex, rel):
            continue
        if ex.get("regex"):
            if re.search(ex["regex"], line, re.IGNORECASE):
                return True
            continue
        if ex.get("pattern", "").lower() in line.lower():
            return True
    return False


def matches_rule(line, rule):
    pattern = rule.get("pattern", "")
    rule_type = rule.get("type", "literal")
    flags = 0 if rule.get("case_sensitive") else re.IGNORECASE
    if rule_type == "regex":
        try:
            return bool(re.search(pattern, line, flags))
        except re.error:
            return False
    return pattern in line


def github_annotation(severity, path, line_num, rule_id, description):
    level = "error" if severity in ("critical", "high") else "warning"
    title = f"IP Gate {rule_id} ({severity.upper()})"
    print(f"::{level} file={path},line={line_num},title={title}::{description}")


def _git(*args):
    try:
        return subprocess.run(["git", *args], capture_output=True, text=True)
    except OSError:
        return None


def _is_repo_root():
    res = _git("rev-parse", "--show-toplevel")
    if res is None or res.returncode != 0:
        return False
    return os.path.realpath(res.stdout.strip()) == os.path.realpath(os.getcwd())


def path_is_harmless_locally(rel, repo_root):
    """A forbidden path that git ignores and does not track cannot reach a push, so a working
    checkout may hold it (the local link to the open-items list is exactly that). Outside a git
    checkout, such as the CI export or a scratch copy, nothing is ignored and the path fails."""
    if not repo_root:
        return False
    tracked = _git("ls-files", "--error-unmatch", "--", rel)
    if tracked is not None and tracked.returncode == 0:
        return False
    ignored = _git("check-ignore", "-q", "--", rel)
    return ignored is not None and ignored.returncode == 0


def scan(config, list_hits=False):
    rules = config.get("rules", [])
    exceptions = config.get("exceptions", [])
    path_rules = config.get("path_rules", []) or []
    violations = 0
    findings = []
    repo_root = _is_repo_root() if path_rules else False
    reported_dirs = set()

    def record(severity, rel, line_num, rule_id, description, shown=""):
        nonlocal violations
        github_annotation(severity, rel, line_num, rule_id, description)
        if list_hits:
            print(f"HIT {rel}:{line_num} {rule_id} {severity}: {shown[:140]}")
        findings.append((severity, rel, line_num, rule_id))
        if severity in ("critical", "high"):
            violations += 1

    def check_path(rel, is_dir):
        for pr in path_rules:
            if not re.search(pr["regex"], rel, re.IGNORECASE):
                continue
            if any(rel.startswith(d + "/") and rid == pr["id"] for rid, d in reported_dirs):
                continue
            if path_is_harmless_locally(rel, repo_root):
                continue
            if is_dir:
                reported_dirs.add((pr["id"], rel))
            record(pr.get("severity", "high"), rel, 0, pr["id"], pr.get("description", "Forbidden path."), "(path)")

    for scan_dir in SCAN_DIRS:
        if not os.path.isdir(scan_dir):
            continue
        for root, dirs, files in os.walk(scan_dir):
            root_rel = rel_path(root)
            # Prune excluded folders in place, at the repository root only.
            if root_rel == ".":
                dirs[:] = [d for d in dirs if d not in EXCLUDED_ROOT_DIRS]
            for d in sorted(dirs):  # symlinked folders are listed here though os.walk does not enter them
                check_path(rel_path(os.path.join(root, d)), True)
            for filename in files:
                filepath = os.path.join(root, filename)
                rel = rel_path(filepath)
                check_path(rel, False)  # path rules apply even to a path whose content is not scanned
                if rel in EXCLUDED_PATHS:
                    continue
                _, ext = os.path.splitext(filename)
                if ext.lower() in BINARY_EXTENSIONS:
                    continue
                try:
                    with open(filepath, "rb") as f:
                        raw = f.read()
                except (OSError, IOError):
                    continue
                if b"\0" in raw[:8192]:
                    continue
                lines = raw.decode("utf-8", errors="ignore").splitlines()
                withhold = filename.startswith(".env")
                for line_num, raw_line in enumerate(lines, start=1):
                    line = normalize(raw_line)
                    for rule in rules:
                        rule_id = rule.get("id", "IP-???")
                        tested = mask_line(line, filepath, exceptions, rule_id)
                        if not matches_rule(tested, rule):
                            continue
                        if is_exception(tested, filepath, exceptions, rule_id):
                            continue
                        shown = "[line withheld]" if withhold else raw_line.strip()
                        record(rule.get("severity", "medium"), rel, line_num, rule_id,
                               rule.get("description", "IP gate violation."), shown)

    return violations, findings


def print_summary(violations, findings):
    if not findings:
        print("IP gate: CLEAN - no violations found.")
        return

    critical = sum(1 for s, *_ in findings if s == "critical")
    high = sum(1 for s, *_ in findings if s == "high")
    medium = sum(1 for s, *_ in findings if s == "medium")

    print(f"\nIP gate summary: {len(findings)} finding(s)")
    if critical:
        print(f"  CRITICAL: {critical}")
    if high:
        print(f"  HIGH:     {high}")
    if medium:
        print(f"  MEDIUM:   {medium} (warning only)")

    if violations > 0:
        print(f"\nBlocking deploy: {violations} critical/high violation(s) must be resolved.")
    else:
        print("\nNo blocking violations. Medium findings logged as warnings.")


if __name__ == "__main__":
    if not os.path.exists(PATTERNS_FILE):
        print(f"::error::IP gate patterns file not found: {PATTERNS_FILE}")
        sys.exit(1)

    ap = argparse.ArgumentParser()
    ap.add_argument("--private", default=os.environ.get("IP_GATE_PRIVATE_PATTERNS"),
                    help="private rule file (names of people, customers and prospects), kept outside the repository")
    ap.add_argument("--list", action="store_true", help="print every hit as file:line")
    args = ap.parse_args()
    if args.private and not os.path.exists(args.private):
        print(f"::error::private pattern file not found: {args.private}")
        sys.exit(1)
    config = load_patterns(args.private)
    if args.private:
        print(f"IP gate: private list loaded, {config.get('_private_rules', 0)} rule(s).")
    violations, findings = scan(config, args.list)
    print_summary(violations, findings)
    sys.exit(1 if violations > 0 else 0)
