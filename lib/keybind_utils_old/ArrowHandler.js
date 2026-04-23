// [BACKLOG] ArrowHandler — navigates cursor in/out of command-input elements.
// Not currently used. Will be re-integrated when the math input system is built.

import { KeyHandler } from './KeyHandler.js'

export class ArrowRightHandler extends KeyHandler {
    constructor(editor, selection) {
        super(editor, selection)
    }

    handle() {
        const parent = this.getParent()

        if (parent.isCommandInput && this.isAtEnd()) {
            return this.moveAfter(parent.parentPath)
        }

        const next = this.getNext()
        if (this.isAtEnd() && next?.isCommandInput) {
            this.moveToCommandInputStart(next.path)
            return true
        }

        return false
    }
}

export class ArrowLeftHandler extends KeyHandler {
    constructor(editor, selection) {
        super(editor, selection)
    }

    handle() {
        const parent = this.getParent()

        if (parent.isCommandInput && this.isAtStart()) {
            return this.moveBefore(parent.parentPath)
        }

        if (this.isAtStart()) {
            const prev = this.getPrevious()
            if (prev?.isCommandInput) {
                this.moveToCommandInputEnd(prev.path)
                return true
            }
        }

        return false
    }
}
