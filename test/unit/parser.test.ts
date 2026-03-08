import { describe, it, expect } from 'vitest';
import { parse, getFunctionName, walkAST, findDefinitions } from '../../src/parser';

describe('parse', () => {
  it('returns empty array for empty string', () => {
    expect(parse('')).toEqual([]);
  });

  it('returns empty array for whitespace-only input', () => {
    expect(parse('   \n\t  ')).toEqual([]);
  });

  it('parses a symbol', () => {
    const [node] = parse('hello');
    expect(node.type).toBe('symbol');
    expect(node.value).toBe('hello');
  });

  it('parses a signed integer', () => {
    const [node] = parse('42');
    expect(node.type).toBe('integer');
    expect(node.value).toBe(42);
  });

  it('parses a negative integer', () => {
    const [node] = parse('-5');
    expect(node.type).toBe('integer');
    expect(node.value).toBe(-5);
  });

  it('parses an unsigned integer', () => {
    const [node] = parse('u100');
    expect(node.type).toBe('uint');
    expect(node.value).toBe(100);
  });

  it('parses u0', () => {
    const [node] = parse('u0');
    expect(node.type).toBe('uint');
    expect(node.value).toBe(0);
  });

  it('parses boolean true', () => {
    const [node] = parse('true');
    expect(node.type).toBe('bool');
    expect(node.value).toBe(true);
  });

  it('parses boolean false', () => {
    const [node] = parse('false');
    expect(node.type).toBe('bool');
    expect(node.value).toBe(false);
  });

  it('parses a string literal', () => {
    const [node] = parse('"hello world"');
    expect(node.type).toBe('string');
    expect(node.value).toBe('hello world');
  });

  it('parses an escaped string', () => {
    const [node] = parse('"say \\"hi\\""');
    expect(node.type).toBe('string');
    expect(node.value).toBe('say "hi"');
  });

  it('parses a standard principal', () => {
    const [node] = parse("'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7");
    expect(node.type).toBe('principal');
  });

  it('parses a contract principal', () => {
    const [node] = parse("'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7.token");
    expect(node.type).toBe('principal');
  });

  it('parses a dot-prefixed contract reference', () => {
    const [node] = parse('.my-contract');
    expect(node.type).toBe('principal');
  });

  it('parses a tuple key', () => {
    const [node] = parse('amount:');
    expect(node.type).toBe('tuple-key');
    expect(node.value).toBe('amount');
  });

  it('parses a simple list', () => {
    const [node] = parse('(+ 1 2)');
    expect(node.type).toBe('list');
    expect(node.children).toHaveLength(3);
    expect(node.children![0]).toMatchObject({ type: 'symbol', value: '+' });
    expect(node.children![1]).toMatchObject({ type: 'integer', value: 1 });
    expect(node.children![2]).toMatchObject({ type: 'integer', value: 2 });
  });

  it('parses nested lists', () => {
    const [node] = parse('(define-public (foo) (ok true))');
    expect(node.type).toBe('list');
    expect(getFunctionName(node)).toBe('define-public');
  });

  it('parses multiple top-level expressions', () => {
    const nodes = parse('(foo)\n(bar)\n(baz)');
    expect(nodes).toHaveLength(3);
  });

  it('ignores single-line comments', () => {
    const nodes = parse('; this is a comment\n(+ 1 2)');
    expect(nodes).toHaveLength(1);
    expect(nodes[0].type).toBe('list');
  });

  it('ignores inline comments', () => {
    const nodes = parse('(+ 1 2) ; add two numbers');
    expect(nodes).toHaveLength(1);
  });

  it('tracks line numbers correctly', () => {
    const nodes = parse('(foo)\n(bar)');
    expect(nodes[0].line).toBe(1);
    expect(nodes[1].line).toBe(2);
  });

  it('tracks column numbers on list', () => {
    const [node] = parse('(foo)');
    expect(node.column).toBe(1);
  });

  it('throws on unclosed parenthesis', () => {
    expect(() => parse('(foo')).toThrow();
  });

  it('throws on unexpected closing paren', () => {
    expect(() => parse(')')).toThrow();
  });

  it('parses an empty list', () => {
    const [node] = parse('()');
    expect(node.type).toBe('list');
    expect(node.children).toHaveLength(0);
  });

  it('parses deeply nested expressions', () => {
    const [node] = parse('(a (b (c (d))))');
    expect(node.type).toBe('list');
    const b = node.children![1];
    expect(getFunctionName(b)).toBe('b');
    const c = b.children![1];
    expect(getFunctionName(c)).toBe('c');
  });

  it('handles multiple comments in sequence', () => {
    const nodes = parse('; line 1\n; line 2\n(ok true)');
    expect(nodes).toHaveLength(1);
  });

  it('parses a full define-public function', () => {
    const src = `
(define-public (transfer (amount uint) (recipient principal))
  (begin
    (asserts! (> amount u0) (err u1))
    (stx-transfer? amount tx-sender recipient)))
`;
    const nodes = parse(src);
    expect(nodes).toHaveLength(1);
    expect(getFunctionName(nodes[0])).toBe('define-public');
  });
});

