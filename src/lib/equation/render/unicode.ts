import type { Node } from "../types";
import { resolveOperand, resolveOperator } from "../symbols";

// prettier-ignore
const SUP: Record<string, string> = {
  "0":"⁰","1":"¹","2":"²","3":"³","4":"⁴","5":"⁵","6":"⁶","7":"⁷","8":"⁸","9":"⁹",
  "+":"⁺","-":"⁻","−":"⁻","=":"⁼","(":"⁽",")":"⁾","n":"ⁿ","i":"ⁱ",
  "a":"ᵃ","b":"ᵇ","c":"ᶜ","d":"ᵈ","e":"ᵉ","f":"ᶠ","g":"ᵍ","h":"ʰ","j":"ʲ","k":"ᵏ",
  "l":"ˡ","m":"ᵐ","o":"ᵒ","p":"ᵖ","r":"ʳ","s":"ˢ","t":"ᵗ","u":"ᵘ","v":"ᵛ","w":"ʷ",
  "x":"ˣ","y":"ʸ","z":"ᶻ",
};
// prettier-ignore
const SUB: Record<string, string> = {
  "0":"₀","1":"₁","2":"₂","3":"₃","4":"₄","5":"₅","6":"₆","7":"₇","8":"₈","9":"₉",
  "+":"₊","-":"₋","−":"₋","=":"₌","(":"₍",")":"₎",
  "a":"ₐ","e":"ₑ","h":"ₕ","i":"ᵢ","j":"ⱼ","k":"ₖ","l":"ₗ","m":"ₘ","n":"ₙ","o":"ₒ",
  "p":"ₚ","r":"ᵣ","s":"ₛ","t":"ₜ","u":"ᵤ","v":"ᵥ","x":"ₓ",
};

function toScript(s: string, map: Record<string, string>, caret: string): string {
  let out = "";
  for (const ch of s) {
    const m = map[ch];
    if (!m) return s.length === 1 ? caret + s : `${caret}(${s})`;
    out += m;
  }
  return out;
}

const needsParens = (n: Node): boolean =>
  n.kind === "seq" || n.kind === "unary" || n.kind === "op";

const wrap = (n: Node): string => {
  const r = render(n);
  return needsParens(n) ? `(${r})` : r;
};

export function render(node: Node): string {
  switch (node.kind) {
    case "empty":
      return "";
    case "number":
      return node.value;
    case "symbol":
      return resolveOperand(node.lexeme).unicode;
    case "op":
      return resolveOperator(node.lexeme).unicode;
    case "unary":
      return resolveOperator(node.op).unicode + render(node.operand);
    case "sup":
      return render(node.base) + toScript(render(node.exponent), SUP, "^");
    case "sub":
      return render(node.base) + toScript(render(node.index), SUB, "_");
    case "supsub":
      return (
        render(node.base) +
        toScript(render(node.index), SUB, "_") +
        toScript(render(node.exponent), SUP, "^")
      );
    case "frac":
      return `${wrap(node.numerator)}/${wrap(node.denominator)}`;
    case "sqrt":
      return `√${wrap(node.radicand)}`;
    case "func":
      return `${node.name}(${node.args.map(render).join(", ")})`;
    case "paren":
      return `(${render(node.child)})`;
    case "group":
      return render(node.child);
    case "seq": {
      let out = "";
      for (const item of node.items) {
        if (item.kind === "op") {
          const { unicode, spaced } = resolveOperator(item.lexeme);
          out += spaced ? ` ${unicode} ` : unicode;
        } else {
          out += render(item);
        }
      }
      return out.replace(/\s+/g, " ").trim();
    }
  }
}

export const renderUnicode = render;
