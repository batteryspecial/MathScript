// [BACKLOG] KeyHandler — base class for keyboard handlers.
// Not currently used. Will be re-integrated when the math input system is built.

import { Editor, Node, Transforms, Text } from 'slate'

export class KeyHandler {
    constructor(editor, selection) {
        this.editor = editor
        this.selection = selection
        this.anchor = selection.anchor

        const nodeEntry = Editor.node(editor, this.anchor.path)
        this.node = nodeEntry[0]
        this.path = nodeEntry[1]
    }

    getParent() {
        try {
            const parentPath = this.path.slice(0, -1)
            const [parentNode] = Editor.node(this.editor, parentPath)
            return {
                parentNode,
                parentPath,
                isCommandInput: parentNode.type === 'command-input',
            }
        } catch {
            return { parentNode: null, parentPath: null, isCommandInput: false }
        }
    }

    getPrevious() {
        try {
            const prev = Editor.previous(this.editor, { at: this.path })
            if (!prev) return null
            const [prevNode, prevPath] = prev
            return {
                node: prevNode,
                path: prevPath,
                isCommandInput: prevNode.type === 'command-input',
                isMath: prevNode.type === 'math',
            }
        } catch {
            return null
        }
    }

    getNext() {
        try {
            const next = Editor.next(this.editor, { at: this.path })
            if (!next) return null
            const [nextNode, nextPath] = next
            return {
                node: nextNode,
                path: nextPath,
                isCommandInput: nextNode.type === 'command-input',
                isMath: nextNode.type === 'math',
            }
        } catch {
            return null
        }
    }

    isAtStart() {
        return this.anchor.offset === 0
    }

    isAtEnd() {
        const text = Text.isText(this.node) ? this.node.text : ''
        return this.anchor.offset === text.length
    }

    getNodeText(node) {
        return Node.string(node)
    }

    removeNode(path) {
        Transforms.removeNodes(this.editor, { at: path })
    }

    insertMath(latex) {
        Transforms.insertNodes(this.editor, { type: 'math', latex, children: [{ text: '' }] })
    }

    moveTo(point) {
        Transforms.select(this.editor, point)
    }

    moveAfter(path) {
        try {
            const after = Editor.after(this.editor, path)
            if (after) { Transforms.select(this.editor, after); return true }
            return false
        } catch {
            return false
        }
    }

    moveBefore(path) {
        try {
            const before = Editor.before(this.editor, path)
            if (before) { Transforms.select(this.editor, before); return true }
            return false
        } catch {
            return false
        }
    }

    moveToCommandInputStart(path) {
        const firstTextPath = [...path, 0]
        Transforms.select(this.editor, { anchor: { path: firstTextPath, offset: 0 }, focus: { path: firstTextPath, offset: 0 } })
    }

    moveToCommandInputEnd(path) {
        try {
            const [node] = Editor.node(this.editor, path)
            const text = Node.string(node)
            const firstTextPath = [...path, 0]
            Transforms.select(this.editor, { anchor: { path: firstTextPath, offset: text.length }, focus: { path: firstTextPath, offset: text.length } })
        } catch {}
    }

    handle() {
        return false
    }
}
