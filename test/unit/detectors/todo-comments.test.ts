import { describe, it, expect } from 'vitest';
import { todoComments } from '../../../src/detectors/todo-comments';

// todo-comments operates on raw source, not the AST
function detect(source: string) {
  return todoComments.detect([], source);
}

describe('todo-comments detector', () => {
  it('flags a TODO comment', () => {
    const findings = detect(';; TODO: implement this properly');
    expect(findings).toHaveLength(1);
    expect(findings[0].severity).toBe('info');
    expect(findings[0].detector).toBe('todo-comments');
    expect(findings[0].title).toContain('TODO');
  });

  it('flags a FIXME comment', () => {
    const findings = detect('; FIXME: this is broken');
    expect(findings).toHaveLength(1);
    expect(findings[0].title).toContain('FIXME');
  });

  it('flags a HACK comment', () => {
    const findings = detect('; HACK: workaround for issue #42');
    expect(findings).toHaveLength(1);
    expect(findings[0].title).toContain('HACK');
  });

  it('flags an XXX comment', () => {
    const findings = detect('; XXX: dangerous code here');
    expect(findings).toHaveLength(1);
    expect(findings[0].title).toContain('XXX');
  });

  it('flags a BUG comment', () => {
    const findings = detect('; BUG: off by one error');
    expect(findings).toHaveLength(1);
    expect(findings[0].title).toContain('BUG');
  });

  it('flags a WARNING comment', () => {
    const findings = detect('; WARNING: do not call this directly');
    expect(findings).toHaveLength(1);
    expect(findings[0].title).toContain('WARNING');
  });

  it('flags a WARN comment (short form)', () => {
    const findings = detect('; WARN: unsafe operation');
    expect(findings).toHaveLength(1);
  });

  it('is case-insensitive', () => {
    const findings = detect('; todo: implement later');
    expect(findings).toHaveLength(1);
  });

  it('does not flag normal comments', () => {
    const findings = detect('; This is a normal comment explaining the logic');
    expect(findings).toHaveLength(0);
  });

  it('does not flag code that happens to contain todo as a variable name', () => {
    // This should not be flagged since there is no semicolon comment
    const findings = detect('(define-constant todo u1)');
    expect(findings).toHaveLength(0);
  });

  it('reports the correct line number', () => {
    const source = '(define-constant X u1)\n; TODO: fix this\n(define-constant Y u2)';
    const findings = detect(source);
    expect(findings[0].line).toBe(2);
  });

  it('reports only one finding per line even if multiple keywords match', () => {
    const findings = detect('; TODO FIXME HACK all on one line');
    expect(findings).toHaveLength(1);
  });

  it('flags multiple TODO comments across lines', () => {
    const source = [
      '; TODO: first thing',
      '(define-public (foo) (ok true))',
      '; FIXME: second thing',
    ].join('\n');
    const findings = detect(source);
    expect(findings).toHaveLength(2);
  });

  it('returns empty findings for clean source', () => {
    const findings = detect(`
;; ClarityGuard Token Contract
;; Implements SIP-010 fungible token standard

(define-constant CONTRACT-OWNER tx-sender)
(define-fungible-token my-token)
`);
    expect(findings).toHaveLength(0);
  });
});
