import { escapeLatexText } from "@/lib/latex/escape";
import type { DocumentMeta } from "@/lib/latex/meta";

export type ExportCellType = "text" | "section" | "subsection" | "equation";

export interface ExportCell {
id: string;
type: ExportCellType;
equationContent?: string;
label?: string;
}

// getText(id) must return LaTeX-ready inline content (already escaped, marks applied).
export function buildLatex(cells: ExportCell[], getText: (id: string) => string, meta: DocumentMeta): string {
	const lines: string[] = [
		"\\documentclass{article}",
		"\\usepackage[T1]{fontenc}",
		"\\usepackage{amsmath}",
		"\\usepackage{amssymb}",
	];

	if (meta.metaOn) {
		lines.push("\\usepackage{hyperref}");
		const setup: string[] = [];
		if (meta.titleOn) setup.push(`pdftitle={${escapeLatexText(meta.title)}}`);
		if (meta.authorOn) setup.push(`pdfauthor={${escapeLatexText(meta.author)}}`);
		if (meta.colorLinksOn) setup.push("colorlinks=true", "linkcolor=blue", "citecolor=blue", "urlcolor=blue");
		if (setup.length) lines.push(`\\hypersetup{${setup.join(", ")}}`);
	}

	// \maketitle only if at least one of title/author/date is on.
	const showTitleBlock = meta.titleOn || meta.authorOn || meta.dateOn;
	if (meta.titleOn) lines.push(`\\title{${escapeLatexText(meta.title)}}`);
	if (meta.authorOn) lines.push(`\\author{${escapeLatexText(meta.author)}}`);
	if (showTitleBlock) {
		// LaTeX defaults to \today when \date is never called — empty braces
		// are required to actually suppress it, omitting the line isn't enough.
		lines.push(meta.dateOn ? `\\date{${escapeLatexText(meta.date)}}` : "\\date{}");
	}

	lines.push("", "\\begin{document}", "");
	if (showTitleBlock) lines.push("\\maketitle", "");

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
			const tex = (cell.equationContent ?? "").trim();
			const tag = cell.label?.trim() ? `\n  \\tag{${cell.label.trim()}}` : '\n  \\nonumber';
			lines.push("\\begin{equation}", `  ${tex}${tag}`, "\\end{equation}", "");
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
