"use client";
import { useCallback, useState } from "react";
import { defaultDocumentMeta, type DocumentMeta } from "@/lib/latex/meta";

const titleKey = (fileId: string) => `mathscript:title:${fileId}`;

// TODO: temporary client-side persistence — replace with DB-backed storage
function initialMeta(fileId: string): DocumentMeta {
    const base = defaultDocumentMeta();
    if (typeof window === "undefined") return base;
    const saved = window.sessionStorage.getItem(titleKey(fileId));
    return saved ? { ...base, title: saved } : base;
}

export function useDocumentMeta(fileId: string) {
    const [meta, setMeta] = useState<DocumentMeta>(() => initialMeta(fileId));

    const updateMeta = useCallback((patch: Partial<DocumentMeta>) => {
        setMeta((m) => {
            const next = { ...m, ...patch };
            if (patch.title !== undefined && typeof window !== "undefined") {
                window.sessionStorage.setItem(titleKey(fileId), patch.title);
            }
            return next;
        });
    }, [fileId]);

    return { meta, updateMeta };
}
