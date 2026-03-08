# Contributing to ClarityGuard

Thank you for helping secure the Stacks ecosystem! PRs are reviewed within 48 hours.

## Adding a Detector

Every detector implements the `Detector` interface in `src/detectors/index.ts`:

```typescript
export const myDetector: Detector = {
  id: 'my-detector',          // kebab-case, unique
  name: 'My Detector Name',   // human-readable
  severity: 'medium',         // critical | high | medium | low | info
  description: 'What it detects and why it matters.',

  detect(ast: ClarityNode[], source: string): Finding[] {
    const findings: Finding[] = [];
    // Walk the AST, push findings
    return findings;
  },
};
```

1. Create `src/detectors/my-detector.ts`
2. Register it in `src/analyzer.ts` under `ALL_DETECTORS`
3. Add tests in `test/unit/detectors/my-detector.test.ts` — cover both the vulnerable and safe cases
4. Run `npm test` to verify all tests pass

## Running Tests

```bash
npm test              # run all tests
npm run test:watch    # watch mode
npm run test:coverage # with coverage report
npm run typecheck     # TypeScript type checking
```

## Submitting a PR

- One logical change per PR
- All tests must pass
- New detectors require tests for at least: one vulnerable case, one safe case, and correct severity
- Use descriptive commit messages

## Reporting a Bug

Open an issue using the [bug report template](.github/ISSUE_TEMPLATE/bug_report.md). Include:
- The Clarity source that triggers the wrong behavior
- Expected vs. actual findings
- ClarityGuard version (`clarityguard --version`)
