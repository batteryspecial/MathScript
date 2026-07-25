"use client";
import { createEditor, type Descendant, type NodeEntry } from "slate";
import { withHistory } from "slate-history";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
	Editable,
	ReactEditor,
	Slate,
	withReact,
	type RenderLeafProps
} from "slate-react";
import { toggleMark } from "@/lib/slate/marks";
import type { CustomEditor } from "@/lib/slate/types";
import { withInlineMath, mathDecorations } from "@/lib/slate/inlineMath";
import katex from "katex";

// Forces Slate to remount on Next.js hot reload 
// (its internal WeakMaps don't survive HMR otherwise).
const HMR_ID = Math.random();

export type EditorVariant = "text" | "section" | "subsection";

const EDITABLE_BASE = "outline-none whitespace-pre-wrap break-words [font-family:var(--ms-font-body)]";

const VARIANT_CLASS: Record<EditorVariant, string> = {
	text: "text-[13.5px] leading-[1.65] text-[var(--ms-text)]",
	section: "text-[18px] font-bold leading-[1.4] text-[#111]",
	subsection: "text-[15px] font-bold leading-[1.45] text-[#333]"
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

function MathLeaf({ attributes, children, leaf }: RenderLeafProps) {
	const html = useMemo(() => {
		try {
			return katex.renderToString(leaf.text.slice(1, -1), { throwOnError: true });
		} catch {
			return null;
		}
	}, [leaf.text]);

	return (
		<span {...attributes}>
			{/* the real text stays in the DOM at zero width so Slate can still
			    resolve positions inside this leaf */}
			<span className="text-[0px]">{children}</span>
			{html ? (
				<span
					contentEditable={false}
					className="rounded-[3px] bg-[var(--ms-eq-bg)] px-1 py-px text-[#1a1a6e]"
					dangerouslySetInnerHTML={{ __html: html }}
				/>
			) : (
				<span
					contentEditable={false}
					className="rounded-[3px] bg-[#fdeaea] px-1 py-px [font-family:var(--ms-font-mono)] text-[#c0392b]"
				>
					{leaf.text}
				</span>
			)}
		</span>
	);
}

function Leaf(props: RenderLeafProps) {
	const { attributes, children, leaf } = props;

	// only ever true while the cell is unfocused
	if (leaf.mathRendered) return <MathLeaf {...props} />;

	let el: React.ReactNode = children;
	if (leaf.bold) el = <strong>{el}</strong>;
	if (leaf.italic) el = <em>{el}</em>;
	if (leaf.underline) el = <u>{el}</u>;

	// Within a focused cell the shape never changes — only the class differs.
	if (leaf.mathSource) {
		return (
			<span
				{...attributes}
				className={`bg-[var(--ms-eq-bg)] [font-family:var(--ms-font-mono)] ${
					leaf.mathDelim ? "text-[#c0392b]" : "text-[#1a1a6e]"
				}`}
			>
				{el}
			</span>
		);
	}

	return <span {...attributes}>{el}</span>;
}

export default function Editor({
	id,
	variant = "text",
	className,
	autoFocus,
	initialContent,
	onFocus,
	registerEditor
}: EditorProps) {
	const editor = useMemo(() => withHistory(
		withReact(withInlineMath(createEditor()))
	), []);

	// Focus is read off a wrapper, not Editable's own onFocus/onBlur: Slate gates
	// those behind `isUpdatingSelection`, which swallows the blur exactly when you
	// click away. The dep matters too — slate-react only recomputes decorations
	// when `decorate`'s identity changes.
	const [editing, setEditing] = useState(false);
	const decorate = useCallback(
		(entry: NodeEntry) => mathDecorations(entry, editing),
		[editing],
	);

	// Fresh per instance (Slate mutates this array in place, so it must
	// never be shared between editors, doing so corrupts node paths)
	const initialValue = useMemo<Descendant[]>(() => initialContent ?? [
		{ type: "paragraph", children: [{ text: "" }] }
	], []); // eslint-disable-next-line react-hooks/exhaustive-deps 

	useEffect(() => {
		if (registerEditor && id) return registerEditor(id, editor);
	}, [registerEditor, id, editor]);

	// Focus on mount when this cell is the selected one.
	useEffect(() => {
		if (autoFocus) {
			try {
				ReactEditor.focus(editor);
			} catch (err) {
				console.log(err);
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const renderLeaf = useCallback((props: RenderLeafProps) => <Leaf {...props} />, []);

	const onKeyDown = useCallback((e: React.KeyboardEvent) => {
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
	}, [editor]);

	return (
		// display:contents — the wrapper is invisible to layout, but focusin /
		// focusout still bubble through it
		<div
			className="contents"
			onFocus={() => setEditing(true)}
			onBlur={(e) => {
				if (e.currentTarget.contains(e.relatedTarget as Node | null)) return;
				setEditing(false);
			}}
		>
			<Slate key={HMR_ID} editor={editor} initialValue={initialValue}>
				<Editable
					className={`${EDITABLE_BASE} ${VARIANT_CLASS[variant]} ${className ?? ""}`}
					renderLeaf={renderLeaf}
					decorate={decorate}
					onFocus={onFocus}
					onKeyDown={onKeyDown}
					spellCheck={false}
				/>
			</Slate>
		</div>
	);
}
