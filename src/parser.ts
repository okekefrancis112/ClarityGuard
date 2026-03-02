/**
 * ClarityGuard - Clarity S-Expression Parser
 * Parses Clarity source code into an AST for analysis.
 */

export type ClarityNodeType =
  | "list"
  | "symbol"
  | "integer"
  | "uint"
  | "string"
  | "principal"
  | "bool"
  | "keyword"
  | "response"
  | "optional"
  | "tuple-key";

export interface ClarityNode {
  type: ClarityNodeType;
  value?: string | number | boolean;
  children?: ClarityNode[];
  line: number;
  column: number;
}

interface Token {
  type: "lparen" | "rparen" | "atom" | "string" | "comment";
  value: string;
  line: number;
  column: number;
}

export function parse(source: string): ClarityNode[] {
  const tokens = tokenize(source);
  const nodes: ClarityNode[] = [];
  let pos = 0;

  function parseExpr(): ClarityNode {
    if (pos >= tokens.length) {
      throw new Error("Unexpected end of input");
    }

    const token = tokens[pos];

    if (token.type === "lparen") {
      pos++; // consume '('
      const children: ClarityNode[] = [];
      while (pos < tokens.length && tokens[pos].type !== "rparen") {
        children.push(parseExpr());
      }
      if (pos >= tokens.length) {
        throw new Error(`Unclosed parenthesis at line ${token.line}`);
      }
      pos++; // consume ')'
      return {
        type: "list",
        children,
        line: token.line,
        column: token.column,
      };
    }

    if (token.type === "rparen") {
      throw new Error(
        `Unexpected ')' at line ${token.line}, column ${token.column}`
      );
    }

    if (token.type === "string") {
      pos++;
      return {
        type: "string",
        value: token.value,
        line: token.line,
        column: token.column,
      };
    }

    // Atom
    pos++;
    return classifyAtom(token);
  }

  while (pos < tokens.length) {
    nodes.push(parseExpr());
  }

  return nodes;
}

function tokenize(source: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  let line = 1;
  let column = 1;

  while (i < source.length) {
    const ch = source[i];

    // Newline
    if (ch === "\n") {
      line++;
      column = 1;
      i++;
      continue;
    }

    // Whitespace
    if (/\s/.test(ch)) {
      i++;
      column++;
      continue;
    }

    // Comment
    if (ch === ";") {
      while (i < source.length && source[i] !== "\n") {
        i++;
      }
      continue;
    }

    // Left paren
    if (ch === "(") {
      tokens.push({ type: "lparen", value: "(", line, column });
      i++;
      column++;
      continue;
    }

    // Right paren
    if (ch === ")") {
      tokens.push({ type: "rparen", value: ")", line, column });
      i++;
      column++;
      continue;
    }

    // String literal
    if (ch === '"') {
      const startCol = column;
      let str = "";
      i++; // skip opening quote
      column++;
      while (i < source.length && source[i] !== '"') {
        if (source[i] === "\\") {
          i++;
          column++;
          if (i < source.length) {
            str += source[i];
          }
        } else {
          str += source[i];
        }
        if (source[i] === "\n") {
          line++;
          column = 1;
        } else {
          column++;
        }
        i++;
      }
      i++; // skip closing quote
      column++;
      tokens.push({ type: "string", value: str, line, column: startCol });
      continue;
    }

    // Atom (symbol, number, principal, keyword, etc.)
    const startCol = column;
    let atom = "";
    while (
      i < source.length &&
      !/[\s()]/.test(source[i]) &&
      source[i] !== ";"
    ) {
      atom += source[i];
      i++;
      column++;
    }
    tokens.push({ type: "atom", value: atom, line, column: startCol });
  }

  return tokens;
}

function classifyAtom(token: Token): ClarityNode {
  const val = token.value;
  const base = { line: token.line, column: token.column };

  // Boolean
  if (val === "true" || val === "false") {
    return { type: "bool", value: val === "true", ...base };
  }

  // Unsigned integer
  if (/^u\d+$/.test(val)) {
    return { type: "uint", value: parseInt(val.slice(1), 10), ...base };
  }

  // Signed integer
  if (/^-?\d+$/.test(val)) {
    return { type: "integer", value: parseInt(val, 10), ...base };
  }

  // Standard principal
  if (/^'S[A-Z0-9]+/.test(val) || /^'T[A-Z0-9]+/.test(val)) {
    return { type: "principal", value: val, ...base };
  }

  // Contract principal
  if (/^\./.test(val) || /^'S[A-Z0-9]+\./.test(val)) {
    return { type: "principal", value: val, ...base };
  }

  // Keyword (used in tuple keys like { key: value })
  if (val.endsWith(":")) {
    return { type: "tuple-key", value: val.slice(0, -1), ...base };
  }

  // Response/optional type annotations
  if (
    val.startsWith("response") ||
    val.startsWith("optional") ||
    val === "none"
  ) {
    return { type: "symbol", value: val, ...base };
  }

  // Everything else is a symbol
  return { type: "symbol", value: val, ...base };
}

// Utility: get the function name from a list node
export function getFunctionName(node: ClarityNode): string | null {
  if (
    node.type === "list" &&
    node.children &&
    node.children.length > 0 &&
    node.children[0].type === "symbol"
  ) {
    return node.children[0].value as string;
  }
  return null;
}

// Utility: walk all nodes in the AST
export function walkAST(
  nodes: ClarityNode[],
  callback: (node: ClarityNode, parent: ClarityNode | null) => void,
  parent: ClarityNode | null = null
): void {
  for (const node of nodes) {
    callback(node, parent);
    if (node.type === "list" && node.children) {
      walkAST(node.children, callback, node);
    }
  }
}

// Utility: find all top-level definitions
export function findDefinitions(ast: ClarityNode[]): ClarityNode[] {
  return ast.filter((node) => {
    const name = getFunctionName(node);
    return (
      name !== null &&
      (name === "define-public" ||
        name === "define-private" ||
        name === "define-read-only" ||
        name === "define-data-var" ||
        name === "define-map" ||
        name === "define-constant" ||
        name === "define-fungible-token" ||
        name === "define-non-fungible-token" ||
        name === "define-trait")
    );
  });
}
