'use client'
import { useCells } from '@/app/hooks/useCells'
import { useMultiCellSelect } from '@/app/hooks/useMultiCellSelect'

import Cell from '@/app/components/features/Cell'
import Navbar from '@/app/components/layout/Navbar'
import Filebar from '@/app/components/layout/Filebar'
import WideButton from '@/app/components/ui/WideButton'

import { ClickHandler } from '@/lib/keybind-utils/ClickHandler'
import { exit } from 'node:process'

export default function Notebook() {
    const {
        cells,
        selectedId,
        cellOpMode,
        selectedCellIds,
        selectCell,
        enterCellOperationMode,
        exitCellOperationMode,
        cellMultiArrowSelect,
        onShiftRelease,
        cellMultiClickSelect,
        navigateCell,
        addCell,
        deleteCell,
        copyCell,
        cutCell,
        pasteCell,
        registerEditor,
    } = useCells()

    useMultiCellSelect({ mode: cellOpMode, navigateCell: navigateCell, extendCellOperationSelect: cellMultiArrowSelect, onShiftRelease: onShiftRelease })

    return (
        <>
            <Filebar />
            <Navbar
                onAdd={() => addCell()}
                onCut={cutCell}
                onCopy={copyCell}
                onPaste={pasteCell}
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
