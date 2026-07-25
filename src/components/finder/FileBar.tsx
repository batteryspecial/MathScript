"use client";
import { useState } from "react";
import type { Workspace } from "@/hooks/workspace/useWorkspace";
import type { NotebookAPI } from "@/lib/notebook/NotebookAPI";

type MenuKey = "File" | "Edit" | "View" | "Help";
const MENUS: MenuKey[] = ["File", "Edit", "View", "Help"];

interface MenuItem {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
}

interface FileBarProps {
  ws: Workspace;
  api: NotebookAPI | null;
  explorerOpen: boolean;
  onToggleExplorer: () => void;
  symbolsOpen: boolean;
  onToggleSymbols: () => void;
  onOpenRename: () => void;
  onOpenExport: () => void;
}

function Divider() {
  return <div className="h-px bg-[var(--ms-tb-border)] my-1" />;
}

function Dropdown({ items }: { items: (MenuItem | "divider")[] }) {
  return (
    <div className="absolute top-full left-0 mt-0 bg-white border border-[var(--ms-tb-border)] z-[100] min-w-[190px] py-1 shadow-sm">
      {items.map((item, i) =>
        item === "divider" ? (
          <Divider key={i} />
        ) : (
          <div
            key={item.label}
            className={`px-3.5 py-[6px] text-[12.5px] text-[var(--ms-text)] ${
              item.disabled ? "opacity-40 cursor-default" : "cursor-pointer hover:bg-[#eef4ff]"
            }`}
            onClick={item.disabled ? undefined : item.onClick}
          >
            {item.label}
          </div>
        ),
      )}
    </div>
  );
}

export default function FileBar({
  ws,
  api,
  explorerOpen,
  onToggleExplorer,
  symbolsOpen,
  onToggleSymbols,
  onOpenRename,
  onOpenExport,
}: FileBarProps) {
  const [openMenu, setOpenMenu] = useState<MenuKey | null>(null);
  const close = () => setOpenMenu(null);

  const menuItems: Record<MenuKey, (MenuItem | "divider")[]> = {
    File: [
      { label: "New File", onClick: () => { ws.createFile(); close(); } },
      { label: "New Folder", onClick: () => { ws.createFolder(); close(); } },
      "divider",
      { label: "Rename", disabled: !api, onClick: () => { onOpenRename(); close(); } },
      "divider",
      { label: "Export LaTeX", disabled: !api, onClick: () => { onOpenExport(); close(); } },
    ],
    Edit: [
      { label: "Undo", disabled: !api, onClick: () => { api?.undo(); close(); } },
      { label: "Redo", disabled: !api, onClick: () => { api?.redo(); close(); } },
      "divider",
      { label: "Cut", disabled: !api, onClick: () => { api?.cutCells(); close(); } },
      { label: "Copy", disabled: !api, onClick: () => { api?.copyCells(); close(); } },
      { label: "Paste", disabled: !api, onClick: () => { api?.pasteCells(); close(); } },
      { label: "Duplicate", disabled: !api, onClick: () => { api?.duplicateCells(); close(); } },
    ],
    View: [
      { label: explorerOpen ? "Hide File Explorer" : "Show File Explorer", onClick: () => { onToggleExplorer(); close(); } },
      { label: symbolsOpen ? "Hide Symbol Panel" : "Show Symbol Panel", onClick: () => { onToggleSymbols(); close(); } },
    ],
    Help: [{ label: "About MathScript", disabled: true }],
  };

  return (
    <div
      className="flex items-center bg-[var(--ms-tb-bg)] border-b border-[var(--ms-tb-border)] h-7 shrink-0 [font-family:var(--ms-font-ui)] text-[12.5px]"
      onMouseLeave={close}
    >
      {MENUS.map((menu) => (
        <div key={menu} className="relative">
          <button
            className={`px-3.5 py-[4px] cursor-pointer border-none ${
              openMenu === menu ? "bg-[#dfe3e6]" : "bg-transparent hover:bg-[#e8eaec]"
            }`}
            onClick={() => setOpenMenu((m) => (m === menu ? null : menu))}
            onMouseEnter={() => setOpenMenu((m) => (m !== null ? menu : m))}
          >
            {menu}
          </button>
          {openMenu === menu && <Dropdown items={menuItems[menu]} />}
        </div>
      ))}
    </div>
  );
}
