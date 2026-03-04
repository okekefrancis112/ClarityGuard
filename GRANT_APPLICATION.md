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

### How ClarityGuard Differs from Existing Tools

| Capability | Clarinet Built-ins | STACY (CoinFabrik) | **ClarityGuard** |
|---|---|---|---|
| Vulnerability detectors | Basic type/syntax checks | 6-7 patterns | **10 now, 20 by Milestone 1** |
| CI/CD integration | Limited | None | **Exit codes + JSON output + GitHub Action** |
| Web dashboard | No | No | **Planned (Milestone 2)** |
| Custom detectors | No | No | **Pluggable architecture** |
| Actionable fix recommendations | No | Partial | **Yes, per finding** |
| Open-source & free | Yes | Yes | **Yes (MIT license)** |
| Zero dependencies | No (Clarinet runtime) | No | **Yes** |

ClarityGuard is not a fork or wrapper around existing tools. It is built from the ground up with a custom S-expression parser and AST-based analysis pipeline specifically designed for Clarity's decidable, non-Turing-complete semantics.

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

GitHub repository: https://github.com/okekefrancis112/ClarityGuard

---

## Milestones

### Milestone 1 (Weeks 1-4 · Target: April 7 – May 2, 2026): Core Scanner + 20 Detectors
**Deliverable:** Production-quality scanner with 20 vulnerability detection rules

| Week | Deliverables | Verification |
|------|-------------|--------------|
| Week 1 | Harden AST parser for edge cases; implement 4 new detectors (post-condition analysis, reentrancy-adjacent patterns, flash loan vectors, token approval vulnerabilities) | Parser handles all mainnet contract syntax; 14 detectors passing tests |
| Week 2 | Implement 4 more detectors (unsafe arithmetic, map/data-var access, uninitialized data variables, excessive permission scope) | 18 detectors passing tests |
| Week 3 | Implement final 2 detectors (contract upgrade safety, cross-function data flow); begin mainnet contract testing | 20 detectors passing; test reports for ALEX, Zest contracts |
| Week 4 | Complete mainnet contract validation (Granite, BitFlow, StackingDAO); publish npm package; write detector documentation | `npm install -g clarityguard` works; 5 mainnet contracts scanned with published results |

**Completion criteria:** 20 detectors operational, npm package published, tested against 5+ real mainnet contracts.

**Payment: 50% ($5,000 STX)**

### Milestone 2 (Weeks 5-8 · Target: May 5 – May 30, 2026): Web Dashboard + CI/CD Integration
**Deliverable:** Web interface and GitHub integration for automated scanning

| Week | Deliverables | Verification |
|------|-------------|--------------|
| Week 5 | Web dashboard MVP (Next.js): file upload, paste code, run scan, display results | Dashboard deployed; can scan a contract via browser |
| Week 6 | Dashboard polish: severity breakdown charts, comparison view, shareable report links | Visual report matches CLI output; shareable links working |
| Week 7 | GitHub Action: auto-scan on PRs, block merges on critical/high, inline PR comments | Action published to GitHub Marketplace; demo PR with inline comments |
| Week 8 | Documentation site: detector catalog with examples, integration guides, Clarity security best practices | Docs site live; all 20 detectors documented with examples |

**Completion criteria:** Web dashboard deployed, GitHub Action published, documentation site live.

**Payment: 50% ($5,000 STX)**

### Stretch Goals (Post-Grant, Q3–Q4 2026)
- Property-based fuzzing engine (Echidna-style for Clarity)
- VS Code extension with inline warnings
- Community detector plugin system
- Formal verification primitives
- Scanning of deployed mainnet contracts via Stacks API

---

## Budget Breakdown ($10,000)

| Category | Amount | Milestone | Itemized Details |
|----------|--------|-----------|-----------------|
| **Core Scanner Development** | $2,500 | M1 | 10 additional detectors, parser hardening, cross-function data flow analysis |
| **Mainnet Testing & Validation** | $1,000 | M1 | Testing against 5+ mainnet contracts (ALEX, Zest, Granite, BitFlow, StackingDAO), false-positive tuning |
| **npm Package & CLI Polish** | $500 | M1 | Package publishing, CLI UX improvements, error handling |
| **Web Dashboard** | $2,500 | M2 | Next.js app: file upload, code paste, visual reports, severity charts, shareable links |
| **GitHub Action** | $1,000 | M2 | PR scanning, merge blocking, inline comments, GitHub Marketplace publishing |
| **Documentation Site** | $500 | M2 | Detector catalog, integration guides, Clarity security best practices |
| **Infrastructure** | $1,000 | M1+M2 | Vercel/hosting ($20/mo × 6 months = $120), domain ($15), CI/CD compute, remaining reserved for scaling |
| **Contingency** | $500 | — | Parser edge cases, unexpected Clarity language updates, additional testing |
| **Total** | **$10,000** | | |

