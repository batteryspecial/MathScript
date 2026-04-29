type Handler = (e: KeyboardEvent) => void

export const ClipboardHandlers = (
    selectAll: () => void,
    copy: () => void,
    cut: () => void,
    paste: () => void,
    del: () => void,
): Record<string, Handler> => ({
    'Meta+a': (e) => { e.preventDefault(); selectAll() },
    'Meta+c': (e) => { e.preventDefault(); copy() },
    'Meta+v': (e) => { e.preventDefault(); paste() },
    'Meta+x': (e) => { e.preventDefault(); cut() },
    'Backspace': (e) => { e.preventDefault(); del() },
})
