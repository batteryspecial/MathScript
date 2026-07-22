"use client";
import { useMemo, type RefObject } from "react";
import { equationToUnicode } from "@/lib/equation";
import styles from "./equationBar.module.css";

interface EquationBarProps {
  inputRef: RefObject<HTMLInputElement | null>;
  value: string;
  onChange: (value: string) => void;
}

export default function EquationBar({ inputRef, value, onChange }: EquationBarProps) {
  const preview = useMemo(() => equationToUnicode(value), [value]);

  return (
    <div className="flex items-center gap-2.5 border-t-2 border-[var(--ms-accent)] bg-[#f8f9ff] px-3 py-[7px] shrink-0">
      <span className="[font-family:var(--ms-font-ui)] text-[10px] uppercase font-bold text-[var(--ms-accent)] whitespace-nowrap tracking-[0.5px]">
        EQ Editor
      </span>
      <input
        ref={inputRef}
        className={styles.eqInput}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g.  x = frac(-b +- sqrt(b^2 - 4ac), 2a)"
        spellCheck={false}
        autoComplete="off"
      />
      <span className="text-[var(--ms-muted)] text-xs">→</span>
      <div className={styles.eqPreview}>
        {preview ? (
          preview
        ) : (
          <span className="text-[var(--ms-muted)] italic [font-family:var(--ms-font-ui)] text-xs">
            preview
          </span>
        )}
      </div>
    </div>
  );
}
