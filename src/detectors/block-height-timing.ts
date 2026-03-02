/**
 * Detector: Block Height Used as Time
 * Finds usage of block-height or burn-block-height for time-sensitive logic.
 * Block times on Bitcoin/Stacks are variable and unreliable for precise timing.
 * Clarity 4 introduced stacks-block-time for more reliable timestamps.
 */

import { ClarityNode, walkAST } from "../parser";
import { Detector, Finding } from "./index";

const BLOCK_HEIGHT_SYMBOLS = new Set([
  "block-height",
  "burn-block-height",
  "stacks-block-height",
]);

const TIME_COMPARISON_CONTEXT = new Set([
  ">",
  "<",
  ">=",
  "<=",
  "is-eq",
]);

export const blockHeightTiming: Detector = {
  id: "block-height-timing",
  name: "Block Height as Time Tracker",
  severity: "medium",
  description:
    "Using block-height for time-sensitive operations is unreliable. Bitcoin/Stacks block times vary. Consider using stacks-block-time (Clarity 4) for timestamp-based logic.",

  detect(ast: ClarityNode[]): Finding[] {
    const findings: Finding[] = [];
    const reported = new Set<number>(); // avoid duplicate line reports

    walkAST(ast, (node, parent) => {
      if (
        node.type === "symbol" &&
        BLOCK_HEIGHT_SYMBOLS.has(node.value as string) &&
        !reported.has(node.line)
      ) {
        reported.add(node.line);
        const symbol = node.value as string;

        findings.push({
          detector: this.id,
          severity: this.severity,
          title: `'${symbol}' used for timing logic`,
          description: `'${symbol}' is used at line ${node.line}. Block heights are unreliable for time-sensitive operations because block times vary (10 seconds to minutes on Stacks).`,
          line: node.line,
          column: node.column,
          recommendation:
            symbol === "block-height"
              ? "If using Clarity 4+, consider stacks-block-time for timestamp-based logic. If block counting is intentional, document the assumption."
              : "Document the timing assumption. Block heights should not be used for deadlines or time-locks where precision matters.",
        });
      }
    });

    return findings;
  },
};
