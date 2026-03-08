# Changelog

All notable changes to ClarityGuard are documented here.

Format: [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
Versioning: [Semantic Versioning](https://semver.org/spec/v2.0.0.html)

---

## [Unreleased]

### Added
- Full test suite with Vitest (parser unit tests, 10 detector unit tests, analyzer integration tests)
- GitHub Actions CI workflow (type check + test + build on Node 20 and 22)
- `test:coverage` script with v8 coverage provider
- `typecheck` script using `tsconfig.test.json`
- `files`, `engines`, `repository`, `bugs`, `homepage`, `author` fields in `package.json`
- `prepublishOnly` build hook
- `CONTRIBUTING.md`, `CHANGELOG.md`, `SECURITY.md`, `LICENSE`
- GitHub issue templates and PR template

---

## [0.1.0] — 2026-03-07

### Added
- Custom Clarity S-expression parser producing a typed AST with line/column positions
- 10 vulnerability detectors:
  - `unprotected-admin` (CRITICAL) — public functions modifying state without auth check
  - `unsafe-unwrap` (HIGH) — `unwrap-panic` / `unwrap-err-panic` usage
  - `unchecked-external-calls` (HIGH) — `contract-call?` responses not validated
  - `division-before-multiplication` (MEDIUM) — precision loss in integer math
  - `block-height-timing` (MEDIUM) — unreliable block-height for time-sensitive logic
  - `tx-sender-in-assert` (MEDIUM) — relay attack risk via `tx-sender` in `asserts!`
  - `missing-input-validation` (MEDIUM) — unvalidated numeric parameters
  - `hardcoded-principals` (LOW) — principal addresses outside constants
  - `dead-code` (INFO) — unused private functions, constants, data-vars
  - `todo-comments` (INFO) — TODO/FIXME/HACK/XXX/BUG/WARNING comments
- CLI tool with colored ANSI terminal output
- JSON export mode (`--json`) for CI/CD integration
- Exit codes: `0` = clean, `1` = critical/high findings
- Recursive directory scanning
- Zero runtime dependencies
