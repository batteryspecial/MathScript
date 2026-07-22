"use client";
import { useCallback, useRef } from "react";

// Owns the equation-bar input element and lets the SymbolPanel insert a glyph
// at the caret. We set the value through the native setter + dispatch a real
// `input` event so React's controlled onChange fires and state stays in sync.
export function useEquationBar() {
  const inputRef = useRef<HTMLInputElement>(null);

  const insertAtCursor = useCallback((text: string) => {
    const el = inputRef.current;
    if (!el) return;

    const start = el.selectionStart ?? el.value.length;
    const end = el.selectionEnd ?? el.value.length;
    const next = el.value.slice(0, start) + text + el.value.slice(end);

    const setter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      "value",
    )?.set;
    setter?.call(el, next);
    el.dispatchEvent(new Event("input", { bubbles: true }));

    const caret = start + text.length;
    el.setSelectionRange(caret, caret);
    el.focus();
  }, []);

  return { inputRef, insertAtCursor };
}
