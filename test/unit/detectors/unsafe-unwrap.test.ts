import { describe, it, expect } from 'vitest';
import { parse } from '../../../src/parser';
import { unsafeUnwrap } from '../../../src/detectors/unsafe-unwrap';

function detect(source: string) {
  return unsafeUnwrap.detect(parse(source), source);
}

describe('unsafe-unwrap detector', () => {
  it('flags unwrap-panic', () => {
    const findings = detect(`
(define-public (do-thing)
  (let ((val (unwrap-panic (get-value))))
    (ok val)))
`);
    expect(findings).toHaveLength(1);
    expect(findings[0].severity).toBe('high');
    expect(findings[0].detector).toBe('unsafe-unwrap');
    expect(findings[0].title).toContain('unwrap-panic');
  });

  it('flags unwrap-err-panic', () => {
    const findings = detect(`
(define-public (do-thing)
  (let ((val (unwrap-err-panic (get-value))))
    (ok val)))
`);
    expect(findings).toHaveLength(1);
    expect(findings[0].title).toContain('unwrap-err-panic');
  });

  it('flags multiple unwrap-panic usages', () => {
    const findings = detect(`
(define-public (multi)
  (let ((a (unwrap-panic (fn-a)))
        (b (unwrap-panic (fn-b))))
    (ok (+ a b))))
`);
    expect(findings).toHaveLength(2);
  });

  it('does not flag unwrap!', () => {
    const findings = detect(`
(define-public (safe)
  (let ((val (unwrap! (get-value) (err u1))))
    (ok val)))
`);
    expect(findings).toHaveLength(0);
  });

  it('does not flag try!', () => {
    const findings = detect(`
(define-public (safe)
  (let ((val (try! (get-value))))
    (ok val)))
`);
    expect(findings).toHaveLength(0);
  });

  it('does not flag unwrap-err!', () => {
    const findings = detect(`
(define-public (safe)
  (let ((err-val (unwrap-err! (get-value) (err u1))))
    (ok err-val)))
`);
    expect(findings).toHaveLength(0);
  });

  it('detects unwrap-panic inside nested expressions', () => {
    const findings = detect(`
(define-public (nested)
  (begin
    (map-set balances tx-sender (unwrap-panic (get-balance tx-sender)))
    (ok true)))
`);
    expect(findings).toHaveLength(1);
  });

  it('returns empty findings for clean contract', () => {
    const findings = detect(`
(define-public (get-info)
  (ok (var-get info)))
`);
    expect(findings).toHaveLength(0);
  });

  it('reports correct line number', () => {
    const findings = detect(`(define-public (foo)
  (unwrap-panic (bar)))`);
    expect(findings[0].line).toBe(2);
  });
});
