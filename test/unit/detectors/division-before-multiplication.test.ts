import { describe, it, expect } from 'vitest';
import { parse } from '../../../src/parser';
import { divisionBeforeMultiplication } from '../../../src/detectors/division-before-multiplication';

function detect(source: string) {
  return divisionBeforeMultiplication.detect(parse(source), source);
}

describe('division-before-multiplication detector', () => {
  it('flags (* (/ a b) c) pattern', () => {
    const findings = detect(`
(define-public (calculate (a uint) (b uint) (c uint))
  (ok (* (/ a b) c)))
`);
    expect(findings).toHaveLength(1);
    expect(findings[0].severity).toBe('medium');
    expect(findings[0].detector).toBe('division-before-multiplication');
  });

  it('flags (* c (/ a b)) pattern', () => {
    const findings = detect(`
(define-private (calc (a uint) (b uint) (c uint))
  (* c (/ a b)))
`);
    expect(findings).toHaveLength(1);
  });

  it('flags multiple instances', () => {
    const findings = detect(`
(define-public (fee-calc (amount uint) (rate uint) (scale uint))
  (begin
    (let ((fee (* (/ amount u100) rate))
          (adjusted (* (/ fee u10) scale)))
      (ok adjusted))))
`);
    expect(findings).toHaveLength(2);
  });

  it('does not flag (/ (* a b) c) — multiply first', () => {
    const findings = detect(`
(define-public (safe-calc (a uint) (b uint) (c uint))
  (ok (/ (* a b) c)))
`);
    expect(findings).toHaveLength(0);
  });

  it('does not flag standalone division', () => {
    const findings = detect(`
(define-public (just-div (a uint) (b uint))
  (ok (/ a b)))
`);
    expect(findings).toHaveLength(0);
  });

  it('does not flag standalone multiplication', () => {
    const findings = detect(`
(define-public (just-mul (a uint) (b uint))
  (ok (* a b)))
`);
    expect(findings).toHaveLength(0);
  });

  it('does not flag division inside addition', () => {
    const findings = detect(`
(define-public (add-divs (a uint) (b uint) (c uint) (d uint))
  (ok (+ (/ a b) (/ c d))))
`);
    expect(findings).toHaveLength(0);
  });

  it('reports correct line of the division node', () => {
    const findings = detect(`(define-public (f (a uint) (b uint) (c uint))
  (ok
    (* (/ a b) c)))`);
    expect(findings[0].line).toBe(3);
  });
});
