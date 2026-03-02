/**
 * Detector: Missing Input Validation
 * Finds public functions that accept uint/int parameters but never
 * validate them (e.g., no > 0 check, no bounds check).
 * Common source of bugs in DeFi contracts (zero amounts, overflow).
 */

import { ClarityNode, getFunctionName, walkAST } from "../parser";
import { Detector, Finding } from "./index";

const NUMERIC_TYPES = new Set(["uint", "int"]);

const VALIDATION_FUNCTIONS = new Set([
  ">",
  "<",
  ">=",
  "<=",
  "is-eq",
  "asserts!",
  "assert!",
]);

function getPublicFunctionParams(
  node: ClarityNode
): { name: string; type: string; line: number }[] {
  const params: { name: string; type: string; line: number }[] = [];

  if (
    node.type !== "list" ||
    !node.children ||
    node.children.length < 2
  )
    return params;

  const signature = node.children[1];
  if (signature.type !== "list" || !signature.children) return params;

  // Skip the function name (first child), rest are parameters
  for (let i = 1; i < signature.children.length; i++) {
    const param = signature.children[i];
    if (param.type === "list" && param.children && param.children.length >= 2) {
      const paramName = param.children[0];
      const paramType = param.children[1];
      if (
        paramName.type === "symbol" &&
        paramType.type === "symbol" &&
        NUMERIC_TYPES.has(paramType.value as string)
      ) {
        params.push({
          name: paramName.value as string,
          type: paramType.value as string,
          line: param.line,
        });
      }
    }
  }

  return params;
}

function paramIsValidated(node: ClarityNode, paramName: string): boolean {
  let found = false;

  walkAST([node], (child) => {
    if (found) return;
    if (child.type !== "list" || !child.children) return;

    const fn = getFunctionName(child);
    if (!fn || !VALIDATION_FUNCTIONS.has(fn)) return;

    // Check if paramName appears in this validation expression
    walkAST(child.children, (inner) => {
      if (inner.type === "symbol" && inner.value === paramName) {
        found = true;
      }
    });
  });

  return found;
}

export const missingInputValidation: Detector = {
  id: "missing-input-validation",
  name: "Missing Input Validation",
  severity: "medium",
  description:
    "Public functions with numeric parameters (uint/int) that lack bounds checking. Zero amounts, negative values, or extreme values can cause unexpected behavior in DeFi logic.",

  detect(ast: ClarityNode[]): Finding[] {
    const findings: Finding[] = [];

    for (const node of ast) {
      const defType = getFunctionName(node);
      if (defType !== "define-public") continue;

      const params = getPublicFunctionParams(node);

      for (const param of params) {
        if (!paramIsValidated(node, param.name)) {
          const fnName =
            node.children &&
            node.children[1]?.type === "list" &&
            node.children[1].children?.[0]?.type === "symbol"
              ? (node.children[1].children[0].value as string)
              : "unknown";

          findings.push({
            detector: this.id,
            severity: this.severity,
            title: `Unvalidated parameter '${param.name}' in '${fnName}'`,
            description: `Numeric parameter '${param.name}' (${param.type}) in public function '${fnName}' has no bounds checking. A caller could pass zero, max-uint, or other edge values.`,
            line: param.line,
            column: 1,
            recommendation: `Add validation: (asserts! (> ${param.name} u0) (err ERR-INVALID-AMOUNT)) at the start of the function.`,
          });
        }
      }
    }

    return findings;
  },
};
