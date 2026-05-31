"use client";
import { createEditor, type Descendant } from "slate";
import { withHistory } from "slate-history";
import { useCallback, useEffect, useMemo } from "react";
import {
  Editable,
  ReactEditor,
  Slate,
  withReact,
  type RenderLeafProps,
} from "slate-react";
import { toggleMark } from "@/lib/slate/marks";
import type { CustomEditor } from "@/lib/slate/types";

// Forces Slate to remount on Next.js hot reload (its internal WeakMaps don't
// survive HMR otherwise).
const HMR_ID = Math.random();

export type EditorVariant = "text" | "section" | "subsection";

const EDITABLE_BASE = "outline-none whitespace-pre-wrap break-words [font-family:var(--ms-font-body)]";

const VARIANT_CLASS: Record<EditorVariant, string> = {
  text: "text-[13.5px] leading-[1.65] text-[var(--ms-text)]",
  section: "text-[18px] font-bold leading-[1.4] text-[#111]",
  subsection: "text-[15px] font-bold leading-[1.45] text-[#333]",
};

interface EditorProps {
  id: string;
  className?: string
  variant?: EditorVariant;
  autoFocus?: boolean
  initialContent: Descendant[] | null;
  onFocus: () => void;
  registerEditor: (id: string, editor: CustomEditor) => () => void;
}

function Leaf({ attributes, children, leaf }: RenderLeafProps) {
  let el: React.ReactNode = children;
  if (leaf.bold) el = <strong>{el}</strong>;
  if (leaf.italic) el = <em>{el}</em>;
  if (leaf.underline) el = <u>{el}</u>;
  return <span {...attributes}>{el}</span>;
}

export default function Editor({
  id,
  variant = "text",
  className,
  autoFocus,
  initialContent,
  onFocus,
  registerEditor,
}: EditorProps) {
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);
  // Fresh per instance: Slate mutates this array in place, so it must never be
  // shared between editors (doing so corrupts node paths).
  const initialValue = useMemo<Descendant[]>(
    () => initialContent ?? [{ type: "paragraph", children: [{ text: "" }] }],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useEffect(() => {
    if (registerEditor && id) return registerEditor(id, editor);
  }, [registerEditor, id, editor]);

  // Focus on mount when this cell is the selected one.
  useEffect(() => {
    if (autoFocus) {
      try {
        ReactEditor.focus(editor);
      } catch {
        /* editor not mounted yet */
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderLeaf = useCallback((props: RenderLeafProps) => <Leaf {...props} />, []);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey)) return;
      const k = e.key.toLowerCase();
      if (k === "b") {
        e.preventDefault();
        toggleMark(editor, "bold");
      } else if (k === "i") {
        e.preventDefault();
        toggleMark(editor, "italic");
      } else if (k === "u") {
        e.preventDefault();
        toggleMark(editor, "underline");
      }
    },
    [editor],
  );

  return (
    <Slate key={HMR_ID} editor={editor} initialValue={initialValue}>
      <Editable
        className={`${EDITABLE_BASE} ${VARIANT_CLASS[variant]} ${className ?? ""}`}
        renderLeaf={renderLeaf}
        onFocus={onFocus}
        onKeyDown={onKeyDown}
        spellCheck={false}
      />
    </Slate>
  );
}
