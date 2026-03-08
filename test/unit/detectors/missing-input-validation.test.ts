import { describe, it, expect } from 'vitest';
import { parse } from '../../../src/parser';
import { missingInputValidation } from '../../../src/detectors/missing-input-validation';

function detect(source: string) {
  return missingInputValidation.detect(parse(source), source);
}

describe('missing-input-validation detector', () => {
  it('flags a uint param with no validation', () => {
    const findings = detect(`
(define-public (deposit (amount uint))
  (stx-transfer? amount tx-sender .vault))
`);
    expect(findings).toHaveLength(1);
    expect(findings[0].severity).toBe('medium');
    expect(findings[0].detector).toBe('missing-input-validation');
    expect(findings[0].title).toContain('amount');
  });

  it('flags an int param with no validation', () => {
    const findings = detect(`
(define-public (adjust (delta int))
  (ok (+ (var-get balance) delta)))
`);
    expect(findings).toHaveLength(1);
    expect(findings[0].title).toContain('delta');
  });

  it('does not flag when asserts! validates the param', () => {
    const findings = detect(`
(define-public (deposit (amount uint))
  (begin
    (asserts! (> amount u0) (err u1))
    (stx-transfer? amount tx-sender .vault)))
`);
    expect(findings).toHaveLength(0);
  });

  it('does not flag when > comparison validates the param', () => {
    const findings = detect(`
(define-public (deposit (amount uint))
  (if (> amount u0)
    (stx-transfer? amount tx-sender .vault)
    (err u1)))
`);
    expect(findings).toHaveLength(0);
  });

  it('does not flag when is-eq validates the param', () => {
    const findings = detect(`
(define-public (check (x uint))
  (if (is-eq x u42)
    (ok true)
    (err u1)))
`);
    expect(findings).toHaveLength(0);
  });

  it('does not flag non-numeric params', () => {
    const findings = detect(`
(define-public (transfer (recipient principal) (memo (string-ascii 32)))
  (ok true))
`);
    expect(findings).toHaveLength(0);
  });

  it('flags multiple unvalidated numeric params', () => {
    const findings = detect(`
(define-public (swap (amount-in uint) (amount-out uint))
  (begin
    (ft-transfer? token-a amount-in tx-sender .pool)
    (ft-transfer? token-b amount-out .pool tx-sender)))
`);
    expect(findings).toHaveLength(2);
  });

  it('does not flag private functions', () => {
    const findings = detect(`
(define-private (internal-calc (x uint))
  (* x u2))
`);
    expect(findings).toHaveLength(0);
  });

  it('does not flag read-only functions (no state risk)', () => {
    const findings = detect(`
(define-read-only (get-adjusted (amount uint))
  (ok (* amount u2)))
`);
    // read-only functions are not define-public so should not be flagged
    expect(findings).toHaveLength(0);
  });

  it('recommendation includes the param name', () => {
    const findings = detect(`
(define-public (withdraw (quantity uint))
  (ok quantity))
`);
    expect(findings[0].recommendation).toContain('quantity');
  });
});
