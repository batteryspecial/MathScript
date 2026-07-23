/**
 * The symbol table — the single source of truth for the equation engine.
 *
 * Every entry maps a typed keyword (e.g. "forall") and its Unicode glyph
 * (e.g. "∀") to a LaTeX command (e.g. "\\forall"). The lexer recognises both
 * the keyword and the literal glyph; both renderers and the SymbolPanel read
 * from the maps built here. Add a symbol once, here, and it works everywhere.
 */

export type SymbolCategory = "greek" | "math" | "arrow";

export interface SymbolDef {
  /** keyword you type, e.g. "forall" (case-sensitive: "Gamma" ≠ "gamma") */
  key: string;
  /** the Unicode glyph, e.g. "∀" */
  unicode: string;
  /** the LaTeX command, e.g. "\\forall" */
  latex: string;
  /** which SymbolPanel tab it appears under */
  category: SymbolCategory;
  /** true => rendered as a spaced infix operator (a ∈ b); false => operand */
  infix: boolean;
}

// Compact tuple form: [key, unicode, latex, category, infix?]
type Row = [string, string, string, SymbolCategory, boolean?];

// prettier-ignore
const GREEK: Row[] = [
  ["alpha", "α", "\\alpha", "greek"], ["beta", "β", "\\beta", "greek"],
  ["gamma", "γ", "\\gamma", "greek"], ["delta", "δ", "\\delta", "greek"],
  ["epsilon", "ε", "\\varepsilon", "greek"], ["zeta", "ζ", "\\zeta", "greek"],
  ["eta", "η", "\\eta", "greek"], ["theta", "θ", "\\theta", "greek"],
  ["iota", "ι", "\\iota", "greek"], ["kappa", "κ", "\\kappa", "greek"],
  ["lambda", "λ", "\\lambda", "greek"], ["mu", "μ", "\\mu", "greek"],
  ["nu", "ν", "\\nu", "greek"], ["xi", "ξ", "\\xi", "greek"],
  ["pi", "π", "\\pi", "greek"], ["rho", "ρ", "\\rho", "greek"],
  ["sigma", "σ", "\\sigma", "greek"], ["tau", "τ", "\\tau", "greek"],
  ["upsilon", "υ", "\\upsilon", "greek"], ["phi", "φ", "\\varphi", "greek"],
  ["chi", "χ", "\\chi", "greek"], ["psi", "ψ", "\\psi", "greek"],
  ["omega", "ω", "\\omega", "greek"],
  ["Gamma", "Γ", "\\Gamma", "greek"], ["Delta", "Δ", "\\Delta", "greek"],
  ["Theta", "Θ", "\\Theta", "greek"], ["Lambda", "Λ", "\\Lambda", "greek"],
  ["Xi", "Ξ", "\\Xi", "greek"], ["Pi", "Π", "\\Pi", "greek"],
  ["Sigma", "Σ", "\\Sigma", "greek"], ["Phi", "Φ", "\\Phi", "greek"],
  ["Psi", "Ψ", "\\Psi", "greek"], ["Omega", "Ω", "\\Omega", "greek"],
];

// Blackboard-bold sets (operands). Only the BMP letterlike glyphs are used.
// prettier-ignore
const BLACKBOARD: Row[] = [
  ["RR", "ℝ", "\\mathbb{R}", "math"], ["NN", "ℕ", "\\mathbb{N}", "math"],
  ["ZZ", "ℤ", "\\mathbb{Z}", "math"], ["QQ", "ℚ", "\\mathbb{Q}", "math"],
  ["CC", "ℂ", "\\mathbb{C}", "math"], ["PP", "ℙ", "\\mathbb{P}", "math"],
  ["HH", "ℍ", "\\mathbb{H}", "math"],
];

