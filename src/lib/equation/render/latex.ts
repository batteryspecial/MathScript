import type { Node } from "../types";
import { KNOWN_FUNCTIONS, resolveOperand, resolveOperator } from "../symbols";

const MATH_ESCAPE: Record<string, string> = {
  "\\": "\\backslash ",
  "{": "\\{",
  "}": "\\}",
  $: "\\$",
  "&": "\\&",
  "#": "\\#",
  "%": "\\%",
  _: "\\_",
};

const escapeMath = (s: string): string =>
  s.replace(/[\\{}$&#%_]/g, (c) => MATH_ESCAPE[c] ?? c);

function symbolLatex(lexeme: string): string {
  const res = resolveOperand(lexeme);
  if (res.known) return res.latex;
  // Bare operator names ("lim", "sin", ...) get the upright \lim / \sin form.
  if (KNOWN_FUNCTIONS[lexeme]) return KNOWN_FUNCTIONS[lexeme];
  return lexeme.length > 1 ? `\\mathrm{${escapeMath(lexeme)}}` : escapeMath(lexeme);
}

// A {group} already supplies its own braces; don't double them inside ^{ } / _{ }.
const scriptArg = (n: Node): string => (n.kind === "group" ? render(n.child) : render(n));

function opLatex(lexeme: string): string {
  const res = resolveOperator(lexeme);
  return res.known ? res.latex : escapeMath(lexeme);
}

// LaTeX applies ^ / _ to a single token, so multi-token bases must be braced.
function braced(n: Node): string {
  const r = render(n);
  let brace: boolean;
  switch (n.kind) {
    case "number":
      brace = n.value.length > 1;
      break;
    case "symbol": // always a single box: char, \command, or \mathrm{…}
    case "paren":
    case "group":
      brace = false;
      break;
    default:
      brace = true;
  }
  return brace ? `{${r}}` : r;
}

export function render(node: Node): string {
  switch (node.kind) {
    case "empty":
      return "";
    case "number":
      return node.value;
    case "symbol":
      return symbolLatex(node.lexeme);
    case "op":
      return opLatex(node.lexeme);
    case "unary":
      return `${opLatex(node.op)}${render(node.operand)}`;
    case "sup":
      return `${braced(node.base)}^{${scriptArg(node.exponent)}}`;
    case "sub":
      return `${braced(node.base)}_{${scriptArg(node.index)}}`;
    case "supsub":
      return `${braced(node.base)}_{${scriptArg(node.index)}}^{${scriptArg(node.exponent)}}`;
    case "frac":
      return `\\frac{${render(node.numerator)}}{${render(node.denominator)}}`;
    case "sqrt":
      return `\\sqrt{${render(node.radicand)}}`;
    case "func": {
      const head =
        KNOWN_FUNCTIONS[node.name] ??
        (node.name.length > 1 ? `\\mathrm{${escapeMath(node.name)}}` : escapeMath(node.name));
      return `${head}(${node.args.map(render).join(", ")})`;
    }
    case "paren":
      return `\\left(${render(node.child)}\\right)`;
    case "group":
      return `{${render(node.child)}}`;
    case "seq":
      return node.items
        .map((item) => (item.kind === "op" ? opLatex(item.lexeme) : render(item)))
        .join(" ");
  }
}

export const renderLatex = render;
