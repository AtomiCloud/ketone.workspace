---
id: deadcode
title: Deadcode Detection and Cleanup
---

# Deadcode Detection and Cleanup

This document describes the language-agnostic workflow for detecting and removing unused code.

## Overview

Deadcode detection helps maintain code hygiene by identifying and removing unused code. The specific tools vary by language, but the workflow remains consistent.

## Workflow

The deadcode workflow is language-agnostic:

1. **Run deadcode tool** - Use `pls deadcode` (configured per-project)
2. **Review output** - Tool outputs potential deadcode (not 100% accurate)
3. **Verify with LSP** - Use Language Server Protocol to confirm
4. **Document call chains** - For agent mode: document evidence for false positives
5. **Remove confirmed deadcode** - Delete unused code
6. **Test after removal** - Ensure nothing breaks

## Important: Test-Only Usage

**Functions only used by tests = deadcode**

If a function is only called by tests and not by production code, it should be removed. The tests for that function should also be removed.

## Running Deadcode Analysis

```bash
# Run deadcode detection
pls deadcode
```

The specific command is configured per-project based on the language and tooling.

## Language-Specific Tools

The deadcode tool varies by language:

| Language              | Example Tools            |
| --------------------- | ------------------------ |
| Go                    | `deadcode`, `unused`     |
| TypeScript/JavaScript | `ts-prune`, `unimported` |
| Python                | `vulture`, `flake8`      |
| Rust                  | `cargo-udeps`            |
| .NET                  | `Roslynator`             |

The `pls deadcode` command is configured in `Taskfile.yaml` based on the project's language.

## Verification

### LSP Verification

When available, use Language Server Protocol features:

1. Go to the suspected deadcode
2. Check "Find References" or "Call Hierarchy"
3. Verify no production code uses it

### Agent Mode Documentation

When using an agent (like Claude Code):

1. Document the full call chain as evidence
2. Include screenshots or output from "Find References"
3. Mark false positives clearly with evidence

## Example Workflow

```bash
# 1. Run deadcode detection
pls deadcode

# Output might show:
# unused_function.go:23: func unusedFunction is unused

# 2. Verify with LSP or grep
git grep -r "unusedFunction" --exclude-dir=vendor

# 3. If only found in tests, remove both:
# - Remove the function
# - Remove its tests

# 4. Run tests to ensure nothing breaks
pls test
```

## Summary

| Aspect             | Pattern                                    |
| ------------------ | ------------------------------------------ |
| **Command**        | `pls deadcode`                             |
| **Tool**           | Language-specific (configured in Taskfile) |
| **Verification**   | LSP "Find References" or grep              |
| **Test-only code** | Considered deadcode                        |
| **Agent mode**     | Document call chains as evidence           |
