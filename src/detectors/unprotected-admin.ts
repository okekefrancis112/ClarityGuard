/**
 * Detector: Unprotected Admin Functions
 * Finds public functions that modify state (data-var set, map operations, token operations)
 * without checking tx-sender or contract-caller for authorization.
 */

import { ClarityNode, getFunctionName, walkAST } from "../parser";
import { Detector, Finding } from "./index";

const STATE_MODIFYING_FUNCTIONS = new Set([
  "var-set",
  "map-set",
  "map-delete",
  "map-insert",
  "stx-transfer?",
  "stx-burn?",
  "ft-mint?",
  "ft-transfer?",
  "ft-burn?",
  "nft-mint?",
  "nft-transfer?",
  "nft-burn?",
]);

const AUTH_CHECK_PATTERNS = new Set([
  "tx-sender",
  "contract-caller",
]);

function containsAuthCheck(node: ClarityNode): boolean {
  if (node.type === "symbol" && AUTH_CHECK_PATTERNS.has(node.value as string)) {
    return true;
  }
  if (node.type === "list" && node.children) {
    return node.children.some((child) => containsAuthCheck(child));
  }
  return false;
}

function containsStateModification(node: ClarityNode): boolean {
  if (node.type === "list" && node.children && node.children.length > 0) {
    const fnName = getFunctionName(node);
    if (fnName && STATE_MODIFYING_FUNCTIONS.has(fnName)) {
      return true;
    }
    return node.children.some((child) => containsStateModification(child));
  }
  return false;
}

function getDefinedFunctionName(node: ClarityNode): string | null {
  if (
    node.type === "list" &&
    node.children &&
    node.children.length >= 2
  ) {
    const second = node.children[1];
    // (define-public (function-name ...) ...)
    if (second.type === "list" && second.children && second.children.length > 0) {
      if (second.children[0].type === "symbol") {
        return second.children[0].value as string;
      }
    }
    // (define-public function-name ...)
    if (second.type === "symbol") {
      return second.value as string;
    }
  }
  return null;
}

export const unprotectedAdmin: Detector = {
  id: "unprotected-admin",
  name: "Unprotected Admin Function",
  severity: "critical",
  description:
    "Public functions that modify state without verifying tx-sender or contract-caller can be called by anyone.",

  detect(ast: ClarityNode[]): Finding[] {
    const findings: Finding[] = [];

    for (const node of ast) {
      const defType = getFunctionName(node);
      if (defType !== "define-public") continue;

      const fnName = getDefinedFunctionName(node) || "unknown";

      if (containsStateModification(node) && !containsAuthCheck(node)) {
        findings.push({
          detector: this.id,
          severity: this.severity,
          title: `Unprotected state-modifying function: ${fnName}`,
          description: `Public function '${fnName}' modifies contract state but does not check tx-sender or contract-caller. Any address can call this function.`,
          line: node.line,
          column: node.column,
          recommendation:
            "Add an authorization check using (asserts! (is-eq tx-sender CONTRACT-OWNER) (err ERR-NOT-AUTHORIZED)) at the beginning of the function.",
        });
      }
    }

    return findings;
  },
};
