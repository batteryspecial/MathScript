"use client";
import { Plus, Scissors, Copy, Clipboard, CopyPlus } from "lucide-react";
import type { NotebookAPI } from "@/app/notebook/NotebookAPI";

interface OperationbarProps {
  api: NotebookAPI | null;
}

function OpButton({
  title,
  disabled,
  onClick,
  children,
}: {
  title: string;
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      title={title}
      disabled={disabled}
      onClick={onClick}
      className="flex items-center justify-center w-7 h-7 rounded-[3px] text-[var(--ms-text)] cursor-pointer hover:bg-[#e8eaec] disabled:text-[#bbb] disabled:cursor-default disabled:hover:bg-transparent"
    >
      {children}
    </button>
  );
}

// Cell operations bar — sits above the formatting Toolbar. Operations run on
// the active notebook regardless of cell mode (it resolves its own target).
export default function Operationbar({ api }: OperationbarProps) {
  const disabled = !api;
  return (
    <div className="flex items-center gap-1 bg-[var(--ms-tb-bg)] border-b border-[var(--ms-tb-border)] h-9 px-2.5 shrink-0">
      <OpButton title="Add cell" disabled={disabled} onClick={() => api?.addCell()}>
        <Plus size={15} />
      </OpButton>
      <OpButton title="Cut" disabled={disabled} onClick={() => api?.cutCells()}>
        <Scissors size={15} />
      </OpButton>
      <OpButton title="Copy" disabled={disabled} onClick={() => api?.copyCells()}>
        <Copy size={15} />
      </OpButton>
      <OpButton title="Paste" disabled={disabled} onClick={() => api?.pasteCells()}>
        <Clipboard size={15} />
      </OpButton>
      <OpButton title="Duplicate" disabled={disabled} onClick={() => api?.duplicateCells()}>
        <CopyPlus size={15} />
      </OpButton>
    </div>
  );
}
