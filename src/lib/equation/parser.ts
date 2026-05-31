import {
  EMPTY,
  EQUATION_LIMITS,
  type EquationError,
  type Node,
  type ParseResult,
  type Token,
  type TokenType,
} from "./types";
import { isInfixLexeme, UNARY_OPERATORS } from "./symbols";

class LimitError extends Error {}

const NO_STOPS: ReadonlySet<TokenType> = new Set();
const STOP_PAREN: ReadonlySet<TokenType> = new Set(["rparen"]);
const STOP_BRACE: ReadonlySet<TokenType> = new Set(["rbrace"]);
const STOP_ARG: ReadonlySet<TokenType> = new Set(["comma", "rparen"]);

export function parse(tokens: Token[]): ParseResult {
  let pos = 0;
  let nodeCount = 0;
  const errors: EquationError[] = [];

  const peek = (): Token => tokens[pos] ?? tokens[tokens.length - 1];
  const peek2 = (): Token => tokens[pos + 1] ?? peek();
  const advance = (): Token => tokens[pos++] ?? peek();

  // Counting every constructed node bounds total work even for inputs that
  // pass the token limit but expand combinatorially.
  const track = <T extends Node>(n: T): T => {
    if (++nodeCount > EQUATION_LIMITS.maxNodes) throw new LimitError();
    return n;
  };

  function expect(type: TokenType): void {
    if (peek().type === type) advance();
    else errors.push({ message: `Expected '${type}'.`, start: peek().start, end: peek().end });
  }

  function parsePrimary(depth: number): Node {
    const t = peek();
    switch (t.type) {
      case "number":
        advance();
        return track({ kind: "number", value: t.value });
      case "ident": {
        if (peek2().type === "lparen") return parseCall(depth, t.value);
        advance();
        return track({ kind: "symbol", lexeme: t.value, source: "ident" });
      }
      case "glyph":
        advance();
        return track({ kind: "symbol", lexeme: t.value, source: "glyph" });
      case "lparen": {
        advance();
        const child = parseSequence(depth + 1, STOP_PAREN);
        expect("rparen");
        return track({ kind: "paren", child });
      }
      case "lbrace": {
        advance();
        const child = parseSequence(depth + 1, STOP_BRACE);
        expect("rbrace");
        return track({ kind: "group", child });
      }
      case "op":
        advance();
        return track({ kind: "symbol", lexeme: t.value, source: "ident" });
      case "comma":
      case "rparen":
      case "rbrace":
        advance();
        return EMPTY;
      default:
        return EMPTY; // eof — do not advance
    }
  }

  function applyScript(base: Node, op: string, operand: Node): Node {
    if (op === "^") {
      if (base.kind === "sub")
        return track({ kind: "supsub", base: base.base, exponent: operand, index: base.index });
      return track({ kind: "sup", base, exponent: operand });
    }
    if (base.kind === "sup")
      return track({ kind: "supsub", base: base.base, exponent: base.exponent, index: operand });
    return track({ kind: "sub", base, index: operand });
  }

  // An operand followed by any number of ^ / _ scripts (each binds one primary).
  function parsePostfix(depth: number): Node {
    let base = parsePrimary(depth);
    while (true) {
      const t = peek();
      if (t.type === "op" && (t.value === "^" || t.value === "_")) {
        advance();
        base = applyScript(base, t.value, parsePrimary(depth));
      } else break;
    }
    return base;
  }

  function parseCall(depth: number, name: string): Node {
    advance(); // ident
    advance(); // lparen
    const args: Node[] = [];
    if (peek().type !== "rparen") {
      while (true) {
        args.push(parseSequence(depth + 1, STOP_ARG));
        if (peek().type === "comma") {
          advance();
          continue;
        }
        break;
      }
    }
    expect("rparen");

    if (name === "frac" && args.length === 2)
      return track({ kind: "frac", numerator: args[0], denominator: args[1] });
    if (name === "sqrt" && args.length === 1)
      return track({ kind: "sqrt", radicand: args[0] });
    return track({ kind: "func", name, args });
  }

  function parseSequence(depth: number, stops: ReadonlySet<TokenType>): Node {
    if (depth > EQUATION_LIMITS.maxDepth) throw new LimitError();
    const items: Node[] = [];

    while (true) {
      const t = peek();
      if (t.type === "eof" || stops.has(t.type)) break;

      if (t.type === "comma") {
        advance();
        items.push(track({ kind: "op", lexeme: "," }));
        continue;
      }

      if (isOperatorPosition(t)) {
        const lex = t.value;
        const last = items[items.length - 1];
        const prefixPos = items.length === 0 || (last != null && last.kind === "op");
        if (prefixPos && UNARY_OPERATORS.has(lex)) {
          advance();
          items.push(track({ kind: "unary", op: lex, operand: parsePostfix(depth) }));
        } else {
          advance();
          items.push(track({ kind: "op", lexeme: lex }));
        }
        continue;
      }

      const prim = parsePostfix(depth);
      if (prim.kind !== "empty") items.push(prim);
    }

    if (items.length === 0) return EMPTY;
    if (items.length === 1) return items[0];
    return track({ kind: "seq", items });
  }

  // ^ and _ are postfix, never standalone infix operators here.
  function isOperatorPosition(t: Token): boolean {
    if (t.type === "op") return t.value !== "^" && t.value !== "_";
    if (t.type === "glyph") return isInfixLexeme(t.value);
    if (t.type === "ident") return peek2().type !== "lparen" && isInfixLexeme(t.value);
    return false;
  }

  try {
    const ast = parseSequence(0, NO_STOPS);
    return { ast, errors };
  } catch (e) {
    if (e instanceof LimitError) {
      errors.push({ message: "Equation too large or too deeply nested.", start: 0, end: 0 });
    } else {
      errors.push({ message: "Could not parse equation.", start: 0, end: 0 });
    }
    return { ast: EMPTY, errors };
  }
}
