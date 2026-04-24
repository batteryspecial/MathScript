'use client'
import { useRef, useState, useCallback } from 'react'
import type { Editor, Descendant } from 'slate'

// A single notebook cell. Content lives inside its Editor instance, not here.
interface Cell {
    id: string
    type: string
    initialContent: Descendant[] | null
}

/**
 * useCells — all notebook state logic.
 *
 * Variables
 *   cells[]     - array of { id, type, initialContent }
 *   selectedId  - which cell has focus/sidebar indicator
 *   editorRefs  - map of cellId → Slate editor instance (for clipboard reads)
 *   clipboard   - last copied Slate content (JSON)
 */
export function useCells() {
    const [cells, setCells] = useState<Cell[]>(() => [
        { id: crypto.randomUUID(), type: 'text', initialContent: null }
    ])
    const [selectedId, setSelectedId] = useState<string>(cells[0].id)

    const clipboard = useRef<Descendant[] | null>(null)
    const editorRefs = useRef<Record<string, Editor>>({})

    // Each Editor registers itself on mount so we can read its content
    const registerEditor = useCallback((id: string, editor: Editor): () => void => {
        editorRefs.current[id] = editor
        return () => { delete editorRefs.current[id] }
    }, [])

    const selectCell = useCallback((id: string): void => setSelectedId(id), [])

    // ------------------- CRUD -------------------

    const addCell = useCallback((afterId: string | null = null, initialContent: Descendant[] | null = null): void => {
        const newCell: Cell = { id: crypto.randomUUID(), type: 'text', initialContent }

        setCells((prev) => {
            if (!afterId) return [...prev, newCell]

            const index = prev.findIndex(c => c.id === afterId)
            const next = [...prev]
            next.splice(index, 0, newCell)
            return next
        })

        setSelectedId(newCell.id)
    }, [])

    const deleteCell = useCallback((id: string): void => {
        setCells((prev) => {
            if (prev.length <= 1) return prev

            const index = prev.findIndex(c => c.id === id)
            const next = prev.filter(c => c.id !== id)

            const focusIndex = Math.min(index, next.length - 1)
            setSelectedId(next[focusIndex].id)

            return next
        })
    }, [])

    // ------------------- CLIPBOARD -------------------

    const copyCell = useCallback((): void => {
        const editor = editorRefs.current[selectedId]
        if (!editor) return
        clipboard.current = JSON.parse(JSON.stringify(editor.children))
    }, [selectedId])

    const cutCell = useCallback((): void => {
        copyCell()
        deleteCell(selectedId)
    }, [copyCell, deleteCell, selectedId])

    const pasteCell = useCallback((): void => {
        if (!clipboard.current) return
        const content: Descendant[] = JSON.parse(JSON.stringify(clipboard.current))
        addCell(selectedId, content)
    }, [selectedId, addCell])

    return {
        cells,
        selectedId,
        selectCell,
        addCell,
        deleteCell,
        copyCell,
        cutCell,
        pasteCell,
        registerEditor,
    }
}
