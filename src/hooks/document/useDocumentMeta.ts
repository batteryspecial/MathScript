"use client";
import { useCallback, useState } from "react";
import { defaultDocumentMeta, type DocumentMeta } from "@/lib/latex/meta";

// Seeded from the DB by NotebookView; edits are written back by the document
// autosave, which reads `meta` straight out of this state.
export function useDocumentMeta(initialMeta?: DocumentMeta) {
    const [meta, setMeta] = useState<DocumentMeta>(() => initialMeta ?? defaultDocumentMeta());

    const updateMeta = useCallback((patch: Partial<DocumentMeta>) => {
        setMeta((m) => ({ ...m, ...patch }));
    }, []);

    return { meta, updateMeta };
}
