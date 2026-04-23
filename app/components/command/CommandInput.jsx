// [BACKLOG] CommandInput — Discord-style inline \[command] element for math input.
// Not currently used. Will be re-integrated when the math input system is built.

'use client'
import { useSelected, useFocused } from 'slate-react'

export default function CommandInput({ attributes, children, element, onBackslashClick }) {
    const selected = useSelected()
    const focused = useFocused()

    const isEmpty = !element.children?.[0]?.text?.trim()
    const showRedBorder = isEmpty && (selected || focused)

    return (
        <span
            {...attributes}
            className={`
                inline-flex items-center rounded px-0.5 font-mono text-sm
                border transition-colors
                ${showRedBorder ? 'border-red-400' : 'border-transparent'}
            `}
        >
            <span
                contentEditable={false}
                className="select-none text-gray-400 cursor-pointer"
                onClick={onBackslashClick}
            >
                \[
            </span>
            {children}
            <span contentEditable={false} className="select-none text-gray-400">
                ]
            </span>
        </span>
    )
}
