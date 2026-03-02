# Stacks Endowment Grant - Project Ideas

> Researched for the **Getting Started Program Track** ($5,000 - $10,000 in STX)
> Deadline: March 13, 2026

---

## Research Summary

### What Gets Funded Most (Ranked)

| Rank | Category           | % of Budget  | Examples Funded                              |
|------|--------------------|-------------|----------------------------------------------|
| 1    | sBTC DeFi Apps     | 23.4% ($6.3M) | ALEX, Arkadiko, BitFlow, Zest, Granite       |
| 2    | Engineering & Security | 35.2% ($9.5M) | sBTC Bridge, Signer Tools, Stackspulse   |
| 3    | Developer Tooling  | High         | Stacks.py, Golang SDK, txtx Runbooks         |
| 4    | Stablecoin Infra   | Growing      | USDCx (Circle), USDh                         |
| 5    | AI + DeFi (DeFAI)  | Emerging     | Explicitly called out as wanted               |

### Key Ecosystem Gaps They Want Filled
- sBTC fee payment (users can't pay fees in sBTC yet)
- Simplified onramps for self-custody
- Permissionless lending protocols (underdeveloped)
- AI-integrated DeFi (DeFAI) — new category they're actively seeking
- Cross-chain sBTC utility (Wormhole expansion happening now)
- Security tooling — only 2 tools exist for Clarity vs 15+ for Solidity

### Key Ecosystem Stats
- sBTC TVL: $545M USD
- sBTC Holders: 7,408
- Stacks DeFi TVL: ~$126M (Q3 2025)
- 2026 Operating Budget: $27M + 25M STX
- Fireblocks institutional clients: 2,400+

---

## Project Idea 1: ClarityGuard — Smart Contract Security Scanner ⭐ (CHOSEN)

**Category:** Security / Developer Tooling
**Funding Ask:** $10,000

### The Problem
Solidity has 15+ mature security tools (Slither, Mythril, Echidna, Foundry fuzzer, Certora). Clarity has 2 (Clarinet + STACY by CoinFabrik). No fuzzing. No formal verification. No symbolic execution. Meanwhile, protocols like Granite and Zest hold $95M+ in TVL.

### The Solution
A comprehensive Clarity security scanner:
- **Vulnerability detection**: 20+ detector rules (access control, unsafe unwrap, integer overflow, unprotected admin functions, flash loan vectors)
- **Fuzzing engine**: Property-based testing with random inputs
- **Web dashboard**: Upload a contract, get a security report
- **CLI tool**: Integrate into CI/CD pipelines

### Architecture
```
CLI / Web Upload → Clarity Parser (AST)
                        ↓
              ┌─────────┼─────────┐
         Static        Fuzzer    Pattern
        Analysis     (property   Matcher
       (data flow)    testing)  (known vulns)
                        ↓
              Security Report (JSON/HTML)
```

### Milestones (12 weeks)
| Week  | Milestone                          | Deliverable                                             |
|-------|------------------------------------|---------------------------------------------------------|
| 1-3   | Clarity AST parser + 10 detectors  | Core engine detecting top 10 Clarity vulnerabilities    |
| 4-7   | Fuzzing engine + 10 more detectors | Property-based testing, 20 total detection rules        |
| 8-10  | Web dashboard                      | Upload contract → get report, severity ratings, fixes   |
| 11-12 | CI/CD integration + docs           | GitHub Action, CLI tool, documentation                  |

### Budget ($10,000)
- Infrastructure (compute for fuzzing): $2,000
- Development time: $6,500
- Testing against real contracts: $1,000
- Documentation: $500

### Why They Fund This
Security gets 35.2% of the total $27M budget. They pay $100-150K per protocol for bug bounties. A preventive tool that catches bugs before deployment saves orders of magnitude more.

---

## Project Idea 2: DeFAI — AI-Powered sBTC Yield Agent

**Category:** DeFi + AI (DeFAI)
**Funding Ask:** $7,500

### The Problem
$545M in sBTC TVL across 6+ DeFi protocols (Zest, Granite, BitFlow, ALEX, StackingDAO, Hermetica) — each with different yields, risks, and strategies. No intelligent automation layer exists.

AIBTC exists but focuses on DAO investment. Nobody is building yield optimization AI on Stacks.

### The Solution
A web app where users connect their Stacks wallet and an AI agent:
- Scans real-time yields across all sBTC-supporting protocols
- Recommends optimal allocation based on risk tolerance
- Generates executable transaction bundles for rebalancing
- Alerts users when better opportunities arise

### Architecture
```
Frontend (React/Next.js) → API Server (Node.js)
                              ↓
                    AI Engine (Claude API)
                              ↓
               On-Chain Data Indexer (Stacks API + Hiro)
                              ↓
            Protocol Adapters (Zest, Granite, BitFlow, etc.)
```

### Milestones (8 weeks)
| Week | Milestone                    | Deliverable                                                    |
|------|------------------------------|----------------------------------------------------------------|
| 1-2  | Protocol data aggregation    | Live yield feeds from Zest, Granite, BitFlow, StackingDAO      |
| 3-5  | AI recommendation engine     | Claude-powered strategy suggestions based on risk profile      |
| 6-7  | Wallet integration + TX builder | Connect wallet, generate rebalancing transactions           |
| 8    | Launch + documentation       | Deployed MVP, user guide, demo video                           |

### Budget ($7,500)
- API costs (Stacks, Claude): $1,500
- Frontend hosting/infra: $500
- Development time: $4,500
- Testing & audit: $1,000

### Why They Fund This
DeFAI is explicitly listed as an emerging category. sBTC DeFi gets 23.4% of budget. This combines both.

---

## Project Idea 3: sBTC Paymaster — Generalized Gas Abstraction Service

**Category:** Infrastructure / sBTC Utility
**Funding Ask:** $10,000

### The Problem
Users must hold STX to interact with any Stacks dApp. Sponsored transactions exist (Xverse, sendstx.com), but they're siloed — each app builds its own. No generalized paymaster exists.

### The Solution
A Paymaster API service that any Stacks dApp can integrate via SDK/API. User pays fees in sBTC, the Paymaster auto-swaps to STX via BitFlow/ALEX and sponsors the transaction.

### Architecture
```
Any dApp → Paymaster SDK (npm package)
                ↓
        Paymaster API Server
                ↓
    ┌───────────┼───────────┐
    DEX Swap    Sponsor TX   Fee Estimation
  (sBTC→STX)   (co-sign)   (dynamic pricing)
```

### Milestones (10 weeks)
| Week  | Milestone                       | Deliverable                                              |
|-------|---------------------------------|----------------------------------------------------------|
| 1-3   | Paymaster smart contract + relay | Contract accepts sBTC, swaps to STX, sponsors TXs       |
| 4-6   | API server + SDK               | RESTful API + npm package for dApp integration            |
| 7-8   | Dashboard + fee estimation     | Admin dashboard, dynamic fee pricing, usage analytics     |
| 9-10  | Docs + integration demo        | Integrate with 1-2 live dApps as proof                    |

### Budget ($10,000)
- STX liquidity float: $3,000
- Infrastructure: $1,500
- Development time: $4,500
- Security review: $1,000

### Why They Fund This
"sBTC fee payment" is a stated ecosystem gap on their roadmap. The community consensus is application-layer abstraction — exactly this approach.

---

## Project Idea 4: sBTC Bridge Explorer — Cross-Chain Liquidity Aggregator

**Category:** Infrastructure / Cross-Chain
**Funding Ask:** $8,000

### The Problem
sBTC is expanding to Solana and Sui via Wormhole NTT (burn-and-mint). Once live, users need to find the best routes to move sBTC across chains. No tool exists.

**Risk:** Wormhole NTT is still in audit. Timing dependency.

### The Solution
An aggregator dashboard showing:
- Best routes for moving sBTC between Stacks, Solana, Sui
- Real-time fee comparisons and liquidity depth
- Transaction status tracking across chains

### Milestones (10 weeks)
| Week  | Milestone                  | Deliverable                                 |
|-------|----------------------------|---------------------------------------------|
| 1-3   | Multi-chain data indexing  | Pull sBTC data from Stacks, Solana, Sui     |
| 4-6   | Route comparison engine    | Compare bridge fees, slippage, speed         |
| 7-8   | Web dashboard              | Visual route explorer with recommendations   |
| 9-10  | TX tracking + alerts       | Track cross-chain transfers, notify on done  |

### Budget ($8,000)
- Multi-chain RPC costs: $2,000
- Development time: $5,000
- Design/UX: $1,000

---

## Project Idea 5: sBTC Risk Intelligence Dashboard

**Category:** Analytics / Institutional Tooling
**Funding Ask:** $8,000

### The Problem
$545M in sBTC TVL, 7,408 holders, 2,400+ institutional clients via Fireblocks — and no institutional-grade risk monitoring. Stackspulse covers basic analytics but not risk.

### The Solution
Real-time risk monitoring platform:
- **Liquidation tracker**: Monitor Zest/Granite positions approaching liquidation
- **Whale alerts**: Track large sBTC movements
- **Protocol health scores**: Risk ratings based on TVL, contract age, audit status
- **Portfolio risk calculator**: Connect wallet, see aggregate risk exposure

### Milestones (10 weeks)
| Week  | Milestone               | Deliverable                                                |
|-------|--------------------------|------------------------------------------------------------|
| 1-3   | Data pipeline            | Index lending positions from Zest (650+ sBTC), Granite     |
| 4-6   | Risk scoring engine      | Liquidation proximity, protocol health, whale detection     |
| 7-8   | Dashboard UI             | Real-time charts, alerts, portfolio view                    |
| 9-10  | Notifications + API      | Email/Telegram alerts, public API                           |

### Budget ($8,000)
- Infrastructure: $2,000
- Development time: $5,000
- Design: $1,000

---

## Final Ranking

| Rank | Project                          | Fundability | Feasibility | Impact                                |
|------|----------------------------------|-------------|-------------|---------------------------------------|
| 1    | ClarityGuard (Security Scanner)  | Very High   | High        | Massive gap, 35% of budget is security |
| 2    | sBTC Paymaster                   | Very High   | High        | Solves stated roadmap gap              |
| 3    | DeFAI Yield Agent                | High        | High        | Hits two hot categories                |
| 4    | Risk Intelligence Dashboard      | High        | High        | Institutional demand                   |
| 5    | Bridge Explorer                  | Medium      | Medium      | Timing risk with Wormhole audit        |

---

## Useful Links
- Grant Application: https://stacksendowment.co/grants-docs/getting-started-program-track
- Stacks Endowment: https://stacksendowment.co
- DeGrants: https://degrants.xyz
- Stacks Foundation Grants: https://stacks.org/grants
- Legacy Grants Archive: https://github.com/stacksgov/grants-program
- Stacks Roadmap: https://stacksroadmap.com
- Stacks Forum: https://forum.stacks.org
