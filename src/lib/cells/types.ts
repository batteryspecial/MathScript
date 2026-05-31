import type { Descendant } from 'slate'

export type CellType = 'text' | 'section' | 'subsection' | 'equation'

// A single notebook cell. Prose content lives inside its Editor instance;
// `initialContent` is only the seed Slate tree. Equation cells have no editor
// and store their source in `equationContent`.
export interface Cell {
  id: string
  type: CellType
  initialContent: Descendant[] | null
  equationContent?: string
}

// A whole-cell clipboard/duplication snapshot — preserves type + equation
// source, not just prose. `initialContent` is the serialized Slate tree at
// copy time (null for equation cells).
export interface CellSnapshot {
  type: CellType
  initialContent: Descendant[] | null
  equationContent?: string
}