// Math operands (not infix).
// prettier-ignore
const MATH_OPERANDS: Row[] = [
  ["infty", "∞", "\\infty", "math"], ["inf", "∞", "\\infty", "math"],
  ["partial", "∂", "\\partial", "math"], ["nabla", "∇", "\\nabla", "math"],
  ["emptyset", "∅", "\\varnothing", "math"], ["forall", "∀", "\\forall", "math"],
  ["exists", "∃", "\\exists", "math"], ["nexists", "∄", "\\nexists", "math"],
  ["neg", "¬", "\\neg", "math"], ["lnot", "¬", "\\neg", "math"],
  ["sum", "∑", "\\sum", "math"], ["prod", "∏", "\\prod", "math"],
  ["int", "∫", "\\int", "math"], ["oint", "∮", "\\oint", "math"],
  ["degree", "°", "^\\circ", "math"], ["deg", "°", "^\\circ", "math"],
  ["prime", "′", "\\prime", "math"], ["ldots", "…", "\\ldots", "math"],
  ["cdots", "⋯", "\\cdots", "math"], ["top", "⊤", "\\top", "math"],
  ["bot", "⊥", "\\bot", "math"], ["aleph", "ℵ", "\\aleph", "math"],
  ["hbar", "ℏ", "\\hbar", "math"], ["ell", "ℓ", "\\ell", "math"],
  ["angle", "∠", "\\angle", "math"], ["checkmark", "✓", "\\checkmark", "math"],
];

// Math infix operators / relations (spaced).
// prettier-ignore
const MATH_INFIX: Row[] = [
  ["in", "∈", "\\in", "math", true], ["notin", "∉", "\\notin", "math", true],
  ["ni", "∋", "\\ni", "math", true], ["subset", "⊂", "\\subset", "math", true],
  ["supset", "⊃", "\\supset", "math", true],
  ["subseteq", "⊆", "\\subseteq", "math", true],
  ["supseteq", "⊇", "\\supseteq", "math", true],
  ["cup", "∪", "\\cup", "math", true], ["cap", "∩", "\\cap", "math", true],
  ["union", "∪", "\\cup", "math", true], ["inter", "∩", "\\cap", "math", true],
  ["setminus", "∖", "\\setminus", "math", true],
  ["times", "×", "\\times", "math", true], ["div", "÷", "\\div", "math", true],
  ["cdot", "⋅", "\\cdot", "math", true], ["pm", "±", "\\pm", "math", true],
  ["mp", "∓", "\\mp", "math", true], ["ast", "∗", "\\ast", "math", true],
  ["star", "⋆", "\\star", "math", true], ["oplus", "⊕", "\\oplus", "math", true],
  ["otimes", "⊗", "\\otimes", "math", true],
  ["leq", "≤", "\\leq", "math", true], ["le", "≤", "\\leq", "math", true],
  ["geq", "≥", "\\geq", "math", true], ["ge", "≥", "\\geq", "math", true],
  ["neq", "≠", "\\neq", "math", true], ["ne", "≠", "\\neq", "math", true],
  ["equiv", "≡", "\\equiv", "math", true],
  ["approx", "≈", "\\approx", "math", true],
  ["cong", "≅", "\\cong", "math", true], ["sim", "∼", "\\sim", "math", true],
  ["simeq", "≃", "\\simeq", "math", true],
  ["propto", "∝", "\\propto", "math", true], ["ll", "≪", "\\ll", "math", true],
  ["gg", "≫", "\\gg", "math", true], ["and", "∧", "\\wedge", "math", true],
  ["or", "∨", "\\vee", "math", true], ["wedge", "∧", "\\wedge", "math", true],
  ["vee", "∨", "\\vee", "math", true], ["implies", "⇒", "\\implies", "math", true],
  ["iff", "⇔", "\\iff", "math", true], ["mapsto", "↦", "\\mapsto", "math", true],
  ["perp", "⊥", "\\perp", "math", true], ["mid", "∣", "\\mid", "math", true],
  ["parallel", "∥", "\\parallel", "math", true],
];

