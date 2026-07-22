"use client";
import { PanelLeft, Settings } from "lucide-react";

interface ActivityBarProps {
  explorerOpen: boolean;
  onToggleExplorer: () => void;
}

export default function ActivityBar({ explorerOpen, onToggleExplorer }: ActivityBarProps) {
  return (
    <div className="flex flex-col items-center justify-between w-11 shrink-0 bg-[var(--ms-sb-bg)] border-r border-[var(--ms-sb-border)] py-2">
      <button
        title="Toggle File Explorer"
        onClick={onToggleExplorer}
        className={`flex items-center justify-center w-8 h-8 rounded-r-[3px] cursor-pointer border-l-2 ${
          explorerOpen
            ? "border-l-[var(--ms-sb-accent)] text-[var(--ms-sb-bright)]"
            : "border-l-transparent text-[var(--ms-sb-text)]"
        } hover:bg-[var(--ms-sb-hover)]`}
      >
        <PanelLeft size={18} />
      </button>

      <button
        title="Settings (disabled)"
        disabled
        className="flex items-center justify-center w-8 h-8 rounded-[3px] text-[var(--ms-muted)] opacity-50 cursor-default"
      >
        <Settings size={18} />
      </button>
    </div>
  );
}
