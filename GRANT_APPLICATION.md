# ClarityGuard — Grant Application (Getting Started Track)

> Stacks Endowment — Getting Started Program Track
> Funding Request: $10,000 in STX

---

## Project Name

**ClarityGuard** — Security Scanner for Clarity Smart Contracts

---

## Problem Statement

The Stacks ecosystem secures over $545M in sBTC TVL across DeFi protocols like Zest ($75.9M), Granite ($19.9M), and StackingDAO (100M+ STX). These protocols run on Clarity smart contracts — yet the security tooling available to Clarity developers is critically underdeveloped.

**Solidity has 15+ mature open-source security tools** (Slither, Mythril, Echidna, Foundry's fuzzer, Certora, Manticore, and more). **Clarity has 2**: Clarinet's built-in checks and STACY by CoinFabrik, which detects only 6-7 basic patterns.

There is no:
- Comprehensive vulnerability scanner (like Slither)
- Fuzzing tool (like Echidna)
- Formal verification framework (like Certora)
- Automated CI/CD security gate for Clarity contracts

The Stacks Endowment already spends $100K-$150K per protocol on bug bounties (BitFlow, Zest, Granite, StackingDAO). **A preventive tool that catches vulnerabilities before deployment would save orders of magnitude more** and raise the security baseline for every Clarity developer.

---

## Solution

**ClarityGuard** is a comprehensive static analysis security scanner for Clarity smart contracts. It parses Clarity source code into an AST and runs pluggable vulnerability detectors across the codebase.

### What It Does

1. **Parses Clarity contracts** into an Abstract Syntax Tree (S-expression parser)
2. **Runs 10+ vulnerability detectors** covering:
   - **Critical**: Unprotected admin/state-modifying functions
   - **High**: Unsafe `unwrap-panic` usage, unchecked external contract calls
   - **Medium**: Division before multiplication (precision loss), block-height timing issues, `tx-sender` relay attack vectors, missing input validation
   - **Low**: Hardcoded principals
   - **Info**: Dead code, TODO/FIXME comments
3. **Outputs actionable reports** with severity ratings, line numbers, and fix recommendations
4. **Supports multiple output formats**: Colored terminal output for developers, JSON for CI/CD pipelines

### Technical Architecture

```
CLI / Web Upload → Clarity S-Expression Parser (AST)
                          ↓
                ┌─────────┼─────────┐
           Static       Pattern     Source
          Analysis      Matcher     Scanner
         (data flow)  (known vulns)  (comments)
                          ↓
                Security Report (Terminal / JSON)
```

### Working Prototype

A functional prototype is already built and operational:
- Custom Clarity S-expression parser
- 10 vulnerability detectors
- CLI tool with colored terminal output and JSON export
- Tested against sample contracts (21 findings detected in a vulnerable contract, 1 advisory in a safe contract)

GitHub repository: [To be published upon grant approval]

---

## Milestones

### Milestone 1 (Weeks 1-4): Core Scanner + 20 Detectors
**Deliverable:** Production-quality scanner with 20 vulnerability detection rules

- Harden the Clarity AST parser for edge cases and complex contracts
- Implement 10 additional detectors:
  - Post-condition analysis
  - Reentrancy-adjacent patterns (inter-contract state dependencies)
  - Flash loan attack vectors
  - Token approval/allowance vulnerabilities
  - Unsafe arithmetic patterns beyond div-before-mul
  - Map/data-var access pattern analysis
  - Uninitialized data variable usage
  - Excessive permission scope
  - Contract upgrade safety checks
  - Cross-function data flow analysis
- Test against real mainnet contracts (ALEX, Zest, Granite, BitFlow, StackingDAO)
- Publish npm package: `npm install -g clarityguard`

**Payment: 50% ($5,000 STX)**

### Milestone 2 (Weeks 5-8): Web Dashboard + CI/CD Integration
**Deliverable:** Web interface and GitHub integration for automated scanning

- Build web dashboard (Next.js):
  - Upload .clar files or paste contract code
  - Visual security report with severity breakdown
  - Comparison view for before/after fixes
- GitHub Action for CI/CD:
  - Auto-scan on pull requests
  - Block merges if critical/high issues found
  - Inline PR comments with findings
- Documentation site with:
  - Detector catalog with examples
  - Integration guides
  - Best practices for secure Clarity development

**Payment: 50% ($5,000 STX)**

### Stretch Goals (Post-Grant)
- Property-based fuzzing engine (Echidna-style)
- VS Code extension with inline warnings
- Community detector plugin system
- Formal verification primitives
- Scanning of deployed mainnet contracts via Stacks API

---

## Budget Breakdown ($10,000)

| Category | Amount | Details |
|----------|--------|---------|
| Development | $6,500 | Core scanner, detectors, web dashboard, GitHub Action |
| Infrastructure | $1,500 | Hosting (web dashboard), CI/CD compute, npm registry |
| Testing & Validation | $1,000 | Testing against mainnet contracts, community beta |
| Documentation | $500 | Detector catalog, integration guides, tutorial content |
| Contingency | $500 | Edge cases, parser hardening, unexpected complexity |
| **Total** | **$10,000** | |

---

## Why ClarityGuard Matters for the Stacks Ecosystem

### 1. The Security Gap is Real
- 2 Clarity security tools vs 15+ for Solidity
- $545M+ in sBTC TVL at risk
- $100-150K spent per protocol on bug bounties (reactive, not preventive)

### 2. Every Clarity Developer Benefits
- ClarityGuard is free, open-source, and integrates into existing workflows
- Works with Clarinet projects, standalone .clar files, and CI/CD pipelines
- Lowers the barrier to writing secure Clarity contracts

### 3. Institutional Confidence
- With Fireblocks (2,400+ institutional clients), BitGo, and Copper entering the Stacks ecosystem, institutional-grade security tooling is not optional — it's a prerequisite
- ClarityGuard provides auditable, automated security verification

### 4. Composable Ecosystem Value
- Other projects can build on ClarityGuard: IDE extensions, audit platforms, deployment gates
- Open detector plugin system allows the community to contribute new rules
- JSON output enables integration with any toolchain

---

## Team

[YOUR NAME]
- Full-stack developer with experience in TypeScript, Node.js, smart contract development
- Experienced with the Stacks ecosystem and Clarity
- Background in backend/API development, data analytics, and blockchain
- [Your GitHub / relevant links]

---

## Technical Proof of Concept

The prototype is fully functional. Here is a sample output scanning a vulnerable Clarity contract:

```
ClarityGuard v0.1.0 — Clarity Smart Contract Security Scanner
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

File: vulnerable-token.clar
──────────────────────────────────────────────

[!!!] #1 Unprotected state-modifying function: mint
     Severity: CRITICAL | Line: 14 | Detector: unprotected-admin
     Public function 'mint' modifies contract state but does not check
     tx-sender or contract-caller. Any address can call this function.
     Fix: Add (asserts! (is-eq tx-sender CONTRACT-OWNER) (err ERR-NOT-AUTHORIZED))

[!!]  #2 Unsafe unwrap-panic usage
     Severity: HIGH | Line: 56 | Detector: unsafe-unwrap
     'unwrap-panic' will abort the transaction on failure with no error
     information. This makes debugging difficult and can lock funds.
     Fix: Replace with 'unwrap!' or 'try!' for meaningful error responses.

[!]   #3 Division before multiplication (precision loss)
     Severity: MEDIUM | Line: 40 | Detector: division-before-multiplication
     Fix: Reorder to multiply before dividing.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Summary
  Files scanned: 1
  Total findings: 21
  2 CRITICAL | 2 High | 12 Medium | 3 Low | 2 Info

  Action required: Fix critical and high severity issues before deployment.
```

---

## Links

- Prototype Repository: [To be published]
- npm Package: [To be published as `clarityguard`]
- Existing Clarity Security Tools (for context):
  - Clarinet: https://github.com/hirosystems/clarinet
  - STACY: https://github.com/CoinFabrik/stacy
