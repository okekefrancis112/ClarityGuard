/**
 * ClarityGuard - Detector Interface
 */

import { ClarityNode } from "../parser";

export type Severity = "critical" | "high" | "medium" | "low" | "info";

export interface Finding {
  detector: string;
  severity: Severity;
  title: string;
  description: string;
  line: number;
  column: number;
  snippet?: string;
  recommendation?: string;
}

export interface Detector {
  id: string;
  name: string;
  severity: Severity;
  description: string;
  detect: (ast: ClarityNode[], source: string) => Finding[];
}
