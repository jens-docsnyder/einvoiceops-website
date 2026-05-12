#!/usr/bin/env python3
"""
einvoiceops IP gate scanner.
Runs against public-facing source files before every deploy.
Exit 0 = clean. Exit 1 = critical or high violation found.
"""

import os
import re
import sys
import yaml

PATTERNS_FILE = ".github/ip-protection/patterns.yaml"

SCAN_DIRS = ["src", "public"]
SCAN_EXTENSIONS = {".astro", ".md", ".mdx", ".yaml", ".yml", ".json", ".js", ".ts"}

# Files excluded by name regardless of directory
EXCLUDED_FILES = {"status.astro", "cockpit.astro"}

# Directories excluded entirely
EXCLUDED_DIRS = {"node_modules", "dist", ".astro", "src/styles"}


def load_patterns():
    with open(PATTERNS_FILE, "r", encoding="utf-8") as f:
        return yaml.safe_load(f)


def is_excluded(path):
    parts = path.replace("\\", "/").split("/")
    filename = parts[-1]
    if filename in EXCLUDED_FILES:
        return True
    for excluded_dir in EXCLUDED_DIRS:
        if excluded_dir in parts:
            return True
    return False


def is_exception(line, path, exceptions):
    for ex in exceptions:
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
    if rule_type == "regex":
        try:
            return bool(re.search(pattern, line, re.IGNORECASE))
        except re.error:
            return False
    else:
        return pattern in line


def github_annotation(severity, path, line_num, rule_id, description):
    level = "error" if severity in ("critical", "high") else "warning"
    title = f"IP Gate {rule_id} ({severity.upper()})"
    print(f"::{level} file={path},line={line_num},title={title}::{description}")


def scan(config):
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
                        if is_exception(line, filepath, exceptions):
                            continue
                        severity = rule.get("severity", "medium")
                        rule_id = rule.get("id", "IP-???")
                        description = rule.get("description", "IP gate violation.")
                        github_annotation(severity, filepath, line_num, rule_id, description)
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

    config = load_patterns()
    violations, findings = scan(config)
    print_summary(violations, findings)
    sys.exit(1 if violations > 0 else 0)
