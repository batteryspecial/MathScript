/**
 * Equation symbol table — shared between the MathQuill editing field
 * (autoCommands) and the SymbolPanel (click-to-insert).
 *
 * MathQuill owns parsing/rendering/LaTeX serialization now; this module no
 * longer contains a parser.
 */
export {
  SYMBOLS,
  KNOWN_FUNCTIONS,
  AUTO_COMMANDS,
  type SymbolDef,
  type SymbolCategory,
} from "./symbols";
