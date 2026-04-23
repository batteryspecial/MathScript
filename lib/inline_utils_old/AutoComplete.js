// [BACKLOG] AutoComplete — filters commands by typed text for the command palette.
// Not currently used. Will be re-integrated when the math input system is built.

/**
 * Filter commands by prefix match on aliases.
 * Returns one result per command (deduped by symbol), prioritizing exact matches.
 *
 * @param {Array} commands - Full command list from CommandList
 * @param {string} typedText - What the user has typed so far
 * @returns {Array} - Filtered list of { name, alias, latex }
 */
export function filterCommands(commands, typedText) {
    if (!typedText) return []

    const seen = new Set()
    const results = []

    for (const cmd of commands) {
        // Find the best alias match
        let bestAlias = null
        for (const alias of cmd.aliases) {
            if (alias.startsWith(typedText)) {
                if (!bestAlias || alias === typedText || alias.length < bestAlias.length) {
                    bestAlias = alias
                }
            }
        }

        if (bestAlias && !seen.has(cmd.latex)) {
            seen.add(cmd.latex)
            results.push({ name: cmd.name, alias: bestAlias, latex: cmd.latex })
        }
    }

    // Exact matches first
    results.sort((a, b) => {
        if (a.alias === typedText) return -1
        if (b.alias === typedText) return 1
        return a.alias.length - b.alias.length
    })

    return results
}

/**
 * Split an alias into [before, match, after] parts for bold highlighting.
 * e.g. alias="forall", typedText="for" → ["", "for", "all"]
 */
export function getBoldedAliasParts(alias, typedText) {
    const idx = alias.indexOf(typedText)
    if (idx === -1) return [alias, '', '']
    return [
        alias.slice(0, idx),
        alias.slice(idx, idx + typedText.length),
        alias.slice(idx + typedText.length),
    ]
}
