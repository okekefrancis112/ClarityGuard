/**
 * Browser entry point for ClarityGuard.
 * Exposes the analysis engine to the browser via a global object.
 * Does NOT import index.ts (CLI) or reporter.ts (Node APIs).
 */

import { analyze, getDetectorList } from "./analyzer";
import type { AnalysisResult } from "./analyzer";
import type { Finding, Severity } from "./detectors/index";

export { analyze, getDetectorList };
export type { AnalysisResult, Finding, Severity };

// Expose on window for <script> usage
(globalThis as any).ClarityGuard = { analyze, getDetectorList };
