# ClarityGuard — Grant Form Responses

> Copy-paste these into the Google Form:
> https://docs.google.com/forms/d/e/1FAIpQLSeC1hWbo5QrAPu-OvZUKI2GM_42sBOUUCyphW8Z6ZsXx7dWUQ/viewform

---

## Page 1: General Information

### 1. Are you applying as an individual or on behalf of an entity?
> Individual

### 2. Legal name
> [YOUR FULL LEGAL NAME]

### 3. Primary contact name
> [YOUR NAME]

### 4. Primary contact email
> [YOUR EMAIL]

### 5. Primary contact role
> Developer

### 6. Jurisdiction of entity or individual
> [YOUR COUNTRY]

### 7. Project name
> ClarityGuard

### 8. Website or main project link
> [YOUR GITHUB REPO URL — e.g., https://github.com/yourusername/clarityguard]

### 9. In 2–3 sentences, describe your project and who it serves.
> ClarityGuard is a comprehensive static analysis security scanner for Clarity smart contracts on Stacks. It parses Clarity source code into an AST and runs 10+ pluggable vulnerability detectors — covering unprotected admin functions, unsafe unwrap usage, unchecked external calls, precision loss, and more — then outputs actionable reports with severity ratings and fix recommendations. It serves every Clarity developer building DeFi, NFT, or any smart contract application on Stacks, helping them catch security vulnerabilities before deployment.

### 10. Who is your primary audience?
> Mixed

### 11. Describe your institutional versus retail user segments.
> **Developer segment (primary):** Clarity smart contract developers building DeFi protocols, NFT platforms, and infrastructure on Stacks. These range from solo developers to protocol teams at Zest, Granite, BitFlow, and StackingDAO. They use ClarityGuard in their development workflow and CI/CD pipelines.
>
> **Institutional segment (secondary):** Audit firms with Clarity expertise (Clarity Alliance, CoinFabrik, CertiK, Halborn) who can use ClarityGuard as a first-pass screening tool before manual audits. Also, the Stacks Foundation and Endowment themselves, who fund bug bounties and benefit from preventive security tooling.

### 12. Why is Stacks the right home for this project?
> ClarityGuard is purpose-built for the Clarity smart contract language, which is unique to Stacks. Clarity's decidable, non-Turing-complete design enables complete static analysis that isn't possible with Solidity. The Stacks ecosystem has $545M in sBTC TVL across DeFi protocols, yet only has 2 security tools (Clarinet's built-in checks and STACY by CoinFabrik) compared to Solidity's 15+ mature tools. The security tooling gap is critical — the Stacks Endowment already allocates 35.2% of its $27M budget to engineering and security, and spends $100-150K per protocol on bug bounties. ClarityGuard can only exist on Stacks because Clarity only exists on Stacks.

### 13. Are you willing and able to complete KYC/KYB if approved?
> Yes – Willing to complete KYC/KYB

### 14. Are there any legal, technical, reputational, or compliance risks we should know about?
> No legal, reputational, or compliance risks. The project is open-source (MIT license) security tooling with no token, no user funds custody, and no regulatory exposure. The primary technical risk is parser edge cases with complex Clarity contracts, which will be mitigated by testing against real mainnet contracts (ALEX, Zest, Granite, BitFlow, StackingDAO) during development. False positives in vulnerability detection are a known challenge in static analysis — we mitigate this through conservative detection rules and clear severity ratings.

### 15. How long do you plan to remain active in the Stacks ecosystem after this grant?
> Long-term (3+ years or indefinitely)

### 16. What is your plan for maintaining and supporting what you build after the grant ends?
> ClarityGuard will be maintained as an open-source project with ongoing community contributions. Post-grant sustainability comes from three sources: (1) Community contributions — the pluggable detector system allows anyone to add new rules via PRs, (2) Potential follow-up grants for advanced features (fuzzing engine, formal verification, VS Code extension), and (3) Integration partnerships — audit firms and protocol teams have a vested interest in keeping the tool current as Clarity evolves (e.g., Clarity 4 support). I plan to actively maintain the project, respond to issues, and ship quarterly detector updates aligned with emerging vulnerability patterns in the ecosystem.

### 17. Have you or your team received Stacks grants before?
> No

### 18. If yes, list prior Stacks grants.
> N/A

### 19. How did you hear about the Stacks Endowment Grants Program?
> [SELECT THE APPROPRIATE OPTION — e.g., Stacks Forum, Dev Rel, Hackathons, X, Other]

### 20. Requested grant amount (in USD)
> Between $5,000 - $10,000

### 21. Which grant track are you applying for?
> Getting Started

---

## Page 2B: Getting Started Track

### 33. What problem are you solving for the Stacks ecosystem specifically?
> The Clarity smart contract security tooling gap is critical and growing. Solidity has 15+ mature open-source security tools (Slither, Mythril, Echidna, Foundry's fuzzer, Certora, Manticore). Clarity has 2: Clarinet's built-in checks and STACY by CoinFabrik, which detects only 6-7 basic patterns.
>
> Meanwhile, the Stacks DeFi ecosystem secures $545M in sBTC TVL across protocols like Zest ($75.9M), Granite ($19.9M), and StackingDAO (100M+ STX). The Stacks Endowment spends $100-150K per protocol on bug bounties — a reactive approach. ClarityGuard provides a preventive solution: catch vulnerabilities before deployment, before they become $150K bug bounty payouts.
>
> Without better security tooling, the ecosystem faces increasing risk as TVL grows toward the $1B target and institutional players (Fireblocks, BitGo) onboard. Every DeFi exploit on Stacks would damage the ecosystem's credibility far more than the cost of prevention.

### 34. Define the scope of work
> **Deliverable 1: Production Security Scanner (Weeks 1-4)**
> - Harden the Clarity AST parser for edge cases and complex real-world contracts
> - Expand from 10 to 20 vulnerability detectors (adding post-condition analysis, cross-function data flow, token approval vulnerabilities, unsafe arithmetic patterns, uninitialized data variables, and more)
> - Test against real mainnet contracts from ALEX, Zest, Granite, BitFlow, and StackingDAO
> - Publish npm package: `npm install -g clarityguard`
>
> **Deliverable 2: Web Dashboard + CI/CD Integration (Weeks 5-8)**
> - Build a web dashboard (Next.js) where users can upload .clar files and get visual security reports
> - Create a GitHub Action for CI/CD that auto-scans on pull requests and blocks merges on critical/high findings
> - Write documentation site with detector catalog, integration guides, and Clarity security best practices

### 35. Who is on your core team and why are you uniquely qualified for this project?
> [YOUR NAME — Fill in your real details below]
> - Full-stack developer with experience in TypeScript, Node.js, and smart contract development
> - Experienced with the Stacks ecosystem and Clarity smart contract language
> - Background in backend/API development, data analytics, and blockchain engineering
> - [ADD: Your GitHub profile, relevant projects, years of experience, education, or prior companies]
> - [ADD: Any Stacks community involvement — forum posts, hackathon participation, prior contributions]

### 36. What have you already built or done on this project?
> A fully functional prototype is already built and operational:
>
> - **Custom Clarity S-expression parser** that tokenizes and parses Clarity source code into a traversable AST
> - **10 vulnerability detectors** covering: unprotected admin functions (CRITICAL), unsafe unwrap-panic usage (HIGH), unchecked external contract calls (HIGH), division before multiplication / precision loss (MEDIUM), block-height timing issues (MEDIUM), tx-sender relay attack vectors (MEDIUM), missing input validation (MEDIUM), hardcoded principals (LOW), dead code detection (INFO), and TODO/FIXME comment detection (INFO)
> - **CLI tool** with colored terminal output (severity-coded findings with line numbers and fix recommendations) and JSON export for CI/CD
> - **Tested** against sample contracts: the scanner correctly identifies 21 findings in a deliberately vulnerable contract and only 1 advisory in a well-written safe contract
>
> The prototype is written in TypeScript and ready for npm distribution.

### 37. Provide links that will demonstrate progress and support milestones.
> - GitHub Repository: [YOUR REPO URL — publish the prototype before submitting]
> - npm package page: [Will be published as `clarityguard` on npmjs.com]
> - Milestone 1 evidence: Updated GitHub repo with 20 detectors, test results against real mainnet contracts, npm install working
> - Milestone 2 evidence: Live web dashboard URL, GitHub Action marketplace listing, documentation site URL

### 38. Estimated duration and proposed start date
> 8 weeks, starting upon grant approval (estimated April 2026)

### 39. Proposed budget and high-level breakdown
> Total: $10,000
>
> - Development (65%): $6,500 — Core scanner hardening, 10 additional detectors, web dashboard, GitHub Action
> - Infrastructure (15%): $1,500 — Hosting for web dashboard, CI/CD compute, npm registry
> - Testing & Validation (10%): $1,000 — Testing against real mainnet contracts, community beta program
> - Documentation (5%): $500 — Detector catalog, integration guides, Clarity security best practices tutorial

### 40. Proposed milestones
> **Milestone 1: Production Scanner + 20 Detectors (50% budget, ~4 weeks)**
> - Deliverables: Hardened parser, 20 vulnerability detectors, npm package published, test suite against 5+ real mainnet contracts
> - Acceptance criteria: `npm install -g clarityguard && clarityguard scan <contract.clar>` works with 20 detectors, documented test results against ALEX/Zest/Granite/BitFlow/StackingDAO contracts
> - Evidence: GitHub repo with passing tests, npm package live, scan results document
>
> **Milestone 2: Web Dashboard + CI/CD (50% budget, ~4 weeks)**
> - Deliverables: Web dashboard deployed, GitHub Action published, documentation site live
> - Acceptance criteria: Users can upload .clar files at the web URL and receive visual reports. GitHub Action can be added to any repo and auto-scans PRs.
> - Evidence: Live web dashboard URL, GitHub Action marketplace listing, documentation site URL

### 41. What evidence will you provide to support milestones?
> - **GitHub repository** with full commit history showing development progress
> - **npm package** published and installable (`npm install -g clarityguard`)
> - **Scan results** from real mainnet contracts (ALEX, Zest, Granite, BitFlow, StackingDAO) showing detected vulnerabilities
> - **Live web dashboard** URL where anyone can upload a .clar file and get a report
> - **GitHub Action** published on GitHub Marketplace
> - **Documentation site** with detector catalog, examples, and integration guides
> - **Community feedback** from beta testers on the Stacks Forum

### 42. What are the key risks and dependencies? How will you mitigate them?
> **Risk 1: Parser edge cases with complex contracts.** Some real-world Clarity contracts use deeply nested expressions or unusual patterns that may break the parser. Mitigation: test against the top 10 deployed mainnet contracts during Milestone 1, and add parser hardening for each edge case found.
>
> **Risk 2: False positives in vulnerability detection.** Static analysis inherently produces false positives. Mitigation: conservative detection rules, clear severity ratings (critical/high/medium/low/info), and detailed explanations so developers can easily assess relevance. The detector plugin system allows community tuning over time.
>
> **Risk 3: Clarity language evolution.** Clarity 4 introduced new features (block timestamps, secp256r1-verify, etc.) that may require new detectors. Mitigation: modular detector architecture makes it trivial to add new rules. The parser is designed to be forward-compatible with new Clarity syntax.
>
> **Risk 4: Adoption.** Developers may not discover or adopt the tool. Mitigation: publish as an npm package (familiar workflow), provide a GitHub Action (zero-friction CI/CD), and engage the Stacks Forum community during development.

### 43. What ecosystem impact will this deliver?
> - **Security baseline raised** for every Clarity developer — 20 vulnerability detection rules that catch common and critical bugs before deployment
> - **Cost reduction** for the ecosystem — preventive scanning reduces the need for reactive $100-150K bug bounty programs
> - **Institutional confidence** — Fireblocks (2,400+ institutional clients) and other institutional players need evidence of mature security tooling before committing capital
> - **Developer retention** — better tooling makes Clarity more attractive vs. Solidity, which has 15+ security tools
> - **Quantified impact**: Every Clarity contract deployed to mainnet can be scanned. With ~20,000 daily transactions on Stacks, even catching one critical vulnerability in a DeFi protocol could prevent millions in losses

### 44. Are there similar initiatives in Stacks or other ecosystems? How is yours differentiated?
> **On Stacks:**
> - **Clarinet** (by Hiro): Development environment with built-in static analysis, debugger, and testing sandbox. ClarityGuard complements Clarinet — it focuses specifically on security vulnerability detection with deeper analysis (20 detectors vs. basic checks), web dashboard for non-CLI users, and CI/CD integration.
> - **STACY** (by CoinFabrik): Open-source static analyzer that detects 6-7 basic patterns. ClarityGuard goes significantly further with 20 detectors, severity-rated reports with fix recommendations, JSON output for CI/CD, and a web dashboard. STACY is a foundation — ClarityGuard is the comprehensive tool the ecosystem needs.
>
> **On other ecosystems (Solidity):**
> - Slither (Trail of Bits): The gold standard for Solidity static analysis, with 80+ detectors. ClarityGuard aims to be the Slither equivalent for Clarity.
> - Mythril, Echidna, Foundry's fuzzer: Solidity has 15+ tools. Clarity has 2. ClarityGuard begins closing this gap.
>
> **Key differentiator:** ClarityGuard is purpose-built for Clarity's unique properties (decidable, non-Turing-complete, no reentrancy) and leverages them for more precise analysis than generic tools can provide.

### 45. Any partners or ecosystem collaborators?
> No formal partnerships yet, but the following are natural collaboration targets post-launch:
> - **Hiro Systems** — Potential integration with Clarinet development workflow
> - **CoinFabrik** — Their STACY tool is complementary; could share detector rules
> - **Clarity Alliance** — Audit firm that could use ClarityGuard as a first-pass screening tool
> - **DeFi protocol teams** (Zest, Granite, BitFlow, StackingDAO) — Early beta testers and feedback providers
> - **Stacks Foundation** — Could integrate into grant application requirements (mandatory security scan)

### 46. What does success look like at the end of this grant?
> - **20 vulnerability detectors** shipping in a production-quality scanner
> - **npm package** with 50+ installs in the first month
> - **Web dashboard** with 100+ contract scans in the first month
> - **GitHub Action** integrated into at least 3 Stacks project repos
> - **5+ real mainnet contracts** scanned with published results
> - **Documentation site** live with detector catalog and integration guides
> - **Community engagement** — at least one Stacks Forum post showcasing results
> - **Maintenance plan**: Quarterly detector updates, community PRs reviewed within 48 hours, Clarity version compatibility maintained

---

## Final Page

### 47. Confirmation
> [x] Yes — I confirm that the information provided is accurate to the best of my knowledge.

### 48. Funding terms
> [x] Yes — I understand funding is milestone-based and subject to KYC/KYB and agreement terms.
