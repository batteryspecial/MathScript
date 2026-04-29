'use client'
import { useCells } from '@/app/hooks/cells/useCellOperations'
import { UseCellClipboard } from '../hooks/cells/useCellClipboard'
import { useCellOperations } from '@/app/hooks/cells/useCellOperationMode'

import Cell from '@/app/components/features/Cell'
import Navbar from '@/app/components/layout/Navbar'
import Filebar from '@/app/components/layout/Filebar'
import WideButton from '@/app/components/ui/WideButton'

import { ClickHandler } from '@/lib/keybind-utils/ClickHandler'

export default function Notebook() {
    const {
        cells, cellOpMode,
        registerEditor, getEditorContent, isEditorEmpty,
        selectCell, selectedId, selectedCellIds,
        enterCellOperationMode, exitCellOperationMode,
        navigateCell, cellMultiArrowSelect, onShiftRelease, cellMultiClickSelect,
        addCell, deleteCell, copyCell, cutCell, pasteCell,
        selectAllCells, pasteMultiCells, deleteMultiCells, deleteSelectedCells,
    } = useCells()

    const {
        copySelectedCells, pasteSelectedCells, cutSelectedCells
    } = UseCellClipboard({ cells, selectedId, selectedCellIds, getEditorContent, isEditorEmpty, pasteMultipleCells: pasteMultiCells, deleteMultipleCells: deleteMultiCells })

    useCellOperations({
        mode: cellOpMode, navigateCell, extendSelect: cellMultiArrowSelect, onShiftRelease,
        selectAll: selectAllCells, copySelected: copySelectedCells, cutSelected: cutSelectedCells, pasteSelected: pasteSelectedCells, delSelected: deleteSelectedCells
    })

    return (
        <>
            <Filebar />
            <Navbar
                onAdd={() => addCell()}
                onCut={cutSelectedCells}
                onCopy={copySelectedCells}
                onPaste={pasteSelectedCells}
            />
            <div className="max-w-full px-2">
                <div className="space-y-2">
                    {cells.map(cell => (
                        <Cell
                            id={cell.id}    
                            key={cell.id}
                            
                            isSelected={selectedId === cell.id}
                            isOpSelected={selectedCellIds.has(cell.id)}
                            isCellOpMode={cellOpMode === 'cellOperation'}
                            
                            onEnterCellOpMode={(e) => ClickHandler(e, cell.id, cellMultiClickSelect, enterCellOperationMode)}
                            onSelect={() => {selectCell(cell.id); exitCellOperationMode();}}
                            showDelete={cells.length > 1}
                            onDelete={() => deleteCell(cell.id)}
                            
                            registerEditor={registerEditor}
                            initialContent={cell.initialContent}
                        />
                    ))}
                </div>
                <WideButton
                    fcn={addCell}
                    textColor={'text-gray-400'}
                    borderStyle={'border-dashed'}
                    borderColor={'border-gray-300'}
                    hoverColor={'blue-300'}
                    text={'+ Add Cell'}
                />
            </div>
        </>
    )
}
