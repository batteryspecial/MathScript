"use client";
import Link from "next/link";
import { ArrowLeft, PanelLeft, Settings } from "lucide-react";

interface ActivityBarProps {
	explorerOpen: boolean;
	onToggleExplorer: () => void;
}

const ICON_BUTTON = "flex items-center justify-center w-8 h-8 rounded-[3px] cursor-pointer text-[var(--ms-sb-text)] hover:bg-[var(--ms-sb-hover)] hover:text-[var(--ms-sb-bright)]";

// Unmounting the shell flushes any pending autosave, so leaving mid-edit doesn't drop the last keystrokes.
export default function ActivityBar({ explorerOpen, onToggleExplorer }: ActivityBarProps) {
	return (
		<div className="flex flex-col items-center justify-between w-11 shrink-0 bg-[var(--ms-sb-bg)] border-r border-[var(--ms-sb-border)] py-2">
			<div className="flex flex-col items-center gap-1">
				<Link href="/projects" title="All projects" aria-label="All projects" className={ICON_BUTTON}>
					<ArrowLeft size={18} />
				</Link>

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
			</div>

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