// Arrows (treated as spaced infix so "A -> B" reads cleanly).
// prettier-ignore
const ARROWS: Row[] = [
  ["rightarrow", "→", "\\rightarrow", "arrow", true],
  ["to", "→", "\\to", "arrow", true],
  ["leftarrow", "←", "\\leftarrow", "arrow", true],
  ["gets", "←", "\\gets", "arrow", true],
  ["uparrow", "↑", "\\uparrow", "arrow"],
  ["downarrow", "↓", "\\downarrow", "arrow"],
  ["leftrightarrow", "↔", "\\leftrightarrow", "arrow", true],
  ["updownarrow", "↕", "\\updownarrow", "arrow"],
  ["Rightarrow", "⇒", "\\Rightarrow", "arrow", true],
  ["Leftarrow", "⇐", "\\Leftarrow", "arrow", true],
  ["Uparrow", "⇑", "\\Uparrow", "arrow"],
  ["Downarrow", "⇓", "\\Downarrow", "arrow"],
  ["Leftrightarrow", "⇔", "\\Leftrightarrow", "arrow", true],
  ["nearrow", "↗", "\\nearrow", "arrow"],
  ["searrow", "↘", "\\searrow", "arrow"],
  ["swarrow", "↙", "\\swarrow", "arrow"],
  ["nwarrow", "↖", "\\nwarrow", "arrow"],
  ["circlearrowleft", "↺", "\\circlearrowleft", "arrow"],
  ["circlearrowright", "↻", "\\circlearrowright", "arrow"],
];

export const SYMBOLS: SymbolDef[] = [
  ...GREEK,
  ...BLACKBOARD,
  ...MATH_OPERANDS,
  ...MATH_INFIX,
  ...ARROWS,
].map(([key, unicode, latex, category, infix = false]) => ({
  key,
  unicode,
  latex,
  category,
  infix,
}));

/**
 * Literal operator lexemes (the punctuation the lexer emits as "op" tokens).
 * `spaced` controls whether the Unicode renderer pads it with spaces.
 */
export interface OperatorDef {
  lexeme: string;
  unicode: string;
  latex: string;
  spaced: boolean;
}

// prettier-ignore
const OPERATOR_ROWS: [string, string, string, boolean?][] = [
  // multi-character first; the lexer matches longest-first
  ["<=>", "⇔", "\\Leftrightarrow", true], ["<->", "↔", "\\leftrightarrow", true],
  ["<=", "≤", "\\leq", true], [">=", "≥", "\\geq", true],
  ["!=", "≠", "\\neq", true], ["/=", "≠", "\\neq", true],
  ["==", "=", "=", true], ["~=", "≈", "\\approx", true],
  ["~~", "≈", "\\approx", true], ["->", "→", "\\to", true],
  ["=>", "⇒", "\\Rightarrow", true], ["<-", "←", "\\gets", true],
  [":=", "≔", "\\coloneqq", true], ["+-", "±", "\\pm", true],
  ["...", "…", "\\ldots", false], [">>", "≫", "\\gg", true],
  ["<<", "≪", "\\ll", true],
  // single-character
  ["+", "+", "+", true], ["-", "−", "-", true], ["=", "=", "=", true],
  ["<", "<", "<", true], [">", ">", ">", true], ["*", "⋅", "\\cdot", false],
  ["/", "/", "/", false], ["|", "∣", "\\mid", true], ["!", "!", "!", false],
  [".", ".", ".", false], [":", ":", ":", true], [";", ";", ";", false],
  [",", ",", ",", false],
];

export const OPERATORS: OperatorDef[] = OPERATOR_ROWS.map(
  ([lexeme, unicode, latex, spaced = true]) => ({ lexeme, unicode, latex, spaced }),
);

/** Operators that may appear in prefix position as a unary sign. */
export const UNARY_OPERATORS = new Set(["-", "+"]);

/**
 * Functions we know how to typeset. `\\sin`, `\\log`, ... get the upright
 * operator-name treatment in LaTeX. Unknown function names are wrapped in
 * \\mathrm{} so multi-letter names don't render as a product of italics.
 */
