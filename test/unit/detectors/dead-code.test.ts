import { describe, it, expect } from 'vitest';
import { parse } from '../../../src/parser';
import { deadCode } from '../../../src/detectors/dead-code';

function detect(source: string) {
  return deadCode.detect(parse(source), source);
}

describe('dead-code detector', () => {
  it('flags an unused private function', () => {
    const findings = detect(`
(define-private (never-called (x uint))
  (* x u2))

(define-public (main)
  (ok true))
`);
    expect(findings).toHaveLength(1);
    expect(findings[0].severity).toBe('info');
    expect(findings[0].detector).toBe('dead-code');
    expect(findings[0].title).toContain('never-called');
  });

  it('flags an unused constant', () => {
    const findings = detect(`
(define-constant UNUSED-CONST u999)

(define-public (foo)
  (ok true))
`);
    expect(findings).toHaveLength(1);
    expect(findings[0].title).toContain('UNUSED-CONST');
  });

  it('flags an unused data-var', () => {
    const findings = detect(`
(define-data-var stale-var uint u0)

(define-public (foo)
  (ok true))
`);
    expect(findings).toHaveLength(1);
    expect(findings[0].title).toContain('stale-var');
  });

  it('does not flag a private function that is called', () => {
    const findings = detect(`
(define-private (helper (x uint))
  (* x u2))

(define-public (main (x uint))
  (ok (helper x)))
`);
    expect(findings).toHaveLength(0);
  });

  it('does not flag a constant that is referenced', () => {
    const findings = detect(`
(define-constant MAX-SUPPLY u1000000)

(define-public (check (amount uint))
  (asserts! (<= amount MAX-SUPPLY) (err u1))
  (ok true))
`);
    expect(findings).toHaveLength(0);
  });

  it('does not flag a data-var that is read', () => {
    const findings = detect(`
(define-data-var total-supply uint u0)

(define-public (get-supply)
  (ok (var-get total-supply)))
`);
    expect(findings).toHaveLength(0);
  });

  it('does not flag public functions (they are entry points)', () => {
    const findings = detect(`
(define-public (publicly-accessible)
  (ok true))
`);
    expect(findings).toHaveLength(0);
  });

  it('flags multiple unused definitions', () => {
    const findings = detect(`
(define-constant DEAD-A u1)
(define-constant DEAD-B u2)
(define-private (dead-fn (x uint)) x)

(define-public (main)
  (ok true))
`);
    expect(findings).toHaveLength(3);
  });

  it('returns empty findings when all definitions are used', () => {
    const findings = detect(`
(define-constant RATE u10)
(define-data-var total uint u0)
(define-private (calc (x uint)) (* x RATE))

(define-public (update (x uint))
  (begin
    (var-set total (calc x))
    (ok true)))
`);
    expect(findings).toHaveLength(0);
  });

  it('does not flag a read-only function used by another read-only', () => {
    // inner is used by outer; outer is used by main — neither should be flagged
    const findings = detect(`
(define-read-only (inner (x uint))
  (* x u2))

(define-read-only (outer (x uint))
  (inner x))

(define-public (main (x uint))
  (ok (outer x)))
`);
    expect(findings).toHaveLength(0);
  });
});
