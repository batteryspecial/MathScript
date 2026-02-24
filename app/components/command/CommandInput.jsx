'use client'
import { useSelected, useFocused } from 'slate-react'

/**
 * CommandInput - A Discord-style inline command element
 * 
 * This is an INLINE, NON-VOID element in Slate.
 * - Inline: renders within text flow
 * - Non-void: children are editable through Slate's contentEditable
 * 
 * The "input box" appearance is pure CSS styling.
 * Users type directly into Slate's system - no separate input element.
 */
export default function CommandInput({ attributes, children, element, onBackslashClick }) {
    const selected = useSelected()
    const focused = useFocused()

    // Check if content is truly empty (no text or only ZWS)
    const isEmpty = !element.children[0]?.text || element.children[0].text === '\u200B'

    return (
        <span  {...attributes} className="inline-flex items-center transition-all">
            <span contentEditable={false} className="text-gray-400 rounded-l-md select-none cursor-pointer"
            onMouseDown={(e) => {
                e.preventDefault() // Prevent default selection behavior
                e.stopPropagation() // Stop Slate from handling this click
                onBackslashClick?.()
            }}>
                \
            </span>
            <span className={`${(selected && focused)
                ? (isEmpty) ? 'text-red-500' : ''
                : (isEmpty) ? 'text-red-200' : ''
            }`}>[</span>
                <span className="text-md px-1 min-w-2">
                    {children}
                </span>
            <span className={`${(selected && focused)
                ? (isEmpty) ? 'text-red-500' : ''
                : (isEmpty) ? 'text-red-200' : ''
            }`}>]</span>
        </span>
    )
}