"use client";
import { useMemo, useState } from "react";
import { SYMBOLS, type SymbolCategory, type SymbolDef } from "@/lib/equation";

import styles from "./symbols.module.css";

const TABS: { id: SymbolCategory; label: string }[] = [
  { id: "math", label: "Math" },
  { id: "greek", label: "Greek" },
  { id: "arrow", label: "Arrows" },
];

interface SymbolPanelProps {
  canInsert: boolean;
  onInsert: (latex: string) => void;
}

export default function SymbolPanel({ canInsert, onInsert }: SymbolPanelProps) {
  const [tab, setTab] = useState<SymbolCategory>("math");

  const symbols = useMemo(() => {
    const seen = new Set<string>();
    const out: SymbolDef[] = [];
    for (const s of SYMBOLS) {
      if (s.category !== tab || seen.has(s.unicode)) continue;
      seen.add(s.unicode);
      out.push(s);
    }
    return out;
  }, [tab]);

  return (
    <div className="bg-white border-b border-[var(--ms-border)] px-2.5 pt-1.5 pb-2 shrink-0">
      <div className="flex items-center gap-1 mb-1.5">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`[font-family:var(--ms-font-ui)] text-xs px-2.5 py-[3px] border-none cursor-pointer rounded-t-[3px] ${
              tab === t.id
                ? "bg-[var(--ms-accent)] text-white font-bold"
                : "bg-transparent text-[var(--ms-muted)]"
            }`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
        <span
          className={`ml-auto text-[11px] ${
            canInsert ? "text-[var(--ms-accent)]" : "text-[var(--ms-muted)] italic"
          }`}
        >
          {canInsert ? "click to insert" : "select an equation cell first"}
        </span>
      </div>

      <div className="flex flex-wrap gap-0.5">
        {symbols.map((s) => (
          <button
            key={s.key}
            className={styles.symBtn}
            disabled={!canInsert}
            title={s.key}
            onClick={() => onInsert(s.latex)}
          >
            {s.unicode}
          </button>
        ))}
      </div>
    </div>
  );
}
