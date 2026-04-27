'use client'
import { useEffect } from 'react'
import { buildKey } from '@/lib/keybind-utils/KeyHandler'
import { ArrowHandlers } from '@/lib/keybind-utils/ArrowHandlers'

interface UseMultiCellSelectProps {
    mode: 'cellWrite' | 'cellOperation' | null
    navigateCell: (direction: 'up' | 'down') => void
    extendCellOperationSelect: (direction: 'up' | 'down') => void
    onShiftRelease: () => void
}

export function useMultiCellSelect({ mode, navigateCell, extendCellOperationSelect, onShiftRelease }: UseMultiCellSelectProps) {
    useEffect(() => {
        const handlers = {
            ...ArrowHandlers(navigateCell, extendCellOperationSelect),
        }
        if (mode !== 'cellOperation') return
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
            document.removeEventListener('keydown', onKeyDown),
            document.removeEventListener('keyup', onKeyRelease)
        }
    }, [mode, navigateCell, extendCellOperationSelect, onShiftRelease])
}
