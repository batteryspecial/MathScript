import { tokenize } from "./lexer";
import { parse } from "./parser";
import { renderUnicode } from "./render/unicode";
import { renderLatex } from "./render/latex";
import { type CompileResult } from "./types";

export type { CompileResult, EquationError, Node } from "./types";
export { SYMBOLS, type SymbolDef, type SymbolCategory } from "./symbols";

const cache = new Map<string, CompileResult>();
const CACHE_LIMIT = 500;

function run(source: string): CompileResult {
  const tokens = tokenize(source);
  const { ast, errors } = parse(tokens);
  return {
    source,
    unicode: renderUnicode(ast),
    latex: renderLatex(ast),
    ok: errors.length === 0,
    errors,
  };
}

export function compileEquation(source: string): CompileResult {
  if (typeof source !== "string" || source.length === 0) {
    return { source: source ?? "", unicode: "", latex: "", ok: true, errors: [] };
  }

  const hit = cache.get(source);
  if (hit) return hit;

  let result: CompileResult;
  try {
    result = run(source);
  } catch {
    // Last-resort guard: the engine is designed never to reach here.
    result = {
      source,
      unicode: source,
      latex: "",
      ok: false,
      errors: [{ message: "Failed to render equation.", start: 0, end: source.length }],
    };
  }

  if (cache.size >= CACHE_LIMIT) cache.clear();
  cache.set(source, result);
  return result;
}

export const equationToUnicode = (source: string): string => compileEquation(source).unicode;
export const equationToLatex = (source: string): string => compileEquation(source).latex;
