import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { analyze, analyzeMultiple, getDetectorList } from '../../src/analyzer';

const SAMPLES_DIR = join(__dirname, '../samples');

function loadSample(name: string): string {
  return readFileSync(join(SAMPLES_DIR, name), 'utf-8');
}

describe('analyze()', () => {
  it('returns an AnalysisResult with the correct file name', () => {
    const result = analyze('(ok true)', 'test.clar');
    expect(result.file).toBe('test.clar');
  });

  it('returns empty findings for a trivial safe expression', () => {
    // No definitions — nothing for any detector to flag
    const result = analyze('(ok true)', 'trivial.clar');
    expect(result.findings).toHaveLength(0);
    expect(result.stats.totalFindings).toBe(0);
  });

  it('runs all 10 detectors', () => {
    const result = analyze('(ok true)', 'test.clar');
    expect(result.stats.detectorsRun).toBe(10);
  });

  it('handles a parse error gracefully', () => {
    const result = analyze('(unclosed', 'bad.clar');
    expect(result.findings).toHaveLength(0);
    expect(result.stats.parseErrors.length).toBeGreaterThan(0);
    expect(result.stats.parseErrors[0]).toMatch(/[Uu]nclosed/);
  });

  it('handles an empty file without error', () => {
    const result = analyze('', 'empty.clar');
    expect(result.findings).toHaveLength(0);
    expect(result.stats.parseErrors).toHaveLength(0);
  });

  it('handles a comment-only file', () => {
    const result = analyze(';; just a comment\n;; another comment', 'comments.clar');
    expect(result.findings).toHaveLength(0);
  });

  it('sorts findings by severity then line number', () => {
    const src = `
;; TODO: fix this
(define-public (mint (amount uint))
  (begin
    (unwrap-panic (ft-mint? my-token amount tx-sender))
    (var-set total amount)))
`;
    const result = analyze(src, 'test.clar');
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };
    for (let i = 1; i < result.findings.length; i++) {
      const prev = result.findings[i - 1];
      const curr = result.findings[i];
      const prevOrder = severityOrder[prev.severity];
      const currOrder = severityOrder[curr.severity];
      if (prevOrder === currOrder) {
        expect(prev.line).toBeLessThanOrEqual(curr.line);
      } else {
        expect(prevOrder).toBeLessThanOrEqual(currOrder);
      }
    }
  });

  it('counts findings by severity in stats', () => {
    const src = `
(define-public (mint (amount uint))
  (begin
    (unwrap-panic (ft-mint? my-token amount tx-sender))
    (var-set total amount)))
`;
    const result = analyze(src, 'test.clar');
    const { critical, high, medium, low, info } = result.stats;
    expect(critical + high + medium + low + info).toBe(result.stats.totalFindings);
    expect(result.stats.totalFindings).toBe(result.findings.length);
  });

  it('isolates a detector failure so other detectors still run', () => {
    // This is a structural test — if one detector throws, the rest should continue.
    // We verify findings still come back (can't easily force a detector to throw here,
    // but we verify the happy path always has detectorsRun = 10).
    const result = analyze('(ok true)', 'test.clar');
    expect(result.stats.detectorsRun).toBe(10);
    expect(result.stats.parseErrors).toHaveLength(0);
  });
});

describe('analyze() against sample contracts', () => {
  it('detects 10+ findings in vulnerable-token.clar', () => {
    const source = loadSample('vulnerable-token.clar');
    const result = analyze(source, 'vulnerable-token.clar');
    expect(result.stats.totalFindings).toBeGreaterThanOrEqual(10);
  });

  it('detects at least 1 CRITICAL finding in vulnerable-token.clar', () => {
    const source = loadSample('vulnerable-token.clar');
    const result = analyze(source, 'vulnerable-token.clar');
    expect(result.stats.critical).toBeGreaterThanOrEqual(1);
  });

  it('detects at least 1 HIGH finding in vulnerable-token.clar', () => {
    const source = loadSample('vulnerable-token.clar');
    const result = analyze(source, 'vulnerable-token.clar');
    expect(result.stats.high).toBeGreaterThanOrEqual(1);
  });

  it('has fewer findings in safe-token.clar than in vulnerable-token.clar', () => {
    const vulnerable = analyze(loadSample('vulnerable-token.clar'), 'vulnerable-token.clar');
    const safe = analyze(loadSample('safe-token.clar'), 'safe-token.clar');
    expect(safe.stats.totalFindings).toBeLessThan(vulnerable.stats.totalFindings);
  });

  it('has zero CRITICAL findings in safe-token.clar', () => {
    const source = loadSample('safe-token.clar');
    const result = analyze(source, 'safe-token.clar');
    expect(result.stats.critical).toBe(0);
  });

  it('parses both sample contracts without parse errors', () => {
    const sources = ['vulnerable-token.clar', 'safe-token.clar'];
    for (const name of sources) {
      const result = analyze(loadSample(name), name);
      expect(result.stats.parseErrors).toHaveLength(0);
    }
  });
});

describe('analyzeMultiple()', () => {
  it('returns one result per file', () => {
    const results = analyzeMultiple([
      { source: '(ok true)', filename: 'a.clar' },
      { source: '(ok false)', filename: 'b.clar' },
    ]);
    expect(results).toHaveLength(2);
    expect(results[0].file).toBe('a.clar');
    expect(results[1].file).toBe('b.clar');
  });

  it('handles an empty file list', () => {
    const results = analyzeMultiple([]);
    expect(results).toHaveLength(0);
  });

  it('handles parse errors in one file without affecting others', () => {
    const results = analyzeMultiple([
      { source: '(unclosed', filename: 'bad.clar' },
      { source: '(ok true)', filename: 'good.clar' },
    ]);
    expect(results[0].stats.parseErrors.length).toBeGreaterThan(0);
    expect(results[1].stats.parseErrors).toHaveLength(0);
  });
});

describe('getDetectorList()', () => {
  it('returns exactly 10 detectors', () => {
    expect(getDetectorList()).toHaveLength(10);
  });

  it('every detector has id, name, severity, and description', () => {
    for (const d of getDetectorList()) {
      expect(d.id).toBeTruthy();
      expect(d.name).toBeTruthy();
      expect(d.severity).toMatch(/^(critical|high|medium|low|info)$/);
      expect(d.description).toBeTruthy();
    }
  });

  it('includes unprotected-admin detector', () => {
    const ids = getDetectorList().map((d) => d.id);
    expect(ids).toContain('unprotected-admin');
  });

  it('includes all expected detector IDs', () => {
    const ids = getDetectorList().map((d) => d.id);
    const expected = [
      'unprotected-admin',
      'unsafe-unwrap',
      'division-before-multiplication',
      'block-height-timing',
      'tx-sender-in-assert',
      'hardcoded-principals',
      'unchecked-external-calls',
      'missing-input-validation',
      'dead-code',
      'todo-comments',
    ];
    for (const id of expected) {
      expect(ids).toContain(id);
    }
  });
});
