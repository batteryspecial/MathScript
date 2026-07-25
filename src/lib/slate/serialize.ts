import { Text, type Descendant } from "slate";
import { escapeLatexText } from "@/lib/latex/escape";
import type { CustomText } from "./types";

export function slateToPlainText(nodes: Descendant[]): string {
  	return nodes.map(plain).join("\n").trim();
}

function plain(node: Descendant): string {
	if (Text.isText(node)) return node.text;
	return node.children.map(plain).join("");
}

export function slateToLatex(nodes: Descendant[]): string {
	return nodes
		.map(blockLatex)
		.join("\n\n")
		.replace(/\n{3,}/g, "\n\n")
		.trim();
}

function blockLatex(node: Descendant): string {
	if (Text.isText(node)) return leafLatex(node);
	return node.children.map(blockLatex).join("");
}

// capturing split, so the $...$ runs survive as their own parts
const MATH_SPLIT = /(\$[^$\n]*\$)/g;

function leafLatex(leaf: CustomText): string {
	// $...$ is already valid inline LaTeX — escape the prose around it, not it
	let t = leaf.text
		.split(MATH_SPLIT)
		.map((part) =>
			part.length > 1 && part.startsWith("$") && part.endsWith("$")
				? part
				: escapeLatexText(part),
		)
		.join("");

	if (!t) return "";
	if (leaf.bold) t = `\\textbf{${t}}`;
	if (leaf.italic) t = `\\textit{${t}}`;
	if (leaf.underline) t = `\\underline{${t}}`;
	return t;
}
