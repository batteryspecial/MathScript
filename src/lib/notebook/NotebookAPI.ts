import type { CellType } from "@/hooks/cells/useOperations";
import type { Mark } from "@/lib/slate/marks";

export interface SelectedCellInfo {
  id: string;
  type: CellType;
  equationContent: string;
}

// The surface a Notebook publishes to the app chrome (toolbar, symbol panel,
// equation bar, sidebar footer) when it is the active document.
export interface NotebookAPI {
  fileId: string;
  cellCount: number;
  selectedCell: SelectedCellInfo | null;
  toggleFormat: (mark: Mark) => void;
  isFormatActive: (mark: Mark) => boolean;
  insertCell: (type: CellType) => void;
  setEquationContent: (id: string, src: string) => void;
  exportLatex: () => string;

  // Cell operations, mode-agnostic — act on the active notebook's effective
  // target (multi-select set, else the focused cell). Drive the Operationbar.
  addCell: () => void;
  copyCells: () => void;
  cutCells: () => void;
  pasteCells: () => void;
  duplicateCells: () => void;
}
