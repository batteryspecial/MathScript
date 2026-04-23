'use client'
import Editor from '@/app/editor/editor'
import { FaTrash } from 'react-icons/fa'

/**
 * Cell — a single notebook cell with selection chrome and delete control.
 *
 * Manages two distinct states
 *   isSelected    - controlled by parent Notebook, stays true while toolbar
 *                   is in use, so the blue sidebar persists during button clicks
 *   editorFocused - controlled by the Editor, only true when the cursor is
 *                   active inside the text area
 */
export default function Cell({ id, isSelected, onSelect, onDelete, showDelete, initialContent, registerEditor }) {
    return (
        <div className="group flex relative" onClick={onSelect}>
            <div className={`w-2 me-4 ${isSelected ? 'bg-blue-500' : ''}`} />
            <div className="flex-1">
                <Editor
                    id={id}
                    onFocus={onSelect}
                    isSelected={isSelected}
                    registerEditor={registerEditor}
                    initialContent={initialContent}
                />
            </div>
            {showDelete && (
                <button
                    onClick={(e) => { e.stopPropagation(); onDelete() }}
                    className="absolute end-2.5 top-2 duration-150 opacity-0 group-hover:opacity-100 transition-all hover:text-red-400 text-sm cursor-pointer"
                    title="Delete cell"
                >
                    <FaTrash />
                </button>
            )}
        </div>
    )
}
