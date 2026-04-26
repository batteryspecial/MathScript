type Direction = 'up' | 'down'
type KeyHandler = (e: KeyboardEvent) => void

/**
 * arrowHandlers — key map for all arrow-key actions in cell operation mode.
 *
 * Plain arrows  → move selection to adjacent cell
 * Meta+arrows   → extend multi-cell selection
 */
export const ArrowHandlers = (navigateCell: (dir: Direction) => void, extendSelect: (dir: Direction) => void) : Record<string, KeyHandler> => ({
    'ArrowDown':       (e) => { e.preventDefault(); navigateCell('down') },
    'ArrowRight':      (e) => { e.preventDefault(); navigateCell('down') },
    'ArrowUp':         (e) => { e.preventDefault(); navigateCell('up') },
    'ArrowLeft':       (e) => { e.preventDefault(); navigateCell('up') },
    'Meta+ArrowDown':  (e) => { e.preventDefault(); extendSelect('down') },
    'Meta+ArrowRight': (e) => { e.preventDefault(); extendSelect('down') },
    'Meta+ArrowUp':    (e) => { e.preventDefault(); extendSelect('up') },
    'Meta+ArrowLeft':  (e) => { e.preventDefault(); extendSelect('up') },
})
