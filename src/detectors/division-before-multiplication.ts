/**
 * Detector: Division Before Multiplication
 * Finds patterns where division is performed before multiplication,
 * causing precision loss in integer arithmetic.
 */

import { ClarityNode, walkAST, getFunctionName } from "../parser";
import { Detector, Finding } from "./index";

function containsMultiplication(node: ClarityNode): boolean {
  if (node.type === "list" && node.children) {
    const fn = getFunctionName(node);
    if (fn === "*") return true;
    return node.children.some((child) => containsMultiplication(child));
  }
  return false;
}

export const divisionBeforeMultiplication: Detector = {
  id: "division-before-multiplication",
  name: "Division Before Multiplication",
  severity: "medium",
  description:
    "Integer division before multiplication causes precision loss. Since Clarity only supports integers, (/ x y) truncates, and multiplying the result amplifies the error.",

  detect(ast: ClarityNode[]): Finding[] {
    const findings: Finding[] = [];

    walkAST(ast, (node) => {
      if (node.type !== "list" || !node.children) return;

      const fn = getFunctionName(node);
      if (fn !== "/") return;

      // Check if the result of this division is used inside a multiplication
      // We check if any parent or sibling context wraps this in *
      // Simpler heuristic: check if this division node appears as an argument to *
      // For now, check if any child of this division contains multiplication
      // or if the division result feeds into a multiplication

      // Direct pattern: (* (/ a b) c)
      // We detect the inverse: this is a division node. Check if it's a child of a * node.
      // Since we don't have parent tracking in walkAST easily, let's find
      // (* ... (/ ...) ...) patterns by scanning for * nodes with / children

      // Alternate approach: find all * nodes and check if they have / children
    });

    // Better approach: find (* ... (/ ...) ...) patterns
    walkAST(ast, (node) => {
      if (node.type !== "list" || !node.children) return;
      const fn = getFunctionName(node);
      if (fn !== "*") return;

      // Check if any argument to * is a division
      for (let i = 1; i < node.children.length; i++) {
        const child = node.children[i];
        if (child.type === "list" && getFunctionName(child) === "/") {
          findings.push({
            detector: this.id,
            severity: this.severity,
            title: "Division before multiplication (precision loss)",
            description: `A division operation at line ${child.line} is performed before multiplication. In integer arithmetic, this causes precision loss due to truncation.`,
            line: child.line,
            column: child.column,
            recommendation:
              "Reorder to multiply before dividing: (* a b) then (/ result c) instead of (* (/ a c) b).",
          });
        }
      }
    });

    return findings;
  },
};
