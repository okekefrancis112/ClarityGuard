import { describe, it, expect } from 'vitest';
import { parse } from '../../../src/parser';
import { txSenderInAssert } from '../../../src/detectors/tx-sender-in-assert';

function detect(source: string) {
  return txSenderInAssert.detect(parse(source), source);
}

describe('tx-sender-in-assert detector', () => {
  it('flags (asserts! (is-eq tx-sender ...) ...)', () => {
    const findings = detect(`
(define-public (admin-only)
  (asserts! (is-eq tx-sender CONTRACT-OWNER) (err u401))
  (ok true))
`);
    expect(findings).toHaveLength(1);
    expect(findings[0].severity).toBe('medium');
    expect(findings[0].detector).toBe('tx-sender-in-assert');
  });

  it('flags tx-sender anywhere in the assertion condition', () => {
    const findings = detect(`
(define-public (check)
  (asserts! (not (is-eq tx-sender BANNED-ADDRESS)) (err u403))
  (ok true))
`);
    expect(findings).toHaveLength(1);
  });

  it('does not flag (asserts! (is-eq contract-caller ...) ...)', () => {
    const findings = detect(`
(define-public (safe-admin)
  (asserts! (is-eq contract-caller CONTRACT-OWNER) (err u401))
  (ok true))
`);
    expect(findings).toHaveLength(0);
  });

  it('does not flag tx-sender used as a function argument (not in asserts!)', () => {
    const findings = detect(`
(define-public (transfer (amount uint) (to principal))
  (stx-transfer? amount tx-sender to))
`);
    expect(findings).toHaveLength(0);
  });

  it('flags multiple asserts! with tx-sender', () => {
    const findings = detect(`
(define-public (double-check)
  (begin
    (asserts! (is-eq tx-sender OWNER-A) (err u1))
    (asserts! (is-eq tx-sender OWNER-B) (err u2))
    (ok true)))
`);
    expect(findings).toHaveLength(2);
  });

  it('does not flag asserts! with no tx-sender reference', () => {
    const findings = detect(`
(define-public (amount-check (x uint))
  (asserts! (> x u0) (err u1))
  (ok x))
`);
    expect(findings).toHaveLength(0);
  });

  it('reports correct line number', () => {
    const findings = detect(`(define-public (foo)
  (asserts! (is-eq tx-sender OWNER) (err u1))
  (ok true))`);
    expect(findings[0].line).toBe(2);
  });

  it('recommendation mentions contract-caller', () => {
    const findings = detect(`
(define-public (f)
  (asserts! (is-eq tx-sender X) (err u1))
  (ok true))
`);
    expect(findings[0].recommendation).toContain('contract-caller');
  });
});