**Note:** Development costs are calculated at a discounted rate reflecting the project's open-source mission and the existing prototype that reduces development risk. The working prototype (custom parser, 10 detectors, CLI, JSON export) was built without funding as a demonstration of commitment.

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

## Risk Assessment & Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **Parser fails on complex mainnet contracts** | Medium | High | Prototype already parses standard Clarity syntax. Week 1 dedicated to parser hardening. Will test against 5+ real mainnet contracts to catch edge cases early. |
| **False positive rate too high** | Medium | Medium | Tuning phase built into Milestone 1 (Week 3-4). Each detector has configurable sensitivity. Community feedback loop via GitHub Issues to identify and fix false positives. |
| **Low developer adoption** | Medium | Medium | Distribution via npm (frictionless install). GitHub Action for automated use. Outreach via Stacks Forum, Discord, and direct partnership with protocol teams. |
| **Scope creep / timeline slippage** | Low | Medium | Milestones have weekly deliverables with clear verification criteria. Stretch goals are explicitly post-grant. Contingency budget reserved. |
| **Clarity language changes break detectors** | Low | Low | Clarity is a stable, decidable language with infrequent breaking changes. Modular detector architecture means individual detectors can be updated independently. |
| **Maintenance sustainability post-grant** | Medium | High | See Ecosystem Commitment section below. Open-source model enables community contributions. Seeking follow-on funding via Stacks Endowment growth track. |

---

## Ecosystem Commitment — Long-Term Plan

ClarityGuard is not a one-time deliverable. It is designed to be foundational infrastructure that grows with the Stacks ecosystem.

### During Grant Period (8 weeks)
- Weekly progress updates on Stacks Forum
- Open-source repository with community PRs reviewed within 48 hours
- Direct engagement with protocol teams (ALEX, Zest, Granite, BitFlow, StackingDAO) for beta testing

### Post-Grant Maintenance (Ongoing)
- **Quarterly detector updates** — New detectors added as Clarity patterns evolve and new vulnerability classes emerge
- **Clarity version compatibility** — Scanner updated within 2 weeks of any Clarity language release
- **Community contributions** — Pluggable detector architecture enables external contributors; PRs reviewed within 48 hours
- **Bug fixes** — Critical bugs addressed within 72 hours; security-relevant issues within 24 hours

### Growth Path (Q3 2026+)
- Apply for Stacks Endowment **Growth Track** funding to support advanced features (fuzzing engine, formal verification, VS Code extension)
- Explore partnerships with Clarity audit firms for commercial integration
- Seek integration into Hiro's developer toolchain (Clarinet, Stacks.js)
- Present findings and tooling at Stacks community events

### Sustainability Model
- **Core scanner** remains free and open-source forever (MIT license)
- **Premium features** (hosted dashboard with team collaboration, priority support, custom detector development) explored as a sustainability path — not gated behind the core tool
- **Ecosystem grants** for continued development of public goods features

---

## Team

**Okeke Francis Chukwudalu**
- Full-stack developer with experience in TypeScript, Node.js, and smart contract development
- Background in backend/API development, data analytics, and blockchain
- GitHub: https://github.com/okekefrancis112
- LinkedIn: http://linkedin.com/in/francis-okeke-738012125

**Why I'm the right person for this:**
- ClarityGuard is my first project in the Stacks ecosystem — and I chose to build it because I saw a critical gap that no one was filling. Rather than submitting an idea, I built a working prototype first: a custom S-expression parser, 10 vulnerability detectors, a CLI tool, and JSON export — all with zero funding and zero runtime dependencies.
- My fresh perspective is an asset. Coming from outside the existing Stacks developer community, I approached Clarity security tooling without assumptions, studying the language specification and real-world contract patterns to build detectors grounded in actual risk.
- I'm here to stay. This grant isn't a one-off — it's the starting point of a long-term commitment to Stacks security infrastructure. The working prototype is my proof of intent.

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

- Prototype Repository: https://github.com/okekefrancis112/ClarityGuard
- npm Package: To be published as `clarityguard` (Milestone 1, Week 4)
- Existing Clarity Security Tools (for context):
  - Clarinet: https://github.com/hirosystems/clarinet
  - STACY: https://github.com/CoinFabrik/stacy

