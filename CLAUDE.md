# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

QED is a mathematical proof notebook — "the Jupyter notebook for pure mathematics." It's a Next.js app where users write structured proof blocks using a Slate.js rich-text editor with LaTeX math rendering via KaTeX.

## Commands

```bash
pnpm dev        # Start dev server (localhost:3000)
pnpm build      # Production build
pnpm lint       # ESLint
pnpm start      # Start production server
```

**Package manager: pnpm** (required, do not use npm/yarn).

## Architecture

### Component Tree

```
layout.tsx (KaTeX CSS, fonts)
└── page.jsx ('use client')
    └── Home.jsx
        └── BlockHandler.jsx  ← STATE OWNER (block array + selectedBlockId)
            ├── Filebar.jsx   ← dropdown menus (File, Edit, View, Settings)
            ├── Navbar.jsx    ← toolbar (Add, Cut, Copy, Paste, Return buttons)
            └── BlockContainer.jsx[]  ← blue sidebar + delete button per block
                └── Block.jsx
                    └── BlockEditor.jsx  ← Slate editor instance
                        ├── CommandInput.jsx  (inline \[command] element)
                        └── MathElement      (inline void KaTeX element)
```

### State Split

**`BlockHandler.jsx`** owns:
- `blocks[]` — array of `{ id, type }` tracking existence/order only
- `selectedBlockId` — which block shows the blue sidebar

**Content lives inside each `BlockEditor`'s Slate instance** — `BlockHandler` does not track text content.

**Critical distinction:** `isSelected` (parent-managed, stays true while toolbar is clicked) vs `isFocused` (Slate-managed, only true when cursor is active). This prevents the blue sidebar from disappearing when the user clicks the Navbar.

### Slate Editor Setup (`app/canvas/BlockEditor.jsx`)

Each `BlockEditor` creates its own Slate editor:
```
createEditor() → withReact() → withHistory() → withCommandInput()
```

**Custom element types:**
- `paragraph` — default text block
- `command-input` (inline, non-void) — the `\[text]` command box; user types inside it
- `math` (inline, void) — rendered KaTeX symbol; stores `{ latex: '...' }`; cursor skips it

### Keyboard Handling (`lib/keybinds/`)

Factory + OOP pattern:

- **`KeyDown.js`** — factory; maps key names to handler classes via `handlerRegistry`
- **`KeyHandler.js`** — base class with shared Slate utilities (`getParent`, `isAtStart`, `insertMath`, `removeNode`, etc.)
- Subclasses: `SpaceHandler`, `BackspaceHandler`, `ArrowRightHandler`, `ArrowLeftHandler`, etc.

**Key behaviors:**
- **Space**: resolves `command-input` content → inserts `math` node with LaTeX
- **Backspace**: handles deletion at boundaries of `math`/`command-input` nodes
- **Arrow keys**: navigate naturally into/out of `command-input` elements

### Command System (`lib/command/`)

The `\[text]` input goes through:

1. **`CommandList.js`** — registry of ~40 math commands with names, aliases, LaTeX
2. **`AutoComplete.js`** — filters commands by typed text; returns one result per command (deduped), prioritizing exact matches
3. **`CommandParser.js`** — recursive LaTeX converter; turns `"forall x in RR"` → `"\forall x \in \mathbb{R}"`; supports nested template commands like `"if (forall x) then (exists y)"`
4. **`CommandInline.js`** — Slate plugin (`withCommandInput`), context detection (`getCommandInputContext`), autocomplete positioning (`calculatePalettePosition`)

### Directory Layout

```
app/
  layout/     BlockHandler.jsx   (state container)
  canvas/     BlockEditor.jsx    (Slate editor)
  views/      Home.jsx
  components/
    navigation/  Navbar.jsx, Filebar.jsx
    editor/      BlockContainer.jsx, Block.jsx
    command/     CommandInput.jsx
lib/
  keybinds/   KeyDown.js, KeyHandler.js, *Handler.js
  command/    CommandList.js, CommandParser.js, AutoComplete.js, CommandInline.js
```

Path alias `@/*` maps to the repo root (`jsconfig.json`).

## Notes

- **React Strict Mode is disabled** (`next.config.ts`) — required for Slate.js compatibility
- **Tailwind `content` path** in `tailwind.config.js` points to `./src/**` but the app lives in `./app/` — this may need updating if styles stop applying
- **`CommandPalette.jsx`** is currently commented out in `BlockEditor.jsx`
- No global state library (no Redux, Zustand, Context) — state is lifted to `BlockHandler`
