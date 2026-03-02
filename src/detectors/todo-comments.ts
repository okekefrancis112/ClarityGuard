/**
 * Detector: TODO/FIXME Comments
 * Finds TODO, FIXME, HACK, and XXX comments left in contract code.
 * These indicate incomplete or provisional implementations that
 * should be resolved before deployment.
 */

import { ClarityNode } from "../parser";
import { Detector, Finding } from "./index";

const TODO_PATTERNS = [
  { pattern: /;\s*TODO\b/i, label: "TODO" },
  { pattern: /;\s*FIXME\b/i, label: "FIXME" },
  { pattern: /;\s*HACK\b/i, label: "HACK" },
  { pattern: /;\s*XXX\b/i, label: "XXX" },
  { pattern: /;\s*BUG\b/i, label: "BUG" },
  { pattern: /;\s*WARN(?:ING)?\b/i, label: "WARNING" },
];

export const todoComments: Detector = {
  id: "todo-comments",
  name: "TODO/FIXME Comment",
  severity: "info",
  description:
    "TODO, FIXME, HACK, and similar comments indicate unfinished work. These should be resolved before deploying to mainnet.",

  detect(_ast: ClarityNode[], source: string): Finding[] {
    const findings: Finding[] = [];
    const lines = source.split("\n");

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      for (const { pattern, label } of TODO_PATTERNS) {
        if (pattern.test(line)) {
          // Extract the comment text
          const commentStart = line.indexOf(";");
          const commentText =
            commentStart >= 0 ? line.slice(commentStart + 1).trim() : line.trim();

          findings.push({
            detector: this.id,
            severity: this.severity,
            title: `${label} comment found`,
            description: `"${commentText}" at line ${i + 1}. This indicates unfinished or provisional code.`,
            line: i + 1,
            column: commentStart + 1,
            recommendation: `Resolve the ${label} before deploying to mainnet.`,
          });
          break; // only report one match per line
        }
      }
    }

    return findings;
  },
};
