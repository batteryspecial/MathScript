"use client"
import { useCallback, useEffect, useMemo, useRef, type RefObject } from "react"
import { ReactEditor } from "slate-react"
import { HistoryEditor } from "slate-history"

import { useCells, type CellType } from "@/hooks/cells/useCells"
import { useCellOperations } from "@/hooks/cells/useCellOperations"
import { useDocumentMeta } from "@/hooks/document/useDocumentMeta"

import CellView from "@/components/cell/CellView"
import { ClickHandler } from "@/lib/keybinds/ClickHandler"
import { isMarkActive, toggleMark, type Mark } from "@/lib/slate/marks"
import { slateToLatex } from "@/lib/slate/serialize"
import { buildLatex } from "@/lib/latex/export"
import type { CustomEditor } from "@/lib/slate/types"
import type { CellSnapshot } from "@/lib/cells/types"
import type { NotebookAPI } from "@/lib/notebook/NotebookAPI"

interface NotebookViewProps {
    fileId: string
    isActive: boolean
    clipboard: RefObject<CellSnapshot[] | null>
    onAPI: (api: NotebookAPI) => void
}

export default function NotebookView({ fileId, isActive, clipboard, onAPI }: NotebookViewProps) {
    const c = useCells(clipboard)
    const { meta, updateMeta } = useDocumentMeta(fileId)

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
                    registerEditor={register}
                    initialContent={cell.initialContent}
                    equationContent={cell.equationContent}
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
