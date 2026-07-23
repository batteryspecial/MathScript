"use client";
import { useCallback, useRef } from "react";
import type { MathField } from "react-mathquill";

// Owns the active MathQuill field so SymbolPanel can insert a command at the
// caret via the field's own `cmd` API.
export function useEquationBar() {
  const fieldRef = useRef<MathField | null>(null);

  const insertAtCursor = useCallback((latex: string) => {
    const field = fieldRef.current;
    if (!field) return;
    field.cmd(latex);
    field.focus();
  }, []);

  return { fieldRef, insertAtCursor };
}
