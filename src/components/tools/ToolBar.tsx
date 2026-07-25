"use client";
import { useEffect, useRef, useState } from "react";
import { Sigma } from "lucide-react";
import type { NotebookAPI } from "@/lib/notebook/NotebookAPI";
import type { CellType } from "@/hooks/cells/useCells";
import type { Mark } from "@/lib/slate/marks";

import styles from "./toolBar.module.css";

interface ToolBarProps {
  api: NotebookAPI | null;
  symbolsOpen: boolean;
  onToggleSymbols: () => void;
}

const INSERT_ITEMS: { icon: string; label: string; type: CellType }[] = [
  { icon: "¶", label: "Text Paragraph", type: "text" },
  { icon: "§", label: "Section Header", type: "section" },
  { icon: "#", label: "Subsection", type: "subsection" },
  { icon: "ƒ", label: "Equation", type: "equation" },
];

export default function ToolBar({ api, symbolsOpen, onToggleSymbols }: ToolBarProps) {
  const [insertOpen, setInsertOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!insertOpen) return;
    const onDown = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setInsertOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [insertOpen]);

  const disabled = !api;
  const eqFocused = api?.selectedCell?.type === "equation";
  const fmtActive = (mark: Mark) => (api ? api.isFormatActive(mark) : false);

  return (
    <div className="flex items-center gap-1.5 bg-[var(--ms-tb-bg)] border-b border-[var(--ms-tb-border)] h-10 px-2.5 shrink-0">
      <div className="flex gap-1 items-center">
        <button
          className={`${styles.tbBtn} font-bold ${fmtActive("bold") ? styles.tbBtnActive : ""}`}
          disabled={disabled || eqFocused}
          onClick={() => api?.toggleFormat("bold")}
          title="Bold"
        >
          B
        </button>
        <button
          className={`${styles.tbBtn} italic ${fmtActive("italic") ? styles.tbBtnActive : ""}`}
          disabled={disabled || eqFocused}
          onClick={() => api?.toggleFormat("italic")}
          title="Italic"
        >
          I
        </button>
        <button
          className={`${styles.tbBtn} underline ${fmtActive("underline") ? styles.tbBtnActive : ""}`}
          disabled={disabled || eqFocused}
          onClick={() => api?.toggleFormat("underline")}
          title="Underline"
        >
          U
        </button>
      </div>

      <div className="w-px h-[18px] bg-[#ccc] mx-1" />

      <div className="flex gap-1 items-center">
        <div className="relative inline-flex" ref={dropdownRef}>
          <button
            className={styles.tbBtn}
            disabled={disabled}
            onClick={() => setInsertOpen((v) => !v)}
          >
            Insert ▾
          </button>
          {insertOpen && (
            <div className="absolute top-full left-0 mt-0.5 bg-white border border-[var(--ms-tb-border)] z-[100] min-w-[168px]">
              {INSERT_ITEMS.map((item) => (
                <div
                  key={item.type}
                  className="flex items-center gap-2 px-3.5 py-[7px] text-[12.5px] cursor-pointer text-[var(--ms-text)] hover:bg-[#eef4ff]"
                  onClick={() => {
                    api?.insertCell(item.type);
                    setInsertOpen(false);
                  }}
                >
                  <span className="w-4 text-center text-[var(--ms-muted)] [font-family:var(--ms-font-mono)]">
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="w-px h-[18px] bg-[#ccc] mx-1" />

      <div className="flex gap-1 items-center">
        <button
          className={`${styles.tbBtn} ${symbolsOpen ? styles.tbBtnActive : ""}`}
          onClick={onToggleSymbols}
          title="Toggle symbol panel"
        >
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
            <Sigma size={13} /> Symbols
          </span>
        </button>
      </div>

      <div className="flex-1" />
    </div>
  );
}
