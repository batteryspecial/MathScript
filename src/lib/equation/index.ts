/**
 * Equation symbol table — feeds the SymbolPanel's click-to-insert buttons.
 *
 * MathQuill owns parsing/rendering/LaTeX serialization; this module no
 * longer contains a parser.
 */
export {
  SYMBOLS,
  KNOWN_FUNCTIONS,
  AUTO_COMMANDS,
  type SymbolDef,
  type SymbolCategory,
} from "./symbols";
