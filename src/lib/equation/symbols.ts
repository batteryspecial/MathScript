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
  ["sqrt", "√", "\\sqrt", "math"], ["frac", "⁄", "\\frac", "math"],
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
  ["union", "∪", "\\cup", "math", true],
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
 * Functions we know how to typeset. `\\sin`, `\\log`, ... get the upright
 * operator-name treatment. This list matches MathQuill's own default
 * `autoOperatorNames`, so we never need to configure that ourselves — sin,
 * cos, log, etc. already render upright out of the box.
 */
export const KNOWN_FUNCTIONS: Record<string, string> = {
  sin: "\\sin", cos: "\\cos", tan: "\\tan", cot: "\\cot", sec: "\\sec",
  csc: "\\csc", sinh: "\\sinh", cosh: "\\cosh", tanh: "\\tanh", arcsin: "\\arcsin",
  arccos: "\\arccos", arctan: "\\arctan", log: "\\log", ln: "\\ln", lg: "\\lg",
  exp: "\\exp", lim: "\\lim", limsup: "\\limsup", liminf: "\\liminf",
  max: "\\max", min: "\\min", sup: "\\sup", inf: "\\inf", det: "\\det",
  dim: "\\dim", gcd: "\\gcd", arg: "\\arg", ker: "\\ker", deg: "\\deg",
};

/**
 * Words that aren't safe to hand to MathQuill's `autoCommands`, even though
 * they pass its own config-time check (letters, length >= 2, not already an
 * operator name). Verified against the actual command table bundled in
 * `node_modules/react-mathquill` (495 registered names) rather than assumed:
 *
 * - RR/NN/ZZ/QQ/CC/PP/HH and a few aliases (lnot, checkmark,
 *   circlearrowleft/right) aren't real MathQuill commands at all — typing
 *   them threw `LatexCmds[str] is not a function`. Blackboard-bold letters
 *   still work fine via the SymbolPanel, which inserts LaTeX directly
 *   instead of going through this bareword lookup.
 * - Everything under 3 letters is excluded on top of that. MathQuill
 *   matches the longest recognised *suffix* of the letters typed so far on
 *   every keystroke, not a whole word from a real boundary — so 2-letter
 *   entries fire mid-word inside unrelated longer ones ("forall" fired
 *   "or" from "f-o-r", then "ll" from "a-l-l", before the full word was
 *   ever seen). Short Greek letters (pi, mu, nu, xi) and short operators
 *   (in, to, or, le, ge, ...) are still reachable by typing them with a
 *   leading backslash, or via the SymbolPanel.
 */
const NOT_REGISTERED_IN_MATHQUILL = new Set([
  "RR", "NN", "ZZ", "QQ", "CC", "PP", "HH",
  "lnot", "checkmark", "circlearrowleft", "circlearrowright",
]);

/**
 * Space-delimited list for MathQuill's `autoCommands` config: typing one of
 * these words (no backslash) converts it to the symbol as you type, e.g.
 * "forall" -> ∀. This is MathQuill's own built-in mechanism — nothing here
 * intercepts keystrokes or mutates the field ourselves.
 */
export const AUTO_COMMANDS: string = [...new Set(SYMBOLS.map((s) => s.key))]
  .filter(
    (key) =>
      key.length >= 3 && !(key in KNOWN_FUNCTIONS) && !NOT_REGISTERED_IN_MATHQUILL.has(key),
  )
  .join(" ");

