#!/usr/bin/env python3
"""
einvoiceops IP gate scanner.
Runs against public-facing source files before every deploy.
Exit 0 = clean. Exit 1 = critical or high violation found.
"""

import argparse
import os
import re
import sys
import yaml

PATTERNS_FILE = ".github/ip-protection/patterns.yaml"

# Since 2026-10-15 the whole repository is scanned, not only src and public: the internal
# notes that leaked sat in scripts, the instructions file and code comments as well.
SCAN_DIRS = ["."]
SCAN_EXTENSIONS = {".astro", ".md", ".mdx", ".yaml", ".yml", ".json", ".js", ".mjs", ".cjs",
                   ".ts", ".css", ".html", ".txt", ".sh", ".py", ".toml"}

# The two files that hold the patterns and the scanner itself cannot scan clean by design.
EXCLUDED_PATHS = {
    ".github/ip-protection/patterns.yaml",
    ".github/scripts/ip_scanner.py",
    "package-lock.json",
}

# Files excluded by name regardless of directory
EXCLUDED_FILES = {"status.astro", "cockpit.astro"}

# Directories excluded entirely
EXCLUDED_DIRS = {"node_modules", "dist", ".astro", ".git", "src/styles"}


def load_patterns(private_file=None):
    with open(PATTERNS_FILE, "r", encoding="utf-8") as f:
        config = yaml.safe_load(f)
    # Names of customers and prospects are matched from a list kept outside this repository.
    # Same rule format as the public file. Absent in CI, present on the working machine.
    if private_file:
        with open(private_file, "r", encoding="utf-8") as f:
            private = yaml.safe_load(f) or {}
        config["rules"] = list(config.get("rules", [])) + list(private.get("rules", []))
        config["exceptions"] = list(config.get("exceptions", [])) + list(private.get("exceptions", []))
        config["_private_rules"] = len(private.get("rules", []))
    return config


def is_excluded(path):
    norm = os.path.normpath(path).replace("\\", "/")
    if norm in EXCLUDED_PATHS:
        return True
    parts = path.replace("\\", "/").split("/")
    filename = parts[-1]
    if filename in EXCLUDED_FILES:
        return True
    for excluded_dir in EXCLUDED_DIRS:
        if excluded_dir in parts:
            return True
    return False


def is_exception(line, path, exceptions, rule_id=None):
    for ex in exceptions:
        if ex.get("rule") and ex.get("rule") != rule_id:
            continue
        if ex.get("regex"):
            ex_file = ex.get("file", "")
            file_suffix = ex.get("file_suffix", "")
            if ex_file and not path.endswith(ex_file):
                continue
            if file_suffix and not path.endswith(file_suffix):
                continue
            if re.search(ex["regex"], line, re.IGNORECASE):
                return True
            continue
        pattern = ex.get("pattern", "")
        if pattern == "*":
            ex_file = ex.get("file", "")
            if ex_file and path.endswith(ex_file):
                return True
            continue
        file_suffix = ex.get("file_suffix", "")
        ex_file = ex.get("file", "")
        if ex_file and not path.endswith(ex_file):
            continue
        if file_suffix and not path.endswith(file_suffix):
            continue
        if pattern.lower() in line.lower():
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
    else:
        return pattern in line


def github_annotation(severity, path, line_num, rule_id, description):
    level = "error" if severity in ("critical", "high") else "warning"
    title = f"IP Gate {rule_id} ({severity.upper()})"
    print(f"::{level} file={path},line={line_num},title={title}::{description}")


def scan(config, list_hits=False):
    rules = config.get("rules", [])
    exceptions = config.get("exceptions", [])
    violations = 0
    findings = []

    for scan_dir in SCAN_DIRS:
        if not os.path.isdir(scan_dir):
            continue
        for root, dirs, files in os.walk(scan_dir):
            # Prune excluded dirs in-place so os.walk skips them
            dirs[:] = [d for d in dirs if d not in EXCLUDED_DIRS]
            for filename in files:
                filepath = os.path.join(root, filename)
                _, ext = os.path.splitext(filename)
                if ext not in SCAN_EXTENSIONS:
                    continue
                if is_excluded(filepath):
                    continue

                try:
                    with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
                        lines = f.readlines()
                except (OSError, IOError):
                    continue

                for line_num, line in enumerate(lines, start=1):
                    for rule in rules:
                        if not matches_rule(line, rule):
                            continue
                        if is_exception(line, filepath, exceptions, rule.get("id")):
                            continue
                        severity = rule.get("severity", "medium")
                        rule_id = rule.get("id", "IP-???")
                        description = rule.get("description", "IP gate violation.")
                        github_annotation(severity, filepath, line_num, rule_id, description)
                        if list_hits:
                            print(f"HIT {os.path.normpath(filepath)}:{line_num} {rule_id} {severity}: {line.strip()[:140]}")
                        findings.append((severity, filepath, line_num, rule_id))
                        if severity in ("critical", "high"):
                            violations += 1

    return violations, findings


def print_summary(violations, findings):
    if not findings:
        print("IP gate: CLEAN — no violations found.")
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
                    help="private rule file (names of customers and prospects), kept outside the repository")
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
