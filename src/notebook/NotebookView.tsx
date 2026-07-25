"use client"
import { useCallback, useEffect, useMemo, useRef, type RefObject } from "react"

import { ReactEditor } from "slate-react"
import { HistoryEditor } from "slate-history"

import { useCells, type CellType } from "@/hooks/cells/useCells"
import { useCellOperations } from "@/hooks/cells/useCellOperations"
import { useDocumentMeta } from "@/hooks/document/useDocumentMeta"
import { useAutosave, type SaveState } from "@/hooks/document/useAutosave"
import { saveDocumentAction } from "@/lib/db/actions"
import type { InitialDocument } from "@/lib/db/hydrate"

import CellView from "@/components/cell/CellView"
import { ClickHandler } from "@/lib/keybinds/ClickHandler"
import { isMarkActive, toggleMark, type Mark } from "@/lib/slate/marks"
import { slateToLatex } from "@/lib/slate/serialize"
import { buildLatex } from "@/lib/latex/export"
import { computeHeadingNumbers } from "@/lib/cells/numbering"
import type { CustomEditor } from "@/lib/slate/types"
import type { CellSnapshot } from "@/lib/cells/types"
import type { NotebookAPI } from "@/lib/notebook/NotebookAPI"

interface NotebookViewProps {
    fileId: string
    isActive: boolean
    clipboard: RefObject<CellSnapshot[] | null>
    docCache: RefObject<Record<string, InitialDocument>>
    onAPI: (api: NotebookAPI) => void
    onSaveState: (fileId: string, state: SaveState) => void
}

