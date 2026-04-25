// KEYBINDS

/**
 * buildKey()
 * @param e: KeyboardEvent
 * @returns a string key for dispatch maps
 * 
 * ! Modifier order is fixed (Meta → Ctrl → Shift → Alt) !
 */

export function buildKey(e: KeyboardEvent): string {
    const modifiers: string[] = [
        e.metaKey && 'Meta',
        e.ctrlKey && 'Ctrl',
        e.shiftKey && 'Shift',
        e.altKey && 'Alt',
    ]

    return [...modifiers.filter(Boolean), e.key].join('+')
}
