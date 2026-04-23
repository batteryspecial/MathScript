// [BACKLOG] CommandPalette — autocomplete dropdown for the \[command] input.
// Not currently used. Will be re-integrated when the math input system is built.

'use client'
import { commands } from '@/lib/inline_utils_old/CommandList.js'
import { RenderSymbol } from '@/lib/inline_utils_old/CommandList.js'
import { getBoldedAliasParts } from '@/lib/inline_utils_old/AutoComplete.js'

export default function CommandPalette({ filteredCommands, position, typedText }) {
    if (!filteredCommands?.length || !position) return null

    return (
        <div
            className="absolute z-50 bg-white border border-gray-200 rounded shadow-lg py-1 min-w-48"
            style={{ top: position.top, left: position.left }}
        >
            {filteredCommands.map((cmd, i) => {
                const [before, match, after] = getBoldedAliasParts(cmd.alias, typedText)
                return (
                    <div key={i} className="flex items-center gap-3 px-3 py-1 hover:bg-gray-50 cursor-pointer text-sm">
                        <span className="w-6 text-center font-math">
                            <RenderSymbol latex={cmd.latex} />
                        </span>
                        <span className="text-gray-700">
                            {before}<strong>{match}</strong>{after}
                        </span>
                    </div>
                )
            })}
        </div>
    )
}
