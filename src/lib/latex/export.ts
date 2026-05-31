import { equationToLatex } from "@/lib/equation";

export type ExportCellType = "text" | "section" | "subsection" | "equation";

export interface ExportCell {
  id: string;
  type: ExportCellType;
  equationContent?: string;
}

/**
 * Assemble a compilable LaTeX document from the notebook cells.
 *
 * `getText(id)` must return LaTeX-ready inline content for prose cells
 * (already escaped, marks already applied). Equation cells are compiled here
 * from their light custom syntax via the equation engine.
 */
export function buildLatex(cells: ExportCell[], getText: (id: string) => string): string {
  const lines: string[] = [
    "\\documentclass{article}",
    "\\usepackage[T1]{fontenc}",
    "\\usepackage{amsmath}",
    "\\usepackage{amssymb}",
    "",
    "\\begin{document}",
    "",
  ];

  for (const cell of cells) {
    switch (cell.type) {
      case "section":
        lines.push(`\\section{${getText(cell.id).trim()}}`, "");
        break;
      case "subsection":
        lines.push(`\\subsection{${getText(cell.id).trim()}}`, "");
        break;
      case "text": {
        const body = getText(cell.id).trim();
        if (body) lines.push(body, "");
        break;
      }
      case "equation": {
        const tex = equationToLatex(cell.equationContent ?? "").trim();
        lines.push("\\begin{equation}", `  ${tex}`, "\\end{equation}", "");
        break;
      }
    }
  }

  lines.push("\\end{document}", "");
  return lines.join("\n");
}

function safeStem(filename: string): string {
  let s = filename.replace(/\.[^.]*$/, ""); // drop existing extension
  s = s.replace(/[<>:"/\\|?*]/g, ""); // strip filesystem-reserved characters
  s = Array.from(s)
    .filter((ch) => ch >= " ") // drop control characters
    .join("");
  s = s.replace(/\s+/g, " ").trim().slice(0, 100).trim();
  return s || "document";
}

export function downloadLatex(content: string, filename: string): void {
  const blob = new Blob([content], { type: "application/x-tex;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  try {
    const a = document.createElement("a");
    a.href = url;
    a.download = `${safeStem(filename)}.tex`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  } finally {
    URL.revokeObjectURL(url);
  }
}
