// [BACKLOG] SpaceHandler — converts command-input to a math node on Space.
// Not currently used. Will be re-integrated when the math input system is built.

import { KeyHandler } from './KeyHandler'
import { parseCommandToLatex } from '@/lib/inline_utils_old/CommandParser'
import { commands, templateCommands } from '@/lib/inline_utils_old/CommandList.js'

export class SpaceHandler extends KeyHandler {
    constructor(editor, selection) {
        super(editor, selection)
    }

    handle() {
        if (!this.isAtStart()) return false

        const prev = this.getPrevious()
        if (!prev || !prev.isCommandInput) return false

        const commandText = this.getNodeText(prev.node)
        const latexSymbol = parseCommandToLatex(commandText, commands, templateCommands)

        this.removeNode(prev.path)
        this.insertMath(latexSymbol)

        return true
    }
}
