/**
 * Detector: Unchecked External Contract Calls
 * Finds calls to external contracts (contract-call?) where the response
 * is not checked with try!, unwrap!, or match.
 */

import { ClarityNode, walkAST, getFunctionName } from "../parser";
import { Detector, Finding } from "./index";

const RESPONSE_HANDLERS = new Set([
  "try!",
  "unwrap!",
  "unwrap-err!",
  "unwrap-panic",
  "unwrap-err-panic",
  "match",
  "asserts!",
]);

export const uncheckedExternalCalls: Detector = {
  id: "unchecked-external-calls",
  name: "Unchecked External Contract Call",
  severity: "high",
  description:
    "Calls to external contracts via contract-call? return a response type. Ignoring the response can lead to silent failures where state changes proceed despite the external call failing.",

  detect(ast: ClarityNode[]): Finding[] {
    const findings: Finding[] = [];

    walkAST(ast, (node, parent) => {
      if (node.type !== "list" || !node.children) return;

      const fn = getFunctionName(node);
      if (fn !== "contract-call?") return;

      // Check if the parent is a response handler
      if (parent && parent.type === "list" && parent.children) {
        const parentFn = getFunctionName(parent);
        if (parentFn && RESPONSE_HANDLERS.has(parentFn)) {
          return; // Response is being handled
        }
      }

      // Check if this contract-call? is a direct child of begin or let (not wrapped in handler)
      if (parent && parent.type === "list") {
        const parentFn = getFunctionName(parent);
        if (
          parentFn === "begin" ||
          parentFn === "let" ||
          parentFn === "define-public" ||
          parentFn === "define-private"
        ) {
          findings.push({
            detector: this.id,
            severity: this.severity,
            title: "Unchecked external contract call",
            description: `contract-call? at line ${node.line} has its response ignored. If the external call fails, execution continues with potentially inconsistent state.`,
            line: node.line,
            column: node.column,
            recommendation:
              "Wrap the call with (try! (contract-call? ...)) or (match (contract-call? ...) ok-val ... err-val ...) to handle failures explicitly.",
          });
        }
      }
    });

    return findings;
  },
};
