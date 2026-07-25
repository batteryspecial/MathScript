"use client";
import { useMemo } from "react";
import type { Descendant } from "slate";
import katex from "katex";

import Editor, { type EditorVariant } from "@/components/editor/Editor";
import CellTaskbar from "./CellTaskbar";
import styles from "./cell.module.css";
import type { CellType } from "@/hooks/cells/useCells";
import type { CustomEditor } from "@/lib/slate/types";

const TAG_LABEL: Record<CellType, string> = {
  section: "H1",
  subsection: "H2",
  text: "P",
  equation: "EQ",
};

const TYPE_CLASS: Record<CellType, string> = {
  text: styles.typeText,
  section: styles.typeSection,
  subsection: styles.typeSubsection,
  equation: styles.typeEquation,
};

const TAG_CLASS: Record<CellType, string> = {
  text: styles.tagP,
  section: styles.tagH1,
  subsection: styles.tagH2,
  equation: styles.tagEq,
};

const VARIANT: Record<"text" | "section" | "subsection", EditorVariant> = {
  text: "text",
  section: "section",
  subsection: "subsection",
};

// matches the Editor variant's own font scale, so the number reads inline with the title
const HEADING_NUMBER_CLASS: Record<CellType, string> = {
  text: "",
  equation: "",
  section: "text-[18px] font-bold leading-[1.4] font-[family-name:var(--ms-font-body)]",
  subsection: "text-[15px] font-bold leading-[1.45] font-[family-name:var(--ms-font-body)]",
};

interface CellViewProps {
	id: string;
	type: CellType;
	label?: string;
	headingNumber?: string;
	className?: string;
	initialContent: Descendant[] | null;
	equationContent?: string;
	autoFocus: boolean;
	isOpSelected: boolean;
	onSelect: () => void;
	onDirty: () => void;
	onLabelChange: (id: string, value: string) => void;
	onEnterCellOpMode: (e: React.MouseEvent) => void;
	registerEditor: (id: string, editor: CustomEditor) => () => void;
	onMoveUp: () => void;
	onMoveDown: () => void;
	onDuplicate: () => void;
	onDelete: () => void;
}

export default function CellView({
    id,
    type,
    label,
    headingNumber,
    className,
    initialContent,
    equationContent,
    autoFocus,
    isOpSelected,
    onSelect,
    onDirty,
    onLabelChange,
    onEnterCellOpMode,
    registerEditor,
    onMoveUp,
    onMoveDown,
    onDuplicate,
    onDelete,
}: CellViewProps) {
    const selected: boolean = autoFocus || isOpSelected;
    const styleName: string = [className, styles.cell, TYPE_CLASS[type], selected && styles.selected].filter(Boolean).join(" ")
    
    return (
		<div className={styleName} onClick={onSelect}>
			<div
				className={`${styles.tagCol} p-2`}
				onClick={(e) => {
					e.stopPropagation();
					onEnterCellOpMode(e);
				}}
			>
				<span className={`${styles.tag} ${TAG_CLASS[type]}`}>{TAG_LABEL[type]}</span>
			</div>

			<div className={styles.content}>
				{type === "equation" ? (
					<div className="flex items-center gap-2">
						<EquationDisplay src={equationContent ?? ""} />
						<input
							className="flex-none [field-sizing:content] min-w-[20px] max-w-[160px] [font-family:var(--ms-font-mono)] text-xs text-[var(--ms-muted)] bg-[#f0f0f0] border border-[var(--ms-border)] rounded-[2px] py-0.5 px-1.5 text-right focus:outline-none focus:border-[var(--ms-accent)] focus:text-[var(--ms-text)]"
							value={label ?? ""}
							placeholder="(n)"
							onClick={(e) => e.stopPropagation()}
							onChange={(e) => onLabelChange(id, e.target.value)}
						/>
					</div>
				) : (
					<div className="flex items-start gap-2">
						{headingNumber && (
							<span className={`${HEADING_NUMBER_CLASS[type]} my-auto text-[var(--ms-muted)]`}>
								{headingNumber}
							</span>
						)}
						<Editor
							id={id}
							variant={VARIANT[type]}
							autoFocus={autoFocus}
							initialContent={initialContent}
							onFocus={onSelect}
							onDirty={onDirty}
							registerEditor={registerEditor}
							className="flex-1 min-w-0 p-1"
						/>
					</div>
				)}
			</div>

			<CellTaskbar
				onMoveUp={onMoveUp}
				onMoveDown={onMoveDown}
				onDuplicate={onDuplicate}
				onDelete={onDelete}
			/>
		</div>
    );
}

function EquationDisplay({ src }: { src: string }) {
    const html = useMemo(() => {
        if (!src.trim()) return null;
        try {
            return katex.renderToString(src, { throwOnError: false, displayMode: true });
        } catch {
            return null;
        }
    }, [src]);

    if (html) return (
        <div
            className="flex-1 min-w-0 [font-family:var(--ms-font-mono)] text-[18px] text-center text-[#1a1a6e] py-1 break-words"
            dangerouslySetInnerHTML={{ __html: html }}
        />
    );

    return (
        <div className="flex-1 min-w-0 [font-family:var(--ms-font-mono)] text-[18px] text-center text-[#1a1a6e] py-1 break-words">
            {src.trim() ? (
                <span className="[font-family:var(--ms-font-ui)] text-xs italic text-[var(--ms-muted)]">{src}</span>
            ) : (
                <span className="[font-family:var(--ms-font-ui)] text-xs italic text-[var(--ms-muted)]">empty equation — edit below</span>
            )}
        </div>
    );
}
