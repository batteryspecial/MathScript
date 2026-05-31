// Text-mode LaTeX escaping for user-authored prose (section titles, paragraphs).
// Equation content is escaped separately by the equation engine's math-mode path.
const TEXT_ESCAPE: Record<string, string> = {
  "\\": "\\textbackslash{}",
  "{": "\\{",
  "}": "\\}",
  $: "\\$",
  "&": "\\&",
  "#": "\\#",
  "%": "\\%",
  _: "\\_",
  "^": "\\textasciicircum{}",
  "~": "\\textasciitilde{}",
};

export const escapeLatexText = (s: string): string =>
  s.replace(/[\\{}$&#%_^~]/g, (c) => TEXT_ESCAPE[c] ?? c);
