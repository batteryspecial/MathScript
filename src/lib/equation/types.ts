/**
 * Equation engine — shared types.
 *
 * The engine turns a light, natural-language math syntax (e.g. `forall x in RR`,
 * `x^2 + frac(a, b)`) into:
 *   - a readable Unicode approximation (for live preview), and
 *   - proper LaTeX (for export on demand).
 *
 * It is intentionally a *transliterator*, not a computer-algebra system: it
 * captures visual structure (super/subscripts, fractions, roots, grouping,
 * function calls) and renders left-to-right. It never evaluates math.
 *
 * Security: the engine is fully bounded (see EQUATION_LIMITS) and never throws.
 * The Unicode renderer emits plain strings — there is no HTML anywhere in this
 * pipeline, so equation rendering carries no injection surface.
 */

export type TokenType =
  | "number"
  | "ident" // a run of letters: keyword / symbol name / function name candidate
  | "glyph" // a literal Unicode symbol recognised from the symbol table (e.g. "∈")
  | "op" // an operator lexeme: "+", "-", "=", "<=", "->", ...
  | "lparen"
  | "rparen"
  | "lbrace"
  | "rbrace"
  | "comma"
  | "eof";

export interface Token {
  type: TokenType;
  value: string;
  /** source offset of the first character (for diagnostics) */
  start: number;
  /** source offset just past the last character */
  end: number;
}

/* ----------------------------- AST ----------------------------- */

export type Node =
  | SeqNode
  | NumberNode
  | SymbolNode
  | OpNode
  | UnaryNode
  | SupNode
  | SubNode
  | SupSubNode
  | FracNode
  | SqrtNode
  | FuncNode
  | ParenNode
  | GroupNode
  | EmptyNode;

/** A flat, left-to-right run of nodes. */
export interface SeqNode {
  kind: "seq";
  items: Node[];
}
export interface NumberNode {
  kind: "number";
  value: string;
}
/** An operand: a resolved symbol, a Greek letter, or an unknown identifier. */
export interface SymbolNode {
  kind: "symbol";
  /** the lexeme as typed ("alpha", "RR", "x", or a glyph like "∈") */
  lexeme: string;
  /** whether it came from an identifier run or a literal glyph */
  source: "ident" | "glyph";
}
/** An infix operator / relation rendered with spacing. */
export interface OpNode {
  kind: "op";
  lexeme: string;
}
/** A prefix unary operator bound tightly to its operand ("-x", "¬p"). */
export interface UnaryNode {
  kind: "unary";
  op: string;
  operand: Node;
}
export interface SupNode {
  kind: "sup";
  base: Node;
  exponent: Node;
}
export interface SubNode {
  kind: "sub";
  base: Node;
  index: Node;
}
export interface SupSubNode {
  kind: "supsub";
  base: Node;
  exponent: Node;
  index: Node;
}
export interface FracNode {
  kind: "frac";
  numerator: Node;
  denominator: Node;
}
export interface SqrtNode {
  kind: "sqrt";
  radicand: Node;
}
export interface FuncNode {
  kind: "func";
  name: string;
  args: Node[];
}
/** Visible parentheses: ( ... ) */
export interface ParenNode {
  kind: "paren";
  child: Node;
}
/** Invisible grouping: { ... } (used to scope super/subscripts, like LaTeX) */
export interface GroupNode {
  kind: "group";
  child: Node;
}
export interface EmptyNode {
  kind: "empty";
}

export const EMPTY: EmptyNode = { kind: "empty" };

/* --------------------------- Results --------------------------- */

export interface EquationError {
  message: string;
  start: number;
  end: number;
}

export interface ParseResult {
  ast: Node;
  errors: EquationError[];
}

export interface CompileResult {
  source: string;
  /** readable Unicode approximation for live preview */
  unicode: string;
  /** proper LaTeX for export */
  latex: string;
  /** true when the source parsed with no errors */
  ok: boolean;
  errors: EquationError[];
}

/**
 * Hard limits. These exist to keep a single malformed or adversarial equation
 * from hanging the browser tab (a client-side DoS). The parser degrades
 * gracefully when a limit is hit: it stops and reports an error rather than
 * looping or overflowing the stack.
 */
export const EQUATION_LIMITS = {
  /** characters of source we will tokenize */
  maxSourceLength: 2000,
  /** tokens we will emit */
  maxTokens: 2000,
  /** recursion depth for nested groups / calls */
  maxDepth: 128,
  /** total AST nodes we will build */
  maxNodes: 4000,
} as const;
