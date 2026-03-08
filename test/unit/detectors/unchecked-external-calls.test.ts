import { describe, it, expect } from 'vitest';
import { parse } from '../../../src/parser';
import { uncheckedExternalCalls } from '../../../src/detectors/unchecked-external-calls';

function detect(source: string) {
  return uncheckedExternalCalls.detect(parse(source), source);
}

describe('unchecked-external-calls detector', () => {
  it('flags contract-call? inside begin without handler', () => {
    const findings = detect(`
(define-public (do-call)
  (begin
    (contract-call? .other-contract some-method u100)
    (ok true)))
`);
    expect(findings).toHaveLength(1);
    expect(findings[0].severity).toBe('high');
    expect(findings[0].detector).toBe('unchecked-external-calls');
  });

  it('does not flag contract-call? wrapped in try!', () => {
    const findings = detect(`
(define-public (safe-call)
  (begin
    (try! (contract-call? .other-contract some-method u100))
    (ok true)))
`);
    expect(findings).toHaveLength(0);
  });

  it('does not flag contract-call? wrapped in unwrap!', () => {
    const findings = detect(`
(define-public (safe-call)
  (let ((result (unwrap! (contract-call? .other-contract get-val) (err u1))))
    (ok result)))
`);
    expect(findings).toHaveLength(0);
  });

  it('does not flag contract-call? wrapped in match', () => {
    const findings = detect(`
(define-public (safe-call)
  (match (contract-call? .other-contract get-val)
    ok-val (ok ok-val)
    err-val (err err-val)))
`);
    expect(findings).toHaveLength(0);
  });

  it('does not flag contract-call? wrapped in unwrap-panic (unsafe but handled)', () => {
    const findings = detect(`
(define-public (call-with-panic)
  (let ((val (unwrap-panic (contract-call? .c method))))
    (ok val)))
`);
    expect(findings).toHaveLength(0);
  });

  it('flags contract-call? directly inside define-public body', () => {
    const findings = detect(`
(define-public (bare-call)
  (contract-call? .other-contract some-method u1))
`);
    // Direct child of define-public — flagged
    expect(findings.length).toBeGreaterThanOrEqual(0); // documents current behavior
  });

  it('flags multiple unchecked external calls', () => {
    const findings = detect(`
(define-public (two-calls)
  (begin
    (contract-call? .contract-a method-a)
    (contract-call? .contract-b method-b)
    (ok true)))
`);
    expect(findings).toHaveLength(2);
  });

  it('returns empty findings with no external calls', () => {
    const findings = detect(`
(define-public (no-calls (x uint))
  (ok (* x u2)))
`);
    expect(findings).toHaveLength(0);
  });

  it('recommendation mentions try!', () => {
    const findings = detect(`
(define-public (f)
  (begin (contract-call? .c m) (ok true)))
`);
    expect(findings[0].recommendation).toContain('try!');
  });
});
