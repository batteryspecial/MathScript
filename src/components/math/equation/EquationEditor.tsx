"use client";
import dynamic from "next/dynamic";
import type { RefObject } from "react";
import type { MathField } from "react-mathquill";
import { AUTO_COMMANDS } from "@/lib/equation";
import styles from "./equationEditor.module.css";

// MathQuill touches the DOM on mount, so it can only load client-side.
const EditableMathField = dynamic(
  () => import("react-mathquill").then((mod) => {
    mod.addStyles();
    return mod.EditableMathField;
  }),
  { ssr: false },
);

interface EquationBarProps {
  fieldRef: RefObject<MathField | null>;
  value: string;
  onChange: (value: string) => void;
}

export default function EquationEditor({ fieldRef, value, onChange }: EquationBarProps) {
  return (
    <div className="flex items-center gap-2.5 border-t-2 border-[var(--ms-accent)] bg-[#f8f9ff] px-3 py-2 shrink-0">
      <span className="[font-family:var(--ms-font-ui)] text-[10px] uppercase font-bold text-[var(--ms-accent)] whitespace-nowrap tracking-[0.5px]">
        EQ Editor
      </span>
      <EditableMathField
        latex={value}
        onChange={(mathField) => onChange(mathField.latex())}
        mathquillDidMount={(mathField) => {
          fieldRef.current = mathField;
        }}
        config={{ autoCommands: AUTO_COMMANDS }}
        className={styles.eqField}
      />
    </div>
  );
}
