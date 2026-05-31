import type { Descendant } from 'slate'
import type { Cell, CellSnapshot, CellType } from './types'

// Pure list transforms over a cell array. No React, no IDs, no editor reads

export function makeCell(
  id: string,
  type: CellType = 'text',
  initialContent: Descendant[] | null = null,
  equationContent?: string,
): Cell {
  const cell: Cell = { id, type, initialContent }
  if (type === 'equation') cell.equationContent = equationContent ?? ''
  else if (equationContent !== undefined) cell.equationContent = equationContent
  return cell
}

export function snapshotToCell(id: string, snap: CellSnapshot): Cell {
  const cell: Cell = { id, type: snap.type, initialContent: snap.initialContent }
  if (snap.equationContent !== undefined) cell.equationContent = snap.equationContent
  return cell
}

export function indexOfCell(cells: Cell[], id: string | null): number {
  return id == null ? -1 : cells.findIndex(c => c.id === id)
}

// Insert `incoming` after `afterId`, or append if it's null / not found.
export function insertAfter(cells: Cell[], afterId: string | null, incoming: Cell[]): Cell[] {
  const idx = indexOfCell(cells, afterId)
  if (idx === -1) return [...cells, ...incoming]
  return [...cells.slice(0, idx + 1), ...incoming, ...cells.slice(idx + 1)]
}

// Swap `incoming` in for the cell at `targetId` (paste onto an empty cell).
export function replaceCell(cells: Cell[], targetId: string, incoming: Cell[]): Cell[] {
  const idx = indexOfCell(cells, targetId)
  if (idx === -1) return [...cells, ...incoming]
  return [...cells.slice(0, idx), ...incoming, ...cells.slice(idx + 1)]
}

export function removeByIds(cells: Cell[], ids: Set<string>): Cell[] {
  return cells.filter(c => !ids.has(c.id))
}

export function moveCell(cells: Cell[], id: string, dir: 'up' | 'down'): Cell[] {
  const i = indexOfCell(cells, id)
  if (i === -1) return cells
  const j = dir === 'up' ? i - 1 : i + 1
  if (j < 0 || j >= cells.length) return cells
  const next = [...cells]
  ;[next[i], next[j]] = [next[j], next[i]]
  return next
}

// Cells whose ids are in `ids`, in document order — keeps copy/duplicate stable
// regardless of the order cells were selected in.
export function cellsInOrder(cells: Cell[], ids: Set<string>): Cell[] {
  return cells.filter(c => ids.has(c.id))
}
