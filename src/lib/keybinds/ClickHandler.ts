// THIS IS NOT A KEYHANDLER
export function ClickHandler(e: React.MouseEvent, cellId: string, cellClickSelect: (nextId: string) => void, enterCellOperationMode: (id: string) => void) {
    if (e.ctrlKey || e.metaKey) {
        cellClickSelect(cellId)
    } else {
        enterCellOperationMode(cellId)
    }
}
