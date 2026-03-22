'use client'
import { withHistory } from 'slate-history'
import { createEditor, Range, Transforms } from 'slate'
import { useMemo, useCallback, useState, useEffect, useRef } from 'react'
import { Slate, Editable, withReact, ReactEditor, useSelected, useFocused } from 'slate-react'

import katex from 'katex'
import 'katex/dist/katex.min.css'

import { commands } from '@/lib/command/CommandList.js'
import { handleKeyPress } from '@/lib/keybinds/KeyDown.js'
import { filterCommands } from '@/lib/command/AutoComplete.js'
import { withCommandInput, getCommandInputContext, getCommandInputText } from '@/lib/command/CommandInline.js'

import CommandInput from '@/app/components/command/CommandInput.jsx'
//import CommandPalette from '@/app/components/command/CommandPalette.jsx'

import './canvas.css'

// A randomly generated ID on every browser reload (Next.js Hot Module Reload to enforce modifications to MathNodes)
const HMR_ID = Math.random() 

/**
 * MathElement - Renders inline LaTeX math symbols
 * This is a VOID inline element (no editable children)
 */
function MathElement({ attributes, element, children }) {
    const ref = useRef(null)
    const selected = useSelected()
    const focused = useFocused()

    useEffect(() => {
        if (ref.current) {
            katex.render(element.latex, ref.current, {
                throwOnError: false,
                displayMode: false,
            })
        }
    }, [element.latex])

    return (
        <span {...attributes} contentEditable={false} className={`relative inline-flex items-center rounded-md select-none align-middle ${ (selected && focused) ? 'ring-1 ring-blue-500' : '' }`}>
            {/* Visible LaTeX Content */}
            <span ref={ref} contentEditable={false} />

            {/* Void Anchor - invisible but required for Slate cursor */}
            <span style={{ position: 'absolute', opacity: 0, fontSize: 0 }}>
                {children}
            </span>
        </span>
    )
}

/**
 * BlockEditor - A single Slate editor instance.
 * 
 * Each Block gets its own BlockEditor. Content state lives here
 * inside Slate — NotebookPage only tracks block existence and order.
 * 
 * @props onFocus
 * Called when this editor receives focus (tells NotebookPage to select this block)
 */
export default function BlockEditor({ id, onFocus, isSelected, registerEditor, initialContent }) {
    const [commandPos, setCommandPos] = useState(null)
    const [activeCommandInputPath, setActiveCommandInputPath] = useState(null)
    const [filteredCommands, setFilteredCommands] = useState([])
    const [editorSelected, setEditorSelected] = useState(false)

    const editor = useMemo(() => {
        const e = withHistory(withCommandInput(withReact(createEditor())))
        
        // Extend to recognize math as inline void element
        const { isInline, isVoid } = e
        e.isInline = element => (element.type === 'math') ? true : isInline(element)
        e.isVoid = element => (element.type === 'math') ? true : isVoid(element)
        
        return e
    }, [HMR_ID])
    
    // This is the bridge that lets BlockHandler read our content.
    useEffect(() => {
        if (registerEditor && id) {
            const cleanup = registerEditor(id, editor)
            return cleanup
        }
    }, [registerEditor, id, editor])
    
    // Initial value with a command-input element already inserted
    const initialValue = useMemo(() => {
        if (initialContent) return initialContent
        return [{
            type: 'paragraph',
            
            children: [
                {
                    text: '',
                },
                { 
                    type: 'command-input', 
                    children: [{ text: '' }] 
                },
                {
                    text: ' ',
                }
            ],
        },]
    }, [])
    
    /**
     * Check if cursor is currently inside a command-input element
     * Updates autocomplete state based on cursor position
     */
    const checkIfInCommandInput = useCallback(() => {
        if (!isSelected) {
            return
        }
        const context = getCommandInputContext(editor)
        
        if (context.isInCommandInput) {
            setActiveCommandInputPath(context.path)
            setCommandPos(context.position)
            
            // Filter commands based on current input
            const inputText = getCommandInputText(context.node)
            const filtered = filterCommands(commands, inputText)
            setFilteredCommands(filtered)
        }
    }, [editor])

    // Slate's onChange fires whenever content or selection changes
    // We are moving into an inline element called the CommandInput
    const handleChange = useCallback(() => {
        checkIfInCommandInput()
    }, [checkIfInCommandInput])
    
    // Callback to show palette when user clicks the backslash
    const handleBackslashClick = useCallback((elementPath) => {
        // Move cursor to START of command-input's first text child
        const firstTextPath = [...elementPath, 0]
        
        Transforms.select(editor, {
            anchor: { path: firstTextPath, offset: 0 },
            focus: { path: firstTextPath, offset: 0 }
        })
        
        // Force a re-check to show palette
        setTimeout(() => { checkIfInCommandInput()}, 0)
    }, [editor, checkIfInCommandInput])
    
    const renderElement = useCallback(props => {
        if (props.element.type === 'math') {
            return <MathElement {...props} />
        }
        
        if (props.element.type === 'command-input') {
            // Get the path of this specific command-input element
            const elementPath = ReactEditor.findPath(editor, props.element)
            
            return (
                <CommandInput {...props} onBackslashClick={() => handleBackslashClick(elementPath)}/>
            )
        }
        
        return (<p {...props.attributes}>{props.children}</p>)
    }, [handleBackslashClick, editor])
    
    /**
     * Handle keyboard navigation and command parsing
     * - Arrow keys: Navigate in/out of command-input elements naturally
     * - Space key: Convert command-input to math symbol when pressed after component
     */
    const handleKeyDown = useCallback((event) => {
        const { selection } = editor
        
        // Only handle collapsed selections (cursor, not ranges)
        if (!selection || !Range.isCollapsed(selection)) return
        
        // just ONE LINE for all key handlers:
        if (handleKeyPress(event.key, editor, selection)) {
            event.preventDefault()
        }
    }, [editor])

    // INITIALIZES THE CURSOR IN THE EDITABLE DIV
    useEffect(() => {
        if (isSelected) {
            ReactEditor.focus(editor)
        }
    }, [])

    /**
     * The HTML section
     * - Fully black background, pre-rendered text
     * - Written in Slate.js, includes the command list UI
     */
    return (
        <div className={`ps-2 border ${editorSelected ? 'border-blue-400' : ''}`}>
            <Slate key={HMR_ID} editor={editor} initialValue={initialValue} onChange={handleChange}>
                <Editable
                    className="text-lg leading-relaxed outline-none"
                    onFocus={(e) => {
                        setEditorSelected(true),
                        onFocus()
                    }}
                    onBlur={(e) => {
                        setEditorSelected(false)
                    }}
                    renderElement={renderElement}
                    onKeyDown={handleKeyDown}
                    spellCheck={false}
                />
            </Slate>
        </div>
    )
}