export const KNOWN_FUNCTIONS: Record<string, string> = {
  sin: "\\sin", cos: "\\cos", tan: "\\tan", cot: "\\cot", sec: "\\sec",
  csc: "\\csc", sinh: "\\sinh", cosh: "\\cosh", tanh: "\\tanh", arcsin: "\\arcsin",
  arccos: "\\arccos", arctan: "\\arctan", log: "\\log", ln: "\\ln", lg: "\\lg",
  exp: "\\exp", lim: "\\lim", limsup: "\\limsup", liminf: "\\liminf",
  max: "\\max", min: "\\min", sup: "\\sup", inf: "\\inf", det: "\\det",
  dim: "\\dim", gcd: "\\gcd", arg: "\\arg", ker: "\\ker", deg: "\\deg",
};

/* --------------------------- Lookup maps --------------------------- */

const symbolByKey = new Map<string, SymbolDef>();
const symbolByGlyph = new Map<string, SymbolDef>();
for (const def of SYMBOLS) {
  if (!symbolByKey.has(def.key)) symbolByKey.set(def.key, def);
  // first keyword wins as the canonical name for a glyph
  if (!symbolByGlyph.has(def.unicode)) symbolByGlyph.set(def.unicode, def);
}

const operatorByLexeme = new Map<string, OperatorDef>();
for (const op of OPERATORS) operatorByLexeme.set(op.lexeme, op);

/** All operator lexemes, longest first — for greedy longest-match in the lexer. */
export const OPERATOR_LEXEMES: string[] = OPERATORS.map((o) => o.lexeme).sort(
  (a, b) => b.length - a.length,
);

/** Recognised glyphs, so the lexer can accept symbols pasted/inserted directly. */
export const GLYPHS: ReadonlySet<string> = new Set(symbolByGlyph.keys());

export interface Rendering {
  unicode: string;
  latex: string;
  /** for operators: whether to pad with spaces in the Unicode renderer */
  spaced: boolean;
}

/** Resolve an operand lexeme (identifier or glyph) to its renderings. */
export function resolveOperand(lexeme: string): Rendering & { known: boolean } {
  const def = symbolByKey.get(lexeme) ?? symbolByGlyph.get(lexeme);
  if (def) return { unicode: def.unicode, latex: def.latex, spaced: false, known: true };
  return { unicode: lexeme, latex: "", spaced: false, known: false };
}

/** Resolve an operator/relation lexeme to its renderings. */
export function resolveOperator(lexeme: string): Rendering & { known: boolean } {
  const op = operatorByLexeme.get(lexeme);
  if (op) return { unicode: op.unicode, latex: op.latex, spaced: op.spaced, known: true };
  const sym = symbolByKey.get(lexeme) ?? symbolByGlyph.get(lexeme);
  if (sym) return { unicode: sym.unicode, latex: sym.latex, spaced: true, known: true };
  return { unicode: lexeme, latex: "", spaced: true, known: false };
}

/** Is this lexeme an infix operator/relation (used by the parser to classify)? */
export function isInfixLexeme(lexeme: string): boolean {
  if (operatorByLexeme.has(lexeme)) return true;
  const sym = symbolByKey.get(lexeme) ?? symbolByGlyph.get(lexeme);
  return sym?.infix ?? false;
}

/**
 * Space-delimited command list for MathQuill's `autoCommands` config: typing
 * one of these words (no backslash) auto-converts it to the symbol as you
 * type, e.g. "forall" -> ∀.
 *
 * MathQuill requires every entry be letters-only, length >= 2, and *not*
 * already one of its built-in operator names (sin, log, deg, inf, ...) —
 * passing one of those throws at field-mount time. KNOWN_FUNCTIONS is
 * MathQuill's operator-name set, so anything overlapping it is excluded.
 */
export const AUTO_COMMANDS: string = [...new Set(SYMBOLS.map((s) => s.key))]
  .filter((key) => key.length >= 2 && !(key in KNOWN_FUNCTIONS))
  .join(" ");
