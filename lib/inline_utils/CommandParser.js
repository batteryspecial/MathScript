// [BACKLOG] CommandParser — recursive LaTeX converter.
// Turns natural language like "forall x in RR" into "\forall x \in \mathbb{R}".
// Not currently used. Will be re-integrated when the math input system is built.

/**
 * Main entry point.
 * @param {string} text - The raw command text (e.g. "forall x in RR")
 * @param {Array} commands - Command registry from CommandList
 * @param {Array} templateCommands - Template registry from CommandList
 * @returns {string} - LaTeX string
 */
export function parseCommandToLatex(text, commands, templateCommands) {
    return parseRecursive(text.trim(), commands, templateCommands)
}

function parseRecursive(text, cmds, templates) {
    let result = ''
    let i = 0

    while (i < text.length) {
        // Try template match first (greedy)
        let templateMatched = false
        for (const tmpl of templates) {
            const match = matchTemplate(text, i, tmpl.pattern)
            if (match) {
                const args = match.args.map(a => parseRecursive(a, cmds, templates))
                let latex = tmpl.latex
                args.forEach((arg, idx) => { latex = latex.replaceAll(`{${idx}}`, `{${arg}}`) })
                result += latex
                i += match.length
                templateMatched = true
                break
            }
        }
        if (templateMatched) continue

        // Try command match
        let commandMatched = false
        for (const cmd of cmds) {
            for (const alias of cmd.aliases) {
                if (text.startsWith(alias, i)) {
                    const after = text[i + alias.length]
                    const isWordBoundary = !after || /[\s,.()\[\]{}]/.test(after)
                    if (isWordBoundary) {
                        result += cmd.latex
                        i += alias.length
                        // Add space after comma for LaTeX readability
                        if (after === ',') { result += ',\\,'; i++ }
                        commandMatched = true
                        break
                    }
                }
            }
            if (commandMatched) break
        }
        if (commandMatched) continue

        // Literal character
        result += text[i]
        i++
    }

    return result
}

/**
 * Match a template pattern at position i in text.
 * {} in the pattern matches a parenthesized group or single token.
 * Returns { args: string[], length: number } or null.
 */
function matchTemplate(text, i, pattern) {
    const parts = pattern.split('{}')
    const args = []
    let pos = i

    for (let p = 0; p < parts.length; p++) {
        const part = parts[p]
        if (!text.startsWith(part, pos)) return null
        pos += part.length

        if (p < parts.length - 1) {
            // Consume optional whitespace
            while (pos < text.length && text[pos] === ' ') pos++

            if (text[pos] === '(') {
                // Collect until matching closing paren
                let depth = 0
                let start = pos + 1
                let end = start
                while (end < text.length) {
                    if (text[end] === '(') depth++
                    else if (text[end] === ')') {
                        if (depth === 0) break
                        depth--
                    }
                    end++
                }
                args.push(text.slice(start, end))
                pos = end + 1
            } else {
                // Single token (up to next space or end)
                let start = pos
                while (pos < text.length && text[pos] !== ' ') pos++
                args.push(text.slice(start, pos))
            }

            // Consume trailing whitespace
            while (pos < text.length && text[pos] === ' ') pos++
        }
    }

    return { args, length: pos - i }
}
