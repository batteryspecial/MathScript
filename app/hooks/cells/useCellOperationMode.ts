'use client'

import { useEffect } from "react"
import { buildKey } from "@/lib/keybind-utils/KeyHandler"
import { ArrowHandlers } from "@/lib/keybind-utils/ArrowHandlers"
import { ClipboardHandlers } from "@/lib/keybind-utils/ClipboardHandlers"

interface CellOperationProps {
    mode: 'cellWrite' | 'cellOperation' | null
    navigateCell: (direction: 'up' | 'down') => void
    extendSelect: (direction: 'up' | 'down') => void
    onShiftRelease: () => void
    selectAll: () => void
    copySelected: () => void
    cutSelected: () => void
    pasteSelected: () => void
    delSelected: () => void
}

export function useCellOperations({ 
    mode, navigateCell, extendSelect, onShiftRelease, 
    selectAll, copySelected, cutSelected, pasteSelected, delSelected 
}: CellOperationProps) {
    useEffect(() => {
        if (mode !== 'cellOperation') return

        const handlers = {
            ...ArrowHandlers(navigateCell, extendSelect),
            ...ClipboardHandlers(selectAll, copySelected, cutSelected, pasteSelected, delSelected)
        }

        const onKeyDown = (e: KeyboardEvent) => {
            handlers[buildKey(e)]?.(e)
            //console.log(handlers[buildKey(e)])
        }
        const onKeyRelease = (e: KeyboardEvent) => {
            if (e.key === 'Shift') onShiftRelease()
        }

        document.addEventListener('keydown', onKeyDown)
        document.addEventListener('keyup', onKeyRelease)

        return () => {
            document.removeEventListener('keydown', onKeyDown)
            document.removeEventListener('keyup', onKeyRelease)
        }
    }, [mode, navigateCell, extendSelect, onShiftRelease, selectAll, copySelected, cutSelected, pasteSelected, delSelected])
}