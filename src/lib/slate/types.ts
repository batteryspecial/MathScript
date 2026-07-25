import type { BaseEditor, BaseRange } from "slate";
import type { ReactEditor } from "slate-react";
import type { HistoryEditor } from "slate-history";

// Decoration-only flags. Derived from the text on every render and never stored
// in the document — see lib/slate/inlineMath.ts.
export type MathDecoration = {
    mathSource?: boolean; // inside a $...$ run
    mathDelim?: boolean; // the $ characters themselves, accent-coloured
    mathRendered?: boolean; // cell is unfocused — show KaTeX instead of source
};

export type CustomText = {
    text: string;
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
} & MathDecoration;

export type ParagraphElement = {
    type: "paragraph";
    children: CustomText[];
};

export type CustomElement = ParagraphElement;
export type CustomEditor = BaseEditor & ReactEditor & HistoryEditor;
export type CustomRange = BaseRange & MathDecoration;

declare module "slate" {
    interface CustomTypes {
        Editor: CustomEditor;
        Element: CustomElement;
        Text: CustomText;
        Range: CustomRange;
    }
}
