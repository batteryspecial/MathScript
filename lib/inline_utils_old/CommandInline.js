// [BACKLOG] CommandInline — Slate plugin and utilities for the command-input element.
// Not currently used. Will be re-integrated when the math input system is built.

import { Editor, Node, Text } from 'slate'

/**
 * Slate plugin — marks command-input as an inline (non-void) element.
 */
export function withCommandInput(editor) {
    const { isInline } = editor
    editor.isInline = element =>
        element.type === 'command-input' ? true : isInline(element)
    return editor
}

/**
 * Check if the cursor is currently inside a command-input element.
 * Returns context info for autocomplete positioning.
 */
export function getCommandInputContext(editor) {
    const { selection } = editor
    if (!selection) return { isInCommandInput: false }

    try {
        const [nodeEntry] = Editor.nodes(editor, {
            match: n => !Text.isText(n) && n.type === 'command-input',
        })

        if (!nodeEntry) return { isInCommandInput: false }

        const [node, path] = nodeEntry
        const domNode = document.querySelector(`[data-slate-node]`) // placeholder
        const position = calculatePalettePosition(path)

        return { isInCommandInput: true, node, path, position }
    } catch {
        return { isInCommandInput: false }
    }
}

/**
 * Get the text content of a command-input node.
 */
export function getCommandInputText(node) {
    return Node.string(node)
}

/**
 * Calculate where to render the autocomplete palette.
 * Shows above the element if it would overflow the viewport bottom.
 */
export function calculatePalettePosition(elementPath) {
    try {
        const domSelection = window.getSelection()
        if (!domSelection?.rangeCount) return null

        const range = domSelection.getRangeAt(0)
        const rect = range.getBoundingClientRect()
        const paletteHeight = 200
        const viewportHeight = window.innerHeight

        const showAbove = rect.bottom + paletteHeight > viewportHeight

        return {
            top: showAbove
                ? rect.top + window.scrollY - paletteHeight
                : rect.bottom + window.scrollY + 4,
            left: rect.left + window.scrollX,
        }
    } catch {
        return null
    }
}
