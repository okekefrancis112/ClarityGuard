/**
 * Detector: Hardcoded Principals
 * Finds hardcoded principal addresses in contract logic.
 * These are fragile and make contracts difficult to maintain or migrate.
 */

import { ClarityNode, walkAST } from "../parser";
import { Detector, Finding } from "./index";

export const hardcodedPrincipals: Detector = {
  id: "hardcoded-principals",
  name: "Hardcoded Principal Address",
  severity: "low",
  description:
    "Hardcoded principal addresses reduce flexibility and make contracts harder to maintain. Use define-constant or configurable data-var for addresses.",

  detect(ast: ClarityNode[]): Finding[] {
    const findings: Finding[] = [];
    const constantPrincipals = new Set<number>(); // lines where principals are in constants (OK)

    // First pass: find principals in define-constant (acceptable)
    for (const node of ast) {
      if (
        node.type === "list" &&
        node.children &&
        node.children[0]?.type === "symbol" &&
        node.children[0].value === "define-constant"
      ) {
        walkAST([node], (child) => {
          if (child.type === "principal") {
            constantPrincipals.add(child.line);
          }
        });
      }
    }

    // Second pass: find principals NOT in constants
    walkAST(ast, (node, parent) => {
      if (node.type === "principal" && !constantPrincipals.has(node.line)) {
        findings.push({
          detector: this.id,
          severity: this.severity,
          title: "Hardcoded principal in contract logic",
          description: `Principal address '${node.value}' is hardcoded at line ${node.line}. If this address needs to change, the entire contract must be redeployed.`,
          line: node.line,
          column: node.column,
          recommendation:
            "Extract the principal into a (define-constant) or a (define-data-var) that can be updated by an admin function.",
        });
      }
    });

    return findings;
  },
};
