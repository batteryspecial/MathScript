'use client'
import { useCallback, useRef } from "react"
import type { Descendant } from "slate"
import type { Cell } from "./useCellOperations"

interface UseCellClipboardProps {
    cells: Cell[]
    selectedId: string
    selectedCellIds: Set<string>
    getEditorContent: (id: string) => Descendant[]
    isEditorEmpty: (id: string) => boolean
    pasteMultipleCells: (afterId: string, contents: Descendant[][], replaceAfterId?: boolean) => void
    deleteMultipleCells: (ids: Set<string>) => void
}

export function UseCellClipboard({
    cells,
    selectedId,
    selectedCellIds,
    getEditorContent,
    isEditorEmpty,
    pasteMultipleCells,
    deleteMultipleCells
}: UseCellClipboardProps) {
    const clipboard = useRef<Descendant[][] | null>(null)

    const copySelectedCells = useCallback((): void => {
        const selectedArray = cells.filter(c => selectedCellIds.has(c.id))
        clipboard.current = selectedArray.map(c => getEditorContent(c.id))
    }, [cells, getEditorContent, selectedCellIds])

    const pasteSelectedCells = useCallback((): void => {
        if (!clipboard.current || clipboard.current.length === 0) return
        const initialContent = clipboard.current.map(c => JSON.parse(JSON.stringify(c)))
        pasteMultipleCells(selectedId, initialContent, isEditorEmpty(selectedId))
    }, [selectedId, isEditorEmpty, pasteMultipleCells])

    const cutSelectedCells = useCallback((): void => {
        const selectedArray = cells.filter(c => selectedCellIds.has(c.id))
        clipboard.current = selectedArray.map(c => getEditorContent(c.id))
        deleteMultipleCells(selectedCellIds)
    }, [cells, getEditorContent, selectedCellIds, deleteMultipleCells])

    return { 
        copySelectedCells,
        pasteSelectedCells,
        cutSelectedCells,
    }
}