export default function NotebookView({
    fileId,
    isActive,
    clipboard,
    docCache,
    onAPI,
    onSaveState,
}: NotebookViewProps) {
    // Only read at mount — the useState initializers below run once.
    const initialDoc = docCache.current[fileId]

    const c = useCells(clipboard, initialDoc?.cells)
    const { meta, updateMeta } = useDocumentMeta(initialDoc?.meta)

    const { state: saveState, markDirty } = useAutosave(
        () => ({ meta, cells: c.serializeCells() }),
        (payload) => saveDocumentAction(fileId, payload.meta, payload.cells),
    )

    // Structural edits (add/delete/move/retype/label/equation) change `cells`;
    // prose does not — Slate owns that, so Editor calls markDirty directly.
    const structure = c.cells
        .map((cell) => `${cell.id}:${cell.type}:${cell.label ?? ""}:${cell.equationContent ?? ""}`)
        .join("|")

    const clean = useRef(true)
    useEffect(() => {
        if (clean.current) {
            clean.current = false
            return
        }
        markDirty()
    }, [structure, meta, markDirty])

    useEffect(() => {
        onSaveState(fileId, saveState)
    }, [fileId, saveState, onSaveState])

    // Hand the live document back to AppShell on unmount, so closing and
    // reopening the tab resumes where it left off rather than at load time.
    const snapshotDoc = useRef<() => InitialDocument>(null!)
    snapshotDoc.current = () => ({
        meta,
        cells: c.cells.map((cell) => ({
            ...cell,
            initialContent: cell.type === "equation" ? null : c.getEditorContent(cell.id),
        })),
    })

    useEffect(() => () => {
        docCache.current[fileId] = snapshotDoc.current()
    }, [fileId, docCache])

    // Inactive documents pass mode=null so their document keydown listener detaches.
    useCellOperations({
        mode: isActive ? c.cellOpMode : null,
        navigateCell: c.navigateCell,
        extendSelect: c.cellMultiArrowSelect,
        onShiftRelease: c.onShiftRelease,
        selectAll: c.selectAllCells,
        copySelected: c.copyCells,
        cutSelected: c.cutCells,
        pasteSelected: c.pasteCells,
        delSelected: c.deleteCells,
    })

    // individual editor map, layered over the hook's registerEditor
    // -> Toolbar formatting can reach the active cell's Slate instance.
    const editors = useRef<Record<string, CustomEditor>>({})
    const register = useCallback((id: string, editor: CustomEditor) => {
        editors.current[id] = editor
        const cleanup = c.registerEditor(id, editor)
        return () => {
            delete editors.current[id]
            cleanup()
        }
    }, [c.registerEditor])

    const toggleFormat = useCallback((mark: Mark) => {
        const ed = editors.current[c.selectedId]
        if (!ed) return
        toggleMark(ed, mark)
        try {
            ReactEditor.focus(ed)
        } catch {
            /* not focusable */
        }
    }, [c.selectedId])

    const isFormatActive = useCallback((mark: Mark) => {
        const ed = editors.current[c.selectedId]
        return ed ? isMarkActive(ed, mark) : false
    }, [c.selectedId])

    const undo = useCallback(() => {
        const ed = editors.current[c.selectedId]
        if (ed) HistoryEditor.undo(ed)
    }, [c.selectedId])

    const redo = useCallback(() => {
        const ed = editors.current[c.selectedId]
        if (ed) HistoryEditor.redo(ed)
    }, [c.selectedId])

    const insertCell = useCallback((type: CellType) => {
        c.addCellWithType(c.selectedId, type)
    }, [c.addCellWithType, c.selectedId])

    const exportLatex = useCallback(() =>
        buildLatex(
            c.cells.map((cell) => ({
                id: cell.id,
                type: cell.type,
                equationContent: cell.equationContent,
                label: cell.label
            })),
            (id) => slateToLatex(c.getEditorContent(id)),
            meta,
        ),
        [c.cells, c.getEditorContent, meta],
    )

    const headingNumbers = useMemo(() => computeHeadingNumbers(c.cells), [c.cells])

    const selectedCell = useMemo(() => {
        const cell = c.cells.find((x) => x.id === c.selectedId)
        return cell 
            ? { id: cell.id, type: cell.type, equationContent: cell.equationContent ?? "" } 
            : null
    }, [c.cells, c.selectedId])

    // hold the current noteboookAPI's memory address
    const notebookAPI = useMemo<NotebookAPI>(() => ({
        fileId,
        cellCount: c.cells.length,
        selectedCell,
        toggleFormat,
        isFormatActive,
        insertCell,
        setEquationContent: c.setCellEquationContent,
        documentMeta: meta,
        updateDocumentMeta: updateMeta,
        exportLatex,
        undo,
        redo,
        addCell: c.addCell,
        copyCells: c.copyCells,
        cutCells: c.cutCells,
        pasteCells: c.pasteCells,
        duplicateCells: c.duplicateCells,
    }), [
        fileId,
        c.cells.length,
        selectedCell,
        toggleFormat,
        isFormatActive,
        insertCell,
        c.setCellEquationContent,
        meta,
        updateMeta,
        exportLatex,
        undo,
        redo,
        c.addCell,
        c.copyCells,
        c.cutCells,
        c.pasteCells,
        c.duplicateCells,
    ])

    useEffect(() => {
        if (isActive) onAPI(notebookAPI)
    }, [isActive, notebookAPI, onAPI])

    return (
        <div className="pb-12">
            {c.cells.map((cell) => (
                <CellView
                    id={cell.id}
                    key={cell.id}
                    type={cell.type}
                    label={cell.label}
                    headingNumber={headingNumbers.get(cell.id)}
                    registerEditor={register}
                    initialContent={cell.initialContent}
                    equationContent={cell.equationContent}
                    onDirty={markDirty}
                    isOpSelected={c.selectedCellIds.has(cell.id)}
                    autoFocus={c.selectedId === cell.id && c.cellOpMode !== "cellOperation"}
                    onSelect={() => {
                        c.selectCell(cell.id)
                        c.exitCellOperationMode()
                    }}
                    onEnterCellOpMode={(e) =>
                        ClickHandler(e, cell.id, c.cellMultiClickSelect, c.enterCellOperationMode)
                    }
                    onLabelChange={c.setEquationCellLabel}
                    onMoveUp={() => c.swapCells(cell.id, "up")}
                    onMoveDown={() => c.swapCells(cell.id, "down")}
                    onDelete={() => c.deleteCells(new Set([cell.id]))}
                    onDuplicate={() => c.duplicateCells(new Set([cell.id]))}
                />
            ))}
        </div>
    )
}
