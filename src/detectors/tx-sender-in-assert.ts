/**
 * Detector: tx-sender in Assert
 * In inter-contract calls, tx-sender can be manipulated.
 * Using tx-sender for authorization in assert/asserts! may be unsafe
 * when the contract is called by another contract.
 * contract-caller is often the safer choice for authorization.
 */

import { ClarityNode, walkAST, getFunctionName } from "../parser";
import { Detector, Finding } from "./index";

function nodeContainsTxSender(node: ClarityNode): boolean {
  if (node.type === "symbol" && node.value === "tx-sender") return true;
  if (node.type === "list" && node.children) {
    return node.children.some((child) => nodeContainsTxSender(child));
  }
  return false;
}

function isInPublicFunction(ast: ClarityNode[], targetLine: number): boolean {
  for (const node of ast) {
    const fn = getFunctionName(node);
    if (fn === "define-public" && node.line <= targetLine) {
      return true;
    }
  }
  return false;
}

export const txSenderInAssert: Detector = {
  id: "tx-sender-in-assert",
  name: "tx-sender in Authorization Assert",
  severity: "medium",
  description:
    "tx-sender can be manipulated through inter-contract calls. Using it in asserts! for authorization may allow unauthorized access when called from another contract. Prefer contract-caller.",

  detect(ast: ClarityNode[]): Finding[] {
    const findings: Finding[] = [];

    walkAST(ast, (node) => {
      if (node.type !== "list" || !node.children) return;

      const fn = getFunctionName(node);
      if (fn !== "asserts!" && fn !== "assert!") return;

      // Check if the assertion condition references tx-sender
      if (node.children.length >= 2 && nodeContainsTxSender(node.children[1])) {
        findings.push({
          detector: this.id,
          severity: this.severity,
          title: "tx-sender used in authorization assert",
          description: `Authorization check at line ${node.line} uses tx-sender. In inter-contract calls, tx-sender refers to the original transaction signer, not the immediate caller. A malicious contract could relay calls on behalf of users.`,
          line: node.line,
          column: node.column,
          recommendation:
            "Consider using contract-caller instead of tx-sender for authorization. contract-caller always refers to the immediate caller, preventing relay attacks through intermediary contracts.",
        });
      }
    });

    return findings;
  },
};
