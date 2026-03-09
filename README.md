<p align="center">
  <h1 align="center">ClarityGuard</h1>
  <p align="center">
    <strong>Static analysis security scanner for Clarity smart contracts on Stacks</strong>
  </p>
  <p align="center">
    <a href="https://okekefrancis112.github.io/ClarityGuard/">Live Demo</a> &middot;
    <a href="#installation">Installation</a> &middot;
    <a href="#usage">Usage</a> &middot;
    <a href="#detectors">Detectors</a> &middot;
    <a href="#ci-cd-integration">CI/CD</a> &middot;
    <a href="#contributing">Contributing</a>
  </p>
</p>

---

ClarityGuard detects security vulnerabilities in [Clarity](https://docs.stacks.co/clarity) smart contracts **before** they reach mainnet. It parses Clarity source code into an AST, runs pluggable vulnerability detectors, and produces actionable reports with severity ratings, line numbers, and fix recommendations.

## Why ClarityGuard?

Solidity has 15+ mature security tools (Slither, Mythril, Echidna, etc.). Clarity — securing **$545M+ in DeFi TVL** across protocols like Zest, Granite, BitFlow, StackingDAO, and ALEX — has far fewer options. ClarityGuard is purpose-built for Clarity's decidable, non-Turing-complete design, enabling more precise analysis than generic tools.

### Key Features

- **10 vulnerability detectors** spanning critical to informational severity
- **Zero runtime dependencies** — lightweight and fast
- **Colored terminal output** with severity-coded findings
- **JSON export** for CI/CD pipeline integration
- **Recursive directory scanning** for multi-contract projects
- **Pluggable architecture** — easy to add custom detectors
- **Actionable reports** with detailed fix recommendations
- **[Live web playground](https://okekefrancis112.github.io/ClarityGuard/)** — try it in your browser, no install needed

## Installation

### From npm

```bash
npm install -g clarityguard
```

### From source

```bash
git clone https://github.com/your-username/clarityguard.git
cd clarityguard
npm install
npm run build
```

## Usage

### Scan a single contract

```bash
clarityguard scan contracts/token.clar
```

### Scan an entire directory

```bash
clarityguard scan contracts/
```

### Output JSON for CI/CD

```bash
clarityguard scan contracts/ --json > report.json
```

### List all available detectors

```bash
clarityguard detectors
```

### Help & version

```bash
clarityguard --help
clarityguard --version
```

### Exit Codes

| Code | Meaning |
|------|---------|
| `0`  | No critical or high severity findings |
| `1`  | Critical or high severity findings detected |

## Detectors

ClarityGuard ships with **10 detectors** across 5 severity levels:

### CRITICAL

| Detector | Description |
|----------|-------------|
| `unprotected-admin` | Public functions modifying state without checking `tx-sender` or `contract-caller` for authorization |

### HIGH

| Detector | Description |
|----------|-------------|
| `unsafe-unwrap` | Use of `unwrap-panic` / `unwrap-err-panic` which abort transactions with no error info |
| `unchecked-external-calls` | Calls to external contracts via `contract-call?` where the response isn't validated |

### MEDIUM

| Detector | Description |
|----------|-------------|
| `division-before-multiplication` | `(* (/ a b) c)` patterns causing precision loss in integer arithmetic |
| `block-height-timing` | Using `block-height` for time-sensitive logic (block times are variable on Stacks) |
| `tx-sender-in-assert` | Using `tx-sender` in authorization checks instead of `contract-caller` (relay attack risk) |
| `missing-input-validation` | Public functions with numeric parameters lacking bounds checking |

### LOW

| Detector | Description |
|----------|-------------|
| `hardcoded-principals` | Hardcoded principal addresses outside of constants (fragile, hard to maintain) |

### INFO

| Detector | Description |
|----------|-------------|
| `dead-code` | Private functions, constants, or data-vars that are never referenced |
| `todo-comments` | `TODO`, `FIXME`, `HACK`, `XXX`, `BUG`, or `WARNING` comments left in code |

## Example Output

### Terminal

```
ClarityGuard v0.1.0 — Clarity Smart Contract Security Scanner

Scanning: contracts/token.clar

[!!!] CRITICAL: Unprotected Admin Function (line 12, col 1)
      Public function 'mint' modifies state without authorization check.
      Fix: Add (asserts! (is-eq contract-caller CONTRACT_OWNER) (err u401))

[!!]  HIGH: Unsafe Unwrap (line 34, col 5)
      'unwrap-panic' will abort the transaction with no error information.
      Fix: Replace with (unwrap! value (err u100)) for graceful error handling.

[!]   MEDIUM: Division Before Multiplication (line 45, col 8)
      Division before multiplication causes precision loss in integer math.
      Fix: Reorder to (* c (/ a b)) or multiply first: (/ (* a c) b).

Summary: 3 findings (1 critical, 1 high, 1 medium)
```

### JSON

```json
{
  "scanner": "clarityguard",
  "version": "0.1.0",
  "files": ["contracts/token.clar"],
  "summary": {
    "total": 3,
    "critical": 1,
    "high": 1,
    "medium": 1,
    "low": 0,
    "info": 0
  },
  "findings": [
    {
      "detector": "unprotected-admin",
      "severity": "CRITICAL",
      "message": "Public function 'mint' modifies state without authorization check.",
      "file": "contracts/token.clar",
      "line": 12,
      "column": 1,
      "recommendation": "Add (asserts! (is-eq contract-caller CONTRACT_OWNER) (err u401))"
    }
  ]
}
```

## Architecture

```
src/
├── index.ts              CLI entry point & argument parsing
├── parser.ts             S-expression tokenizer & recursive descent parser
├── analyzer.ts           Orchestrates detectors across the AST
├── reporter.ts           Terminal (ANSI) & JSON output formatting
└── detectors/
    ├── index.ts           Detector interface & registry
    ├── unprotected-admin.ts
    ├── unsafe-unwrap.ts
    ├── division-before-multiplication.ts
    ├── block-height-timing.ts
    ├── tx-sender-in-assert.ts
    ├── hardcoded-principals.ts
    ├── unchecked-external-calls.ts
    ├── missing-input-validation.ts
    ├── dead-code.ts
    └── todo-comments.ts
```

### How It Works

1. **Parse** — The parser tokenizes Clarity source code and builds an AST of `ClarityNode` objects, preserving line/column positions for precise error reporting.
2. **Analyze** — The analyzer runs each registered detector against the AST. Detectors implement a simple interface: `detect(ast, sourceCode) → Finding[]`.
3. **Report** — Findings are sorted by severity then line number, and rendered as colored terminal output or structured JSON.

### Writing a Custom Detector

Every detector implements the `Detector` interface:

```typescript
import { Detector, Finding } from './index';
import { ClarityNode } from '../parser';

export const myDetector: Detector = {
  id: 'my-detector',
  name: 'My Custom Detector',
  severity: 'MEDIUM',
  description: 'Detects a specific vulnerability pattern.',

  detect(ast: ClarityNode[], source: string): Finding[] {
    const findings: Finding[] = [];
    // Walk the AST and push findings
    return findings;
  }
};
```

Register it in `src/detectors/index.ts` and it will run automatically on every scan.

## CI/CD Integration

### GitHub Actions

```yaml
name: Clarity Security Scan

on: [push, pull_request]

jobs:
  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm install -g clarityguard
      - run: clarityguard scan contracts/ --json > report.json
      - name: Check for critical findings
        run: |
          if [ $? -ne 0 ]; then
            echo "Security issues found! Check report.json"
            exit 1
          fi
```

### Using JSON Output

Pipe the JSON report into any CI/CD system, dashboard, or notification service:

```bash
clarityguard scan contracts/ --json | jq '.summary'
```

## Testing

Run against the included test fixtures:

```bash
npm test
```

This scans the sample contracts in `test/samples/`:

- **`vulnerable-token.clar`** — Deliberately vulnerable contract with 21+ findings across all detector types
- **`safe-token.clar`** — Well-written contract following best practices (minimal findings)

## Roadmap

### Milestone 1 — Production Scanner (20 Detectors)
- Harden AST parser for edge cases
- Expand to 20 detectors:
  - Post-condition analysis
  - Reentrancy-adjacent patterns
  - Flash loan attack vectors
  - Token approval vulnerabilities
  - Unsafe arithmetic patterns
  - Map/data-var access analysis
  - Uninitialized data variables
  - Excessive permission scope
  - Contract upgrade safety
  - Cross-function data flow
- Test against real mainnet contracts (ALEX, Zest, Granite, BitFlow, StackingDAO)
- Publish to npm registry

### Milestone 2 — Web Dashboard & CI/CD
- **Next.js web dashboard** — Upload `.clar` files or paste code for instant analysis
- **GitHub Action** — Auto-scan on PRs, block merges on critical findings, inline comments
- **Documentation site** — Detector catalog, integration guides, best practices

### Stretch Goals
- Property-based fuzzing engine (Echidna-style for Clarity)
- VS Code extension with inline warnings
- Community detector plugin system
- Formal verification primitives
- Mainnet contract scanning via Stacks API

## Success Metrics

- **20 vulnerability detectors** shipping in a production-quality scanner
- **npm package** with 50+ installs in the first month
- **Web dashboard** with 100+ contract scans in the first month
- **GitHub Action** integrated into at least 3 Stacks project repos
- **5+ real mainnet contracts** scanned with published results
- **Documentation site** live with detector catalog and integration guides
- **Community engagement** — at least one Stacks Forum post showcasing results
- **Maintenance plan** — Quarterly detector updates, community PRs reviewed within 48 hours, Clarity version compatibility maintained

## Contributing

Contributions are welcome! ClarityGuard uses a pluggable detector architecture, making it straightforward to add new vulnerability rules.

1. Fork the repository
2. Create your feature branch (`git checkout -b feat/new-detector`)
3. Add your detector in `src/detectors/`
4. Register it in `src/detectors/index.ts`
5. Add test cases in `test/samples/`
6. Submit a pull request

Community PRs are reviewed within 48 hours.

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Language | TypeScript 5.3+ |
| Runtime | Node.js 20+ |
| Build | `tsc` (zero bundler overhead) |
| Dependencies | **None** (zero runtime deps) |
| Output | ANSI terminal / JSON |

## License

[MIT](LICENSE)

---

<p align="center">
  Built to secure the Stacks ecosystem.
</p>
