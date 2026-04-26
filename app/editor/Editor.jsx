'use client'
import { createEditor } from 'slate'
import { withHistory } from 'slate-history'
import { useMemo, useEffect, useState } from 'react'
import { Slate, Editable, withReact, ReactEditor } from 'slate-react'

import './editor.css'

// Forces Slate to remount on Next.js hot reload
const HMR_ID = Math.random()

export default function Editor({ id, onFocus, isSelected, isOpSelected, registerEditor, initialContent }) {
    const [editorFocused, setEditorFocused] = useState(false)

    const editor = useMemo(() => withHistory(withReact(createEditor())), [HMR_ID])

    // Each instance needs its own object
    const initialValue = useMemo(() => initialContent ?? [
        { 
            type: 'paragraph', 
            children: [{ text: '' }],
        }
    ], [])

    // Register with the parent so it can read content for clipboard ops
    useEffect(() => {
        if (registerEditor && id) 
            return registerEditor(id, editor)
    }, [registerEditor, id, editor])

    // Focus on mount if this cell is selected
    useEffect(() => {
        if (isSelected) 
            ReactEditor.focus(editor)
    }, [])

    return (
        <div className={`ps-2 border transition-colors inset-shadow-2xs duration-150 ${editorFocused ||isOpSelected ? 'border-blue-400' : 'border-slate-200'}`}>
            <Slate key={HMR_ID} editor={editor} initialValue={initialValue}>
                <Editable className="text-lg leading-relaxed outline-none"
                    onFocus={() => { setEditorFocused(true); onFocus() }}
                    onBlur={() => setEditorFocused(false)}
                    spellCheck={false}
                />
            </Slate>
        </div>
    )
}
