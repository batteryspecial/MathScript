'use client'
import { useRef, useState, useCallback, type RefObject } from 'react'
import type { Editor } from 'slate'
import { ReactEditor } from 'slate-react'

import type { Cell, CellType, CellSnapshot } from '@/lib/cells/types'
import {
    makeCell, snapshotToCell, insertAfter, replaceCell, removeByIds, moveCell, cellsInOrder,
} from '@/lib/cells/operations'

export type { Cell, CellType } from '@/lib/cells/types'

type CellOperationMode = 'cellWrite' | 'cellOperation' | null

/**
 * useCells - per-notebook cell state + selection
 *
 * - State (cells, selection) stays local to each Notebook instance
 * -  Logic itself lives in pure helpers (lib/cells/operations.ts)
 * - The clipboard ref is owned by AppShell and injected
 *
 * - All cell operations are mode-agnostic
 * - The multi-select set when one exists
 * - Same functions back both the keyboard handlers and the operation bar.
 */
export function useCells(clipboard: RefObject<CellSnapshot[] | null>) {
    const [cells, setCells] = useState<Cell[]>(() => [{
        id: crypto.randomUUID(),
        initialContent: null,
        type: 'text',
    }])

    const [anchorId, setAnchorId] = useState<string | null>(null)
    const [selectedId, setSelectedId] = useState<string>(cells[0].id)
    const [cellOpMode, setCellOpMode] = useState<CellOperationMode>(null)
    const [selectedCellIds, setSelectedCellIds] = useState<Set<string>>(new Set())

    const editorRefs = useRef<Record<string, Editor>>({})
    const extensionDirection = useRef<'up' | 'down' | null>(null)

    const selectCell = useCallback((id: string): void => setSelectedId(id), [])

    // Each editor registers itself on mount so we can read its content for clipboard ops
    // TODO: implement virtualization and conditional mounting
    const registerEditor = useCallback((id: string, editor: Editor): () => void => {
        editorRefs.current[id] = editor
        return () => { delete editorRefs.current[id] }
    }, [])

    // --- MODE SELECTION --------------------------------------------

    const enterCellOperationMode = useCallback((id: string): void => {
        setAnchorId(id)
        setSelectedId(id)
        setCellOpMode('cellOperation')
        setSelectedCellIds(new Set([id]))
        
        extensionDirection.current = null

        // Blur all editors so keyboard events go to the document
        Object.values(editorRefs.current).forEach(editor => {
            try { ReactEditor.blur(editor as ReactEditor) } catch {}
        })
    }, [])

    const exitCellOperationMode = useCallback((): void => {
        extensionDirection.current = null

        setCellOpMode('cellWrite')
        setSelectedCellIds(new Set())
    }, [])

    // --- CELL SELECTION --------------------------------------------

    const cellMultiArrowSelect = useCallback((direction: 'up' | 'down'): void => {
        const currentIndex = cells.findIndex(c => c.id === selectedId)
        const anchorIndex = cells.findIndex(c => c.id === anchorId)
        const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1

        if (targetIndex < 0 || targetIndex >= cells.length) return
        const movingAway = (direction === 'up')
            ? targetIndex < anchorIndex
            : targetIndex > anchorIndex

        if (movingAway) {
            if (extensionDirection.current === null) {
                extensionDirection.current = direction
            }
            else if (extensionDirection.current !== direction) {
                return
            }
        }

        const targetId = cells[targetIndex].id
        setSelectedId(targetId)

        setSelectedCellIds(prev => {
            const ids = new Set(prev)
            movingAway ? ids.add(targetId) : ids.delete(cells[currentIndex].id)
            return ids
        })
    }, [cells, selectedId, anchorId])

    const onShiftRelease = useCallback((): void => {
        setAnchorId(selectedId)
        extensionDirection.current = null
    }, [selectedId])


    const cellMultiClickSelect = useCallback((nextId: string): void => {
        setCellOpMode('cellOperation')
        setSelectedId(nextId)
        setAnchorId(nextId)
        setSelectedCellIds(prev => {
            const newIds = new Set(prev)
            newIds.has(nextId) || newIds.add(nextId)
            return newIds
        })

        // Blur all editors so keyboard events go to the document
        Object.values(editorRefs.current).forEach(editor => {
            try { ReactEditor.blur(editor as ReactEditor) } catch {}
        })
    }, [])


    const navigateCell = useCallback((direction: 'up' | 'down'): void => {
        const currentIndex = cells.findIndex(c => c.id === selectedId)
        const targetIndex = (direction === 'up') ? currentIndex - 1 : currentIndex + 1;

        if (targetIndex < 0 || targetIndex >= cells.length) return

        extensionDirection.current = null

        const newId = cells[targetIndex].id

        setSelectedId(newId)
        setAnchorId(newId)
        setSelectedCellIds(new Set([newId]))
    }, [cells, selectedId])


    const selectAllCells = useCallback((): void => {
        setSelectedCellIds(new Set(cells.map(c => c.id)))
        setSelectedId(cells[cells.length - 1]?.id)
        setAnchorId(cells[0]?.id)
        extensionDirection.current = null
    }, [cells])


    // --- EDITOR STATE RETRIEVAL -----------------------------------------

    const getEditorContent = useCallback((id: string) => {
        const editor = editorRefs.current[id]
        if (!editor) {
            return [{ type: 'paragraph', children: [{ text: '' }] }] as Cell['initialContent']
        }
        return JSON.parse(JSON.stringify(editor.children))
    }, [])

    const isEditorEmpty = useCallback((id: string): boolean => {
        const editor = editorRefs.current[id]
        if (!editor)
            return true

        const children = editor.children as any[]
        return (children.length === 1) && (children[0]?.children.length === 1) && (children[0]?.children.text === '')
    }, [])

    // --- TARGET RESOLUTION ----------------------------------------------
    // The set an operation acts on: the multi-select when non-empty (cell
    // operation mode), otherwise just the focused cell (mid-write or single).
    const targetIds = useCallback((): Set<string> => (
        selectedCellIds.size > 0 ? new Set(selectedCellIds) : new Set([selectedId])
    ), [selectedCellIds, selectedId])

    // Whole-cell snapshots in document order. Equation cells carry their source;
    // prose cells serialize their live Slate tree.
    const snapshot = useCallback((ids: Set<string>): CellSnapshot[] => (
        cellsInOrder(cells, ids).map(cell => ({
            type: cell.type,
            equationContent: cell.equationContent,
            initialContent: cell.type === 'equation' ? null : getEditorContent(cell.id),
        }))
    ), [cells, getEditorContent])

    // --- CELL OPERATIONS ------------------------------------------------

    // Blank text cell appended to the bottom; drops into write mode on it.
    const addCell = useCallback((): void => {
        const cell = makeCell(crypto.randomUUID())
        setCells(prev => [...prev, cell])
        setSelectedId(cell.id)
        setAnchorId(cell.id)
        setSelectedCellIds(new Set())
        setCellOpMode('cellWrite')
    }, [])

    const copyCells = useCallback((ids: Set<string> = targetIds()): void => {
        const snaps = snapshot(ids)
        if (snaps.length === 0) return
        clipboard.current = snaps
    }, [snapshot, targetIds, clipboard])

    const deleteCells = useCallback((ids: Set<string> = targetIds()): void => {
        setCells(prev => {
            const remaining = removeByIds(prev, ids)
            if (remaining.length === 0) {
                const blank = makeCell(crypto.randomUUID())
                setAnchorId(blank.id); setSelectedId(blank.id); setSelectedCellIds(new Set([blank.id]))
                return [blank]
            }
            // Focus the cell just before the first deletion (or the new head).
            const firstDel = prev.findIndex(c => ids.has(c.id))
            const focusId = firstDel > 0 ? prev[firstDel - 1].id : remaining[0].id
            setAnchorId(focusId); setSelectedId(focusId); setSelectedCellIds(new Set([focusId]))
            return remaining
        })
    }, [targetIds])

    const cutCells = useCallback((ids: Set<string> = targetIds()): void => {
        copyCells(ids)
        deleteCells(ids)
    }, [copyCells, deleteCells, targetIds])

    const pasteCells = useCallback((): void => {
        const snaps = clipboard.current
        if (!snaps || snaps.length === 0) return

        // Deep-clone per paste: Slate mutates initialContent in place, so two
        // pastes of the same snapshot must not share an array.
        const fresh: Cell[] = snaps.map(s => snapshotToCell(crypto.randomUUID(), {
            ...s,
            initialContent: s.initialContent ? JSON.parse(JSON.stringify(s.initialContent)) : null,
        }))

        const sel = cells.find(c => c.id === selectedId)
        const replace = !!sel && sel.type !== 'equation' && isEditorEmpty(selectedId)

        setCells(prev => (replace ? replaceCell(prev, selectedId, fresh) : insertAfter(prev, selectedId, fresh)))
        setSelectedId(fresh[fresh.length - 1].id)
        setAnchorId(fresh[0].id)
        setSelectedCellIds(new Set(fresh.map(c => c.id)))
    }, [cells, selectedId, isEditorEmpty, clipboard])

    const duplicateCells = useCallback((ids: Set<string> = targetIds()): void => {
        const ordered = cellsInOrder(cells, ids)
        if (ordered.length === 0) return
        const fresh = snapshot(ids).map(s => snapshotToCell(crypto.randomUUID(), s))
        const afterId = ordered[ordered.length - 1].id
        setCells(prev => insertAfter(prev, afterId, fresh))
        setSelectedId(fresh[fresh.length - 1].id)
        setAnchorId(fresh[0].id)
        setSelectedCellIds(new Set(fresh.map(c => c.id)))
    }, [cells, snapshot, targetIds])

    const swapCells = useCallback((id: string, swapDir: 'up' | 'down'): void => {
        setCells(prev => moveCell(prev, id, swapDir))
    }, [])

    // --- CELL TYPES -----------------------------------------------------
    // — sections, subsections, equations

    const addCellWithType = useCallback((afterId: string | null, type: CellType): void => {
        const cell = makeCell(crypto.randomUUID(), type)
        setCells(prev => insertAfter(prev, afterId, [cell]))
        setSelectedId(cell.id)
    }, [])

    const setCellEquationContent = useCallback((id: string, latex: string): void => {
        setCells(prev => prev.map(c => (c.id === id ? { ...c, equationContent: latex } : c)))
    }, [])

    const setCellType = useCallback((id: string, type: CellType): void => {
        setCells(prev => prev.map(c => (
            c.id === id
                ? { ...c, type, equationContent: type === 'equation' ? (c.equationContent ?? '') : c.equationContent }
                : c
        )))
    }, [])


    return {
        cells, cellOpMode, setCellOpMode,
        registerEditor, getEditorContent, isEditorEmpty,
        selectCell, selectedId, selectedCellIds, selectAllCells,
        enterCellOperationMode, exitCellOperationMode,
        navigateCell, cellMultiArrowSelect, onShiftRelease, cellMultiClickSelect,
        addCell, copyCells, cutCells, pasteCells, deleteCells, duplicateCells, swapCells,
        addCellWithType, setCellEquationContent, setCellType,
    }
}
