/**
 * ClarityGuard - Main Analysis Engine
 * Orchestrates parsing and detector execution.
 */

import { parse, ClarityNode } from "./parser";
import { Detector, Finding, Severity } from "./detectors/index";
import { unprotectedAdmin } from "./detectors/unprotected-admin";
import { unsafeUnwrap } from "./detectors/unsafe-unwrap";
import { divisionBeforeMultiplication } from "./detectors/division-before-multiplication";
import { blockHeightTiming } from "./detectors/block-height-timing";
import { txSenderInAssert } from "./detectors/tx-sender-in-assert";
import { hardcodedPrincipals } from "./detectors/hardcoded-principals";
import { uncheckedExternalCalls } from "./detectors/unchecked-external-calls";
import { missingInputValidation } from "./detectors/missing-input-validation";
import { deadCode } from "./detectors/dead-code";
import { todoComments } from "./detectors/todo-comments";

const ALL_DETECTORS: Detector[] = [
  unprotectedAdmin,
  unsafeUnwrap,
  divisionBeforeMultiplication,
  blockHeightTiming,
  txSenderInAssert,
  hardcodedPrincipals,
  uncheckedExternalCalls,
  missingInputValidation,
  deadCode,
  todoComments,
];

export interface AnalysisResult {
  file: string;
  findings: Finding[];
  stats: {
    totalFindings: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
    detectorsRun: number;
    parseErrors: string[];
  };
}

export function analyze(source: string, filename: string): AnalysisResult {
  const parseErrors: string[] = [];
  let ast: ClarityNode[] = [];

  try {
    ast = parse(source);
  } catch (err: any) {
    parseErrors.push(err.message);
    return {
      file: filename,
      findings: [],
      stats: {
        totalFindings: 0,
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
        info: 0,
        detectorsRun: 0,
        parseErrors,
      },
    };
  }

  const findings: Finding[] = [];

  for (const detector of ALL_DETECTORS) {
    try {
      const detectorFindings = detector.detect(ast, source);
      findings.push(...detectorFindings);
    } catch (err: any) {
      parseErrors.push(
        `Detector "${detector.id}" failed: ${err.message}`
      );
    }
  }

  // Sort by severity then line number
  const severityOrder: Record<Severity, number> = {
    critical: 0,
    high: 1,
    medium: 2,
    low: 3,
    info: 4,
  };

  findings.sort((a, b) => {
    const sevDiff = severityOrder[a.severity] - severityOrder[b.severity];
    if (sevDiff !== 0) return sevDiff;
    return a.line - b.line;
  });

  return {
    file: filename,
    findings,
    stats: {
      totalFindings: findings.length,
      critical: findings.filter((f) => f.severity === "critical").length,
      high: findings.filter((f) => f.severity === "high").length,
      medium: findings.filter((f) => f.severity === "medium").length,
      low: findings.filter((f) => f.severity === "low").length,
      info: findings.filter((f) => f.severity === "info").length,
      detectorsRun: ALL_DETECTORS.length,
      parseErrors,
    },
  };
}

export function analyzeMultiple(
  files: { source: string; filename: string }[]
): AnalysisResult[] {
  return files.map((f) => analyze(f.source, f.filename));
}

export function getDetectorList(): { id: string; name: string; severity: Severity; description: string }[] {
  return ALL_DETECTORS.map((d) => ({
    id: d.id,
    name: d.name,
    severity: d.severity,
    description: d.description,
  }));
}
