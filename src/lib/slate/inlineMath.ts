import { Editor, Range, Text, Transforms, type NodeEntry } from "slate";
import type { CustomEditor, CustomRange } from "./types";

// A math run is literally "$...$" in the text. Derived on every render and never
// stored, so it cannot drift from what the user actually typed.
const MATH_RE = /\$[^$\n]*\$/g;

// Depends on focus, never on the cursor. A focused cell always shows source, so
// the caret never moves between differently-shaped leaves; the render swap only
// happens on blur, when there is no selection inside the cell to strand.
export function mathDecorations(
    [node, path]: NodeEntry,
    focused: boolean,
): CustomRange[] {
    if (!Text.isText(node)) return [];

    const ranges: CustomRange[] = [];
    for (const match of node.text.matchAll(MATH_RE)) {
        const start = match.index ?? 0;
        const end = start + match[0].length;
        const at = (from: number, to: number) => ({
            anchor: { path, offset: from },
            focus: { path, offset: to },
        });

        // an empty $$ never renders — KaTeX would draw nothing and it'd vanish
        if (!focused && match[0].slice(1, -1).trim()) {
            ranges.push({ ...at(start, end), mathRendered: true });
            continue;
        }

        ranges.push({ ...at(start, end), mathSource: true });
        ranges.push({ ...at(start, start + 1), mathDelim: true });
        ranges.push({ ...at(end - 1, end), mathDelim: true });
    }

    return ranges;
}

export function withInlineMath(editor: CustomEditor): CustomEditor {
    const { insertText } = editor;

    editor.insertText = (text): void => {
        const { selection } = editor;
        if (text !== "$" || !selection || !Range.isCollapsed(selection)) {
            return insertText(text);
        }

        const { path, offset } = selection.anchor;
        const [node] = Editor.node(editor, path);
        if (!Text.isText(node)) return insertText(text);

        // onto an existing $: step over it, so typing the pair closed works
        if (node.text[offset] === "$") {
            Transforms.move(editor, { distance: 1 });
            return;
        }

        // next to a delimiter, or already inside a run: insert exactly the one
        // character typed. Auto-pairing here is what produced $$$$ and nesting.
        const insideRun = [...node.text.matchAll(MATH_RE)].some((m) => {
            const start = m.index ?? 0;
            return offset > start && offset < start + m[0].length;
        });
        if (insideRun || node.text[offset - 1] === "$") return insertText(text);

        insertText("$$");
        Transforms.move(editor, { distance: 1, reverse: true });
    };

    return editor;
}
