"use client"
import { useCallback, useEffect, useMemo, useRef, type RefObject } from "react"
import { ReactEditor } from "slate-react"

import { useCells, type CellType } from "@/app/hooks/cells/useOperations"
import { useCellOperations } from "@/app/hooks/cells/useOperationMode"

import Cell from "@/app/components/cell/StandardCell"
import { ClickHandler } from "@/lib/keybinds/ClickHandler"
import { isMarkActive, toggleMark, type Mark } from "@/lib/slate/marks"
import { slateToLatex } from "@/lib/slate/serialize"
import { buildLatex } from "@/lib/latex/export"
import type { CustomEditor } from "@/lib/slate/types"
import type { CellSnapshot } from "@/lib/cells/types"
import type { NotebookAPI } from "./NotebookAPI"

interface NotebookProps {
    fileId: string
    isActive: boolean
    clipboard: RefObject<CellSnapshot[] | null>
    onAPI: (api: NotebookAPI) => void
}

export default function Notebook({ fileId, isActive, clipboard, onAPI }: NotebookProps) {
    const c = useCells(clipboard)

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

    const insertCell = useCallback((type: CellType) => {
        c.addCellWithType(c.selectedId, type)
    }, [c.addCellWithType, c.selectedId])

    const exportLatex = useCallback(() =>
        buildLatex(
            c.cells.map((cell) => ({ 
                id: cell.id, 
                type: cell.type, 
                equationContent: cell.equationContent }
            )),
            (id) => slateToLatex(c.getEditorContent(id)),
        ),
        [c.cells, c.getEditorContent],
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
        exportLatex,
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
        exportLatex,
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
                <Cell
                    id={cell.id}
                    key={cell.id}
                    type={cell.type}
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
                    onMoveUp={() => c.swapCells(cell.id, "up")}
                    onMoveDown={() => c.swapCells(cell.id, "down")}
                    onDelete={() => c.deleteCells(new Set([cell.id]))}
                    onDuplicate={() => c.duplicateCells(new Set([cell.id]))}
                />
            ))}
        </div>
    )
}
