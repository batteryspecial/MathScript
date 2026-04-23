// [BACKLOG] CommandList — registry of math commands with aliases and LaTeX symbols.
// Not currently used. Will be re-integrated when the math input system is built.

import katex from 'katex'

export const commands = [
    { name: 'forall',   aliases: ['forall', 'fa'],       latex: '\\forall' },
    { name: 'exists',   aliases: ['exists', 'ex'],       latex: '\\exists' },
    { name: 'and',      aliases: ['and'],                latex: '\\land' },
    { name: 'or',       aliases: ['or'],                 latex: '\\lor' },
    { name: 'not',      aliases: ['not'],                latex: '\\lnot' },
    { name: 'implies',  aliases: ['implies', 'imp'],     latex: '\\Rightarrow' },
    { name: 'iff',      aliases: ['iff'],                latex: '\\Leftrightarrow' },
    { name: 'in',       aliases: ['in'],                 latex: '\\in' },
    { name: 'notin',    aliases: ['notin', 'nin'],       latex: '\\notin' },
    { name: 'subset',   aliases: ['subset', 'sub'],      latex: '\\subset' },
    { name: 'subseteq', aliases: ['subseteq', 'sube'],   latex: '\\subseteq' },
    { name: 'cup',      aliases: ['cup', 'union'],       latex: '\\cup' },
    { name: 'cap',      aliases: ['cap', 'inter'],       latex: '\\cap' },
    { name: 'setminus', aliases: ['setminus', 'sm'],     latex: '\\setminus' },
    { name: 'emptyset', aliases: ['emptyset', 'empty'],  latex: '\\emptyset' },
    { name: 'equiv',    aliases: ['equiv'],              latex: '\\equiv' },
    { name: 'approx',   aliases: ['approx'],             latex: '\\approx' },
    { name: 'neq',      aliases: ['neq', 'ne'],          latex: '\\neq' },
    { name: 'leq',      aliases: ['leq', 'le'],          latex: '\\leq' },
    { name: 'geq',      aliases: ['geq', 'ge'],          latex: '\\geq' },
    { name: 'll',       aliases: ['ll'],                 latex: '\\ll' },
    { name: 'gg',       aliases: ['gg'],                 latex: '\\gg' },
    { name: 'infty',    aliases: ['infty', 'inf'],       latex: '\\infty' },
    { name: 'sum',      aliases: ['sum'],                latex: '\\sum' },
    { name: 'prod',     aliases: ['prod'],               latex: '\\prod' },
    { name: 'int',      aliases: ['int'],                latex: '\\int' },
    { name: 'partial',  aliases: ['partial', 'pd'],      latex: '\\partial' },
    { name: 'nabla',    aliases: ['nabla', 'del'],       latex: '\\nabla' },
    { name: 'cdot',     aliases: ['cdot'],               latex: '\\cdot' },
    { name: 'times',    aliases: ['times'],              latex: '\\times' },
    { name: 'oplus',    aliases: ['oplus'],              latex: '\\oplus' },
    { name: 'NN',       aliases: ['NN'],                 latex: '\\mathbb{N}' },
    { name: 'ZZ',       aliases: ['ZZ'],                 latex: '\\mathbb{Z}' },
    { name: 'QQ',       aliases: ['QQ'],                 latex: '\\mathbb{Q}' },
    { name: 'RR',       aliases: ['RR'],                 latex: '\\mathbb{R}' },
    { name: 'CC',       aliases: ['CC'],                 latex: '\\mathbb{C}' },
    { name: 'alpha',    aliases: ['alpha'],              latex: '\\alpha' },
    { name: 'beta',     aliases: ['beta'],               latex: '\\beta' },
    { name: 'gamma',    aliases: ['gamma'],              latex: '\\gamma' },
    { name: 'delta',    aliases: ['delta'],              latex: '\\delta' },
    { name: 'epsilon',  aliases: ['epsilon', 'eps'],     latex: '\\epsilon' },
    { name: 'lambda',   aliases: ['lambda', 'lam'],      latex: '\\lambda' },
    { name: 'mu',       aliases: ['mu'],                 latex: '\\mu' },
    { name: 'pi',       aliases: ['pi'],                 latex: '\\pi' },
    { name: 'sigma',    aliases: ['sigma'],              latex: '\\sigma' },
    { name: 'theta',    aliases: ['theta'],              latex: '\\theta' },
    { name: 'phi',      aliases: ['phi'],                latex: '\\phi' },
    { name: 'psi',      aliases: ['psi'],                latex: '\\psi' },
    { name: 'omega',    aliases: ['omega'],              latex: '\\omega' },
]

export const templateCommands = [
    { pattern: '{}/{}',          latex: '\\frac{0}{1}' },
    { pattern: 'if {} then {}',  latex: '{0} \\rightarrow {1}' },
    { pattern: 'mod {}',         latex: '\\pmod{0}' },
    { pattern: 'sqrt {}',        latex: '\\sqrt{0}' },
    { pattern: 'hat {}',         latex: '\\hat{0}' },
    { pattern: 'bar {}',         latex: '\\bar{0}' },
    { pattern: 'vec {}',         latex: '\\vec{0}' },
]

/**
 * RenderSymbol - renders a LaTeX string inline via KaTeX
 */
export function RenderSymbol({ latex }) {
    const html = (() => {
        try {
            return katex.renderToString(latex, { throwOnError: false, displayMode: false })
        } catch {
            return latex
        }
    })()
    return <span dangerouslySetInnerHTML={{ __html: html }} />
}
