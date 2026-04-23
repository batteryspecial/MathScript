// [BACKLOG] BackspaceHandler — removes an empty command-input on Backspace.
// Not currently used. Will be re-integrated when the math input system is built.

import { KeyHandler } from './KeyHandler.js'

export class BackspaceHandler extends KeyHandler {
    constructor(editor, selection) {
        super(editor, selection)
    }

    handle() {
        const parent = this.getParent()
        if (!parent.isCommandInput) return false

        const commandText = this.getNodeText(parent.parentNode)
        if (commandText.trim() !== '') return false

        this.removeNode(parent.parentPath)
        return true
    }
}
