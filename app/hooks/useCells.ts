'use client'
import { useRef, useState, useCallback } from 'react'
import type { Editor, Descendant } from 'slate'
import { ReactEditor } from 'slate-react'

// A single notebook cell. Content lives inside its Editor instance, not here.
interface Cell {
    id: string
    type: string
    initialContent: Descendant[] | null
}

type CellOperationMode = 'cellWrite' | 'cellOperation' | null

/**
 * useCells — all notebook state logic.
 *
 * @param cells[]          - array of { id, type, initialContent }
 * @param selectedId       - which cell has focus/sidebar indicator
 * @param cellOpMode       - 'cellWrite' | 'cellOperation' | null
 * @param selectedCellIds  - set of cell ids selected in cell operation mode
 * @param editorRefs       - map of cellId → Slate editor instance (for clipboard reads)
 * @param clipboard        - last copied Slate content (JSON)
 */
export function useCells() {
    const [cells, setCells] = useState<Cell[]>(() => [{
        id: crypto.randomUUID(),
        initialContent: null,
        type: 'text',
    }])

    const [anchorId, setAnchorId] = useState<string | null>(null)
    const [selectedId, setSelectedId] = useState<string>(cells[0].id)
    const [cellOpMode, setCellOpMode] = useState<CellOperationMode>(null)
    const [selectedCellIds, setSelectedCellIds] = useState<Set<string>>(new Set())

    const clipboard = useRef<Descendant[] | null>(null)
    const editorRefs = useRef<Record<string, Editor>>({})

    const selectCell = useCallback((id: string): void => setSelectedId(id), [])

    // Each editor registers itself on mount so we can read its content for clipboard ops.
    // TODO: implement virtualization and conditional mounting
    const registerEditor = useCallback((id: string, editor: Editor): () => void => {
        editorRefs.current[id] = editor
        return () => { delete editorRefs.current[id] }
    }, [])

    // MODE

    const enterCellOperationMode = useCallback((id: string): void => {
        setAnchorId(id)
        setSelectedId(id)
        setCellOpMode('cellOperation')
        setSelectedCellIds(new Set([id]))

        // Blur all editors so keyboard events go to the document
        Object.values(editorRefs.current).forEach(editor => {
            try { ReactEditor.blur(editor as ReactEditor) } catch {}
        })
    }, [])

    const exitCellOperationMode = useCallback((): void => {
        setCellOpMode('cellWrite')
        setSelectedCellIds(new Set())
    }, [])

    const cellMultiSelect = useCallback((direction: 'up' | 'down'): void => {
        const currentIndex = cells.findIndex(c => c.id === selectedId)
        const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1

        if (targetIndex < 0 || targetIndex >= cells.length) return

        const targetId = cells[targetIndex].id
        const anchorIndex = cells.findIndex(c => c.id === anchorId)

        setSelectedId(targetId)

        const start = Math.min(anchorIndex, targetIndex)
        const end = Math.max(anchorIndex, targetIndex)

        const nextIds = new Set<string>()
        for (let i = start; i <= end; i++) {
            nextIds.add(cells[i].id)
        }

        setSelectedCellIds(nextIds)
    }, [cells, selectedId, anchorId])

    // Move selection to the adjacent cell without extending the selection range
    const navigateCell = useCallback((direction: 'up' | 'down'): void => {
        const currentIndex = cells.findIndex(c => c.id === selectedId)
        const targetIndex = (direction === 'up') ? currentIndex - 1 : currentIndex + 1;

        if (targetIndex < 0 || targetIndex >= cells.length) return

        const newId = cells[targetIndex].id

        setSelectedId(newId)
        setAnchorId(newId)
        setSelectedCellIds(new Set([newId]))
    }, [cells, selectedId])

    // CRUD
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
            setAnchorId(selectedId)
            return next
        })
    }, [selectedId])

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
        cellOpMode,
        selectedCellIds,
        selectCell,
        enterCellOperationMode,
        exitCellOperationMode,
        cellMultiSelect,
        navigateCell,
        addCell,
        deleteCell,
        copyCell,
        cutCell,
        pasteCell,
        registerEditor,
    }
}
