import { Editor } from "slate";
import type { CustomEditor } from "./types";

export type Mark = "bold" | "italic" | "underline";

export function isMarkActive(editor: CustomEditor, mark: Mark): boolean {
  const marks = Editor.marks(editor);
  return marks ? marks[mark] === true : false;
}

export function toggleMark(editor: CustomEditor, mark: Mark): void {
  if (isMarkActive(editor, mark)) Editor.removeMark(editor, mark);
  else Editor.addMark(editor, mark, true);
}
