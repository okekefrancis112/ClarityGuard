/**
 * Detector: Unsafe Unwrap Usage
 * Finds usage of unwrap-panic and unwrap-err-panic which cause
 * the transaction to abort with no meaningful error.
 */

import { ClarityNode, walkAST } from "../parser";
import { Detector, Finding } from "./index";

const UNSAFE_UNWRAPS = new Set(["unwrap-panic", "unwrap-err-panic"]);

export const unsafeUnwrap: Detector = {
  id: "unsafe-unwrap",
  name: "Unsafe Unwrap (Panic)",
  severity: "high",
  description:
    "unwrap-panic and unwrap-err-panic abort the transaction with no error info, making debugging impossible and potentially locking funds.",

  detect(ast: ClarityNode[]): Finding[] {
    const findings: Finding[] = [];

    walkAST(ast, (node, parent) => {
      if (
        node.type === "list" &&
        node.children &&
        node.children.length > 0 &&
        node.children[0].type === "symbol" &&
        UNSAFE_UNWRAPS.has(node.children[0].value as string)
      ) {
        const fnName = node.children[0].value as string;
        findings.push({
          detector: this.id,
          severity: this.severity,
          title: `Unsafe ${fnName} usage`,
          description: `'${fnName}' will abort the transaction on failure with no error information. This makes debugging difficult and can cause unexpected fund locking.`,
          line: node.line,
          column: node.column,
          recommendation: `Replace with 'unwrap!' or 'try!' which return meaningful error responses: (unwrap! <expr> (err <error-code>))`,
        });
      }
    });

    return findings;
  },
};
