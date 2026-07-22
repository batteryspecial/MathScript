"use client";
import type { Descendant } from "slate";

import Editor, { type EditorVariant } from "@/components/editor/Editor";
import CellTaskbar from "./CellTaskbar";
import styles from "./cell.module.css";
import { equationToUnicode } from "@/lib/equation";
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

interface CellViewProps {
  id: string;
  type: CellType;
  className?: string
  initialContent: Descendant[] | null;
  equationContent?: string;
  autoFocus: boolean;
  isOpSelected: boolean;
  onSelect: () => void;
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
  className,
  initialContent,
  equationContent,
  autoFocus,
  isOpSelected,
  onSelect,
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
          <EquationDisplay src={equationContent ?? ""} />
        ) : (
          <Editor
            id={id}
            variant={VARIANT[type]}
            autoFocus={autoFocus}
            initialContent={initialContent}
            onFocus={onSelect}
            registerEditor={registerEditor}
            className="p-1"
          />
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
  const rendered = src.trim() ? equationToUnicode(src) : "";
  return (
    <div className={styles.equation}>
      {rendered || (
        <span className={styles.equationPlaceholder}>empty equation — edit below</span>
      )}
    </div>
  );
}
