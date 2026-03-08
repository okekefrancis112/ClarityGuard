import { describe, it, expect } from 'vitest';
import { parse } from '../../../src/parser';
import { blockHeightTiming } from '../../../src/detectors/block-height-timing';

function detect(source: string) {
  return blockHeightTiming.detect(parse(source), source);
}

describe('block-height-timing detector', () => {
  it('flags block-height usage', () => {
    const findings = detect(`
(define-public (check-deadline)
  (asserts! (< block-height u1000) (err u1))
  (ok true))
`);
    expect(findings).toHaveLength(1);
    expect(findings[0].severity).toBe('medium');
    expect(findings[0].detector).toBe('block-height-timing');
    expect(findings[0].title).toContain('block-height');
  });

  it('flags burn-block-height usage', () => {
    const findings = detect(`
(define-public (is-active)
  (ok (< burn-block-height u5000)))
`);
    expect(findings).toHaveLength(1);
    expect(findings[0].title).toContain('burn-block-height');
  });

  it('flags stacks-block-height usage', () => {
    const findings = detect(`
(define-read-only (get-height)
  (ok stacks-block-height))
`);
    expect(findings).toHaveLength(1);
    expect(findings[0].title).toContain('stacks-block-height');
  });

  it('does not report the same line twice', () => {
    const findings = detect(`
(define-public (double)
  (if (> block-height u100)
    (ok block-height)
    (ok u0)))
`);
    // block-height appears twice on different lines — each line reported once
    expect(findings.length).toBeLessThanOrEqual(2);
    const lines = findings.map((f) => f.line);
    expect(new Set(lines).size).toBe(lines.length);
  });

  it('flags block-height in a data-var set context', () => {
    const findings = detect(`
(define-public (record-time)
  (var-set last-seen block-height)
  (ok true))
`);
    expect(findings).toHaveLength(1);
  });

  it('returns empty findings when no block-height symbols are present', () => {
    const findings = detect(`
(define-public (safe)
  (ok u42))
`);
    expect(findings).toHaveLength(0);
  });

  it('recommendation mentions stacks-block-time for block-height', () => {
    const findings = detect('(> block-height u100)');
    expect(findings[0].recommendation).toContain('stacks-block-time');
  });

  it('recommendation is different for burn-block-height', () => {
    const findingsBH = detect('(> block-height u100)');
    const findingsBurn = detect('(> burn-block-height u100)');
    expect(findingsBH[0].recommendation).not.toBe(findingsBurn[0].recommendation);
  });
});
