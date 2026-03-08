/**
 * Detector: Dead Code
 * Finds private functions and constants that are defined but never
 * referenced elsewhere in the contract.
 */

import { ClarityNode, getFunctionName, walkAST } from "../parser";
import { Detector, Finding } from "./index";

function getDefinedName(node: ClarityNode): string | null {
  if (!node.children || node.children.length < 2) return null;
  const second = node.children[1];

  // (define-private (fn-name ...) ...) or (define-read-only (fn-name ...) ...)
  if (second.type === "list" && second.children && second.children[0]?.type === "symbol") {
    return second.children[0].value as string;
  }
  // (define-constant NAME ...) or (define-data-var NAME ...)
  if (second.type === "symbol") {
    return second.value as string;
  }
  return null;
}

function collectAllSymbols(nodes: ClarityNode[], exclude: ClarityNode): Set<string> {
  const symbols = new Set<string>();

  // Filter at the top level so the entire subtree of `exclude` is skipped.
  // (Returning early inside the walkAST callback skips the node itself but
  // walkAST still recurses into its children, causing false "used" hits.)
  const filtered = nodes.filter((n) => n !== exclude);

  walkAST(filtered, (node) => {
    if (node.type === "symbol" && node.value) {
      symbols.add(node.value as string);
    }
  });

  return symbols;
}

export const deadCode: Detector = {
  id: "dead-code",
  name: "Dead Code (Unused Definition)",
  severity: "info",
  description:
    "Private functions, constants, or data vars that are defined but never referenced. Dead code increases contract size and deployment costs.",

  detect(ast: ClarityNode[]): Finding[] {
    const findings: Finding[] = [];

    // Collect all definitions that could be dead
    const candidates: { name: string; node: ClarityNode; kind: string }[] = [];

    for (const node of ast) {
      const defType = getFunctionName(node);
      if (!defType) continue;

      // Only check private functions, read-only functions, constants, and data-vars
      // Public functions are entry points and can't be "dead"
      if (
        defType === "define-private" ||
        defType === "define-read-only" ||
        defType === "define-constant" ||
        defType === "define-data-var"
      ) {
        const name = getDefinedName(node);
        if (name) {
          candidates.push({ name, node, kind: defType.replace("define-", "") });
        }
      }
    }

    if (candidates.length === 0) return findings;

    // For each candidate, check if its name appears anywhere else in the AST
    for (const candidate of candidates) {
      const allSymbols = collectAllSymbols(ast, candidate.node);

      if (!allSymbols.has(candidate.name)) {
        findings.push({
          detector: this.id,
          severity: this.severity,
          title: `Unused ${candidate.kind}: '${candidate.name}'`,
          description: `${candidate.kind} '${candidate.name}' is defined at line ${candidate.node.line} but never referenced in the contract. This increases deployment size and gas costs.`,
          line: candidate.node.line,
          column: candidate.node.column,
          recommendation: `Remove the unused ${candidate.kind} to reduce contract size and improve readability.`,
        });
      }
    }

    return findings;
  },
};