describe('getFunctionName', () => {
  it('returns the head symbol of a list', () => {
    const [node] = parse('(define-public (foo) (ok true))');
    expect(getFunctionName(node)).toBe('define-public');
  });

  it('returns null for a symbol node', () => {
    const [node] = parse('hello');
    expect(getFunctionName(node)).toBeNull();
  });

  it('returns null for an integer node', () => {
    const [node] = parse('42');
    expect(getFunctionName(node)).toBeNull();
  });

  it('returns null for an empty list', () => {
    expect(getFunctionName({ type: 'list', children: [], line: 1, column: 1 })).toBeNull();
  });

  it('returns null for a list whose first child is not a symbol', () => {
    const [node] = parse('(u1 u2)');
    expect(getFunctionName(node)).toBeNull();
  });
});

describe('walkAST', () => {
  it('visits every node including nested ones', () => {
    const ast = parse('(foo (bar baz))');
    const values: string[] = [];
    walkAST(ast, (node) => {
      if (node.value !== undefined) values.push(String(node.value));
    });
    expect(values).toContain('foo');
    expect(values).toContain('bar');
    expect(values).toContain('baz');
  });

  it('visits nodes in depth-first order', () => {
    const ast = parse('(a (b c))');
    const order: string[] = [];
    walkAST(ast, (node) => {
      if (node.type === 'symbol') order.push(node.value as string);
    });
    expect(order).toEqual(['a', 'b', 'c']);
  });

  it('provides parent reference', () => {
    const ast = parse('(outer (inner))');
    let foundParent = false;
    walkAST(ast, (node, parent) => {
      if (getFunctionName(node) === 'inner' && parent !== null) {
        foundParent = true;
      }
    });
    expect(foundParent).toBe(true);
  });

  it('provides null parent for top-level nodes', () => {
    const ast = parse('(foo)');
    let topParent: unknown = 'not-set';
    walkAST(ast, (_node, parent) => {
      if (topParent === 'not-set') topParent = parent;
    });
    expect(topParent).toBeNull();
  });

  it('handles an empty AST without error', () => {
    expect(() => walkAST([], () => {})).not.toThrow();
  });
});

describe('findDefinitions', () => {
  it('finds define-public', () => {
    const ast = parse('(define-public (foo) (ok true))');
    expect(findDefinitions(ast)).toHaveLength(1);
  });

  it('finds define-private', () => {
    const ast = parse('(define-private (bar x) x)');
    expect(findDefinitions(ast)).toHaveLength(1);
  });

  it('finds define-constant', () => {
    const ast = parse('(define-constant MAX_SUPPLY u1000000)');
    expect(findDefinitions(ast)).toHaveLength(1);
  });

  it('finds define-data-var', () => {
    const ast = parse('(define-data-var total-supply uint u0)');
    expect(findDefinitions(ast)).toHaveLength(1);
  });

  it('finds define-map', () => {
    const ast = parse('(define-map balances principal uint)');
    expect(findDefinitions(ast)).toHaveLength(1);
  });

  it('finds define-fungible-token', () => {
    const ast = parse('(define-fungible-token my-token)');
    expect(findDefinitions(ast)).toHaveLength(1);
  });

  it('finds multiple definitions', () => {
    const ast = parse(`
      (define-public (foo) (ok true))
      (define-private (bar) true)
      (define-constant MY_CONST u100)
    `);
    expect(findDefinitions(ast)).toHaveLength(3);
  });

  it('excludes non-definition expressions', () => {
    const ast = parse('(+ 1 2)');
    expect(findDefinitions(ast)).toHaveLength(0);
  });

  it('returns empty array for empty AST', () => {
    expect(findDefinitions([])).toHaveLength(0);
  });
});
