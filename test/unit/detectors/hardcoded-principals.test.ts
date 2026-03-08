import { describe, it, expect } from 'vitest';
import { parse } from '../../../src/parser';
import { hardcodedPrincipals } from '../../../src/detectors/hardcoded-principals';

function detect(source: string) {
  return hardcodedPrincipals.detect(parse(source), source);
}

const ADDR = "'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7";
const ADDR2 = "'SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE";

describe('hardcoded-principals detector', () => {
  it('flags a principal used directly in function logic', () => {
    const findings = detect(`
(define-public (send-to-hardcoded (amount uint))
  (stx-transfer? amount tx-sender ${ADDR}))
`);
    expect(findings).toHaveLength(1);
    expect(findings[0].severity).toBe('low');
    expect(findings[0].detector).toBe('hardcoded-principals');
  });

  it('does not flag a principal defined inside define-constant', () => {
    const findings = detect(`
(define-constant CONTRACT-OWNER ${ADDR})
`);
    expect(findings).toHaveLength(0);
  });

  it('does not flag a constant principal used later in logic', () => {
    // The principal in the define-constant is on the constant's line —
    // only the constant line is exempted. If the same address appears on
    // a different line in code it would still flag. This tests the constant itself.
    const findings = detect(`
(define-constant OWNER ${ADDR})
(define-public (check)
  (asserts! (is-eq contract-caller OWNER) (err u1))
  (ok true))
`);
    expect(findings).toHaveLength(0);
  });

  it('flags multiple hardcoded principals', () => {
    const findings = detect(`
(define-public (multi)
  (begin
    (stx-transfer? u100 tx-sender ${ADDR})
    (stx-transfer? u100 tx-sender ${ADDR2})))
`);
    expect(findings).toHaveLength(2);
  });

  it('flags hardcoded principal in map-set', () => {
    const findings = detect(`
(define-public (whitelist)
  (map-set allowed-list ${ADDR} true))
`);
    expect(findings).toHaveLength(1);
  });

  it('returns empty findings when no principals are present', () => {
    const findings = detect(`
(define-public (add (a uint) (b uint))
  (ok (+ a b)))
`);
    expect(findings).toHaveLength(0);
  });

  it('recommendation mentions define-constant', () => {
    const findings = detect(`(stx-transfer? u1 tx-sender ${ADDR})`);
    expect(findings[0].recommendation).toContain('define-constant');
  });
});
