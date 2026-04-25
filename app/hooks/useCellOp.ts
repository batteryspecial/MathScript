'use client'
import { useEffect } from "react"
import { buildKey } from "@/lib/keybind-utils/KeyHandler"

interface useCellOperationProps {
    mode: 'cellWrite' | 'cellOperation',
    extendCellOperationSelect: (direction: 'up' | 'down') => void
}

export function useCellOperation({ mode, extendCellOperationSelect } : useCellOperationProps) {
    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            // console.log('keydown', mode, buildKey(e))
            if (mode !== 'cellOperation') return
            const keyInstructions = buildKey(e)
            const handlers: Record<string, (e: KeyboardEvent) => void> = {
                'Meta+ArrowDown' : (e) => { e.preventDefault(); extendCellOperationSelect('down') },
                'Meta+ArrowRight' : (e) => { e.preventDefault(); extendCellOperationSelect('down') },
                'Meta+ArrowUp' : (e) => { e.preventDefault(); extendCellOperationSelect('up') },
                'Meta+ArrowLeft' : (e) => { e.preventDefault(); extendCellOperationSelect('up') },
            }

            handlers[keyInstructions]?.(e) // EXECUTE
        }

        document.addEventListener('keydown', onKeyDown)
        return (() => document.removeEventListener('keydown', onKeyDown))
    }, [mode, extendCellOperationSelect])
}
