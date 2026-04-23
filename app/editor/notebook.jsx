'use client'
import { useCells } from '@/app/hooks/useCells'

import Cell from '@/app/components/features/Cell'
import Navbar from '@/app/components/layout/Navbar'
import Filebar from '@/app/components/layout/Filebar'

import WideButton from '@/app/components/ui/WideButton'

export default function Notebook() {
    const {
        cells,
        selectedId,
        selectCell,
        addCell,
        deleteCell,
        copyCell,
        cutCell,
        pasteCell,
        registerEditor,
    } = useCells()

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
                            key={cell.id}
                            id={cell.id}
                            isSelected={selectedId === cell.id}
                            onSelect={() => selectCell(cell.id)}
                            onDelete={() => deleteCell(cell.id)}
                            showDelete={cells.length > 1}
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
