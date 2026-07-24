import type { Cell } from "@/lib/cells/types";

// Mirrors LaTeX's own counter behavior: subsection resets whenever section increments.
export function computeHeadingNumbers(cells: Cell[]): Map<string, string> {
    const numbers = new Map<string, string>();
    let section = 0;
    let subsection = 0;

    for (const cell of cells) {
        if (cell.type === "section") {
            section += 1;
            subsection = 0;
            numbers.set(cell.id, `${section}`);
        } else if (cell.type === "subsection") {
            subsection += 1;
            numbers.set(cell.id, `${section}.${subsection}`);
        }
    }

    return numbers;
}
