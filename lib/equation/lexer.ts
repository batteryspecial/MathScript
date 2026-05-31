/**
 * The lexer — turns a source string into a flat token list.
 *
 * It is a hand-written linear scanner (no regular expressions, so there is no
 * catastrophic-backtracking surface), and it is bounded by EQUATION_LIMITS so a
 * pathological input cannot make it loop or allocate without limit. It never
 * throws: anything it cannot classify becomes a single-character "op" token,
 * which the renderers pass through safely.
 */

import { EQUATION_LIMITS, type Token, type TokenType } from "./types";
import { GLYPHS, OPERATOR_LEXEMES } from "./symbols";

const isDigit = (c: string): boolean => c >= "0" && c <= "9";
const isLetter = (c: string): boolean =>
  (c >= "a" && c <= "z") || (c >= "A" && c <= "Z");
const isSpace = (c: string): boolean =>
  c === " " || c === "\t" || c === "\n" || c === "\r" || c === "\f" || c === "\v";

export function tokenize(input: string): Token[] {
  const src =
    input.length > EQUATION_LIMITS.maxSourceLength
      ? input.slice(0, EQUATION_LIMITS.maxSourceLength)
      : input;

  const tokens: Token[] = [];
  const n = src.length;
  let i = 0;

  const push = (type: TokenType, value: string, start: number, end: number): void => {
    tokens.push({ type, value, start, end });
  };

  while (i < n && tokens.length < EQUATION_LIMITS.maxTokens) {
    const c = src[i];

    if (isSpace(c)) {
      i++;
      continue;
    }

    // Single-character structural tokens.
    if (c === "(") { push("lparen", c, i, i + 1); i++; continue; }
    if (c === ")") { push("rparen", c, i, i + 1); i++; continue; }
    if (c === "{") { push("lbrace", c, i, i + 1); i++; continue; }
    if (c === "}") { push("rbrace", c, i, i + 1); i++; continue; }
    if (c === ",") { push("comma", c, i, i + 1); i++; continue; }

    // Numbers: digits with an optional single decimal point.
    if (isDigit(c) || (c === "." && i + 1 < n && isDigit(src[i + 1]))) {
      const start = i;
      let seenDot = false;
      while (i < n) {
        const d = src[i];
        if (isDigit(d)) { i++; continue; }
        if (d === "." && !seenDot && i + 1 < n && isDigit(src[i + 1])) {
          seenDot = true;
          i++;
          continue;
        }
        break;
      }
      push("number", src.slice(start, i), start, i);
      continue;
    }

    // Identifiers: runs of letters (keywords, symbol names, function names).
    if (isLetter(c)) {
      const start = i;
      while (i < n && isLetter(src[i])) i++;
      push("ident", src.slice(start, i), start, i);
      continue;
    }

    // Multi-character operators (longest match first).
    let matched = false;
    for (const lex of OPERATOR_LEXEMES) {
      if (lex.length > 1 && src.startsWith(lex, i)) {
        push("op", lex, i, i + lex.length);
        i += lex.length;
        matched = true;
        break;
      }
    }
    if (matched) continue;

    // A literal Unicode symbol glyph (handles astral code points safely).
    const cp = src.codePointAt(i) ?? 0;
    const glyph = String.fromCodePoint(cp);
    const width = glyph.length; // 2 for astral, 1 otherwise
    if (GLYPHS.has(glyph)) {
      push("glyph", glyph, i, i + width);
      i += width;
      continue;
    }

    // Single-character operator, or any other character as a literal op token.
    push("op", glyph, i, i + width);
    i += width;
  }

  push("eof", "", src.length, src.length);
  return tokens;
}
