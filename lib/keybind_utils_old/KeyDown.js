// [BACKLOG] KeyDown — factory that maps keys to handler classes.
// Not currently used. Will be re-integrated when the math input system is built.

import { SpaceHandler } from './SpaceHandler.js'
import { BackspaceHandler } from './BackspaceHandler.js'
import { ArrowRightHandler, ArrowLeftHandler } from './ArrowHandler.js'

const handlerRegistry = {
    ' ':          SpaceHandler,
    'ArrowRight': ArrowRightHandler,
    'ArrowLeft':  ArrowLeftHandler,
    'Backspace':  BackspaceHandler,
}

export function handleKeyPress(key, editor, selection) {
    const HandlerClass = handlerRegistry[key]
    if (!HandlerClass) return false
    return new HandlerClass(editor, selection).handle()
}

export { KeyHandler } from './KeyHandler.js'
export { SpaceHandler } from './SpaceHandler.js'
export { ArrowRightHandler, ArrowLeftHandler } from './ArrowHandler.js'
export { BackspaceHandler } from './BackspaceHandler.js'
