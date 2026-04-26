'use client'
import { useEffect } from 'react'
import { buildKey } from '@/lib/keybind-utils/KeyHandler'
import { ArrowHandlers } from '@/lib/keybind-utils/ArrowHandlers'

interface UseMultiCellSelectProps {
    mode: 'cellWrite' | 'cellOperation' | null
    navigateCell: (direction: 'up' | 'down') => void
    extendCellOperationSelect: (direction: 'up' | 'down') => void
}

export function useMultiCellSelect({ mode, navigateCell, extendCellOperationSelect }: UseMultiCellSelectProps) {
    useEffect(() => {
        const handlers = {
            ...ArrowHandlers(navigateCell, extendCellOperationSelect),
        }

        const onKeyDown = (e: KeyboardEvent) => {
            if (mode !== 'cellOperation') return
            handlers[buildKey(e)]?.(e)
        }

        document.addEventListener('keydown', onKeyDown)
        return () => document.removeEventListener('keydown', onKeyDown)
    }, [mode, navigateCell, extendCellOperationSelect])
}
