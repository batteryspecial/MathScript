"use client";
import type { Workspace } from "@/hooks/workspace/useWorkspace";
import type { SaveState } from "@/hooks/document/useAutosave";

import styles from "./tabBar.module.css";

interface TabBarProps {
  ws: Workspace;
  saveStates: Record<string, SaveState>;
}

export default function TabBar({ ws, saveStates }: TabBarProps) {
  return (
    <div className={styles.tabbar}>
      {ws.openTabs.map((tab) => {
        const active = tab.id === ws.activeFileId;
        // "saving" still counts as unsaved — the dot clears only once written.
        const unsaved = (saveStates[tab.id] ?? "saved") !== "saved";
        return (
          <div
            key={tab.id}
            className={`${styles.tab} ${active ? styles.tabActive : ""}`}
            title={unsaved ? `${tab.name} — unsaved changes` : tab.name}
            onClick={() => ws.setActive(tab.id)}
          >
            <span className="flex-1 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">{tab.name}</span>
            {/* VS Code behaviour: the dot occupies the close button's slot and
                swaps back to × on hover, so the tab width never jumps. */}
            <button
              className={`${styles.tabClose} ${unsaved ? styles.tabCloseDirty : ""}`}
              title="Close tab"
              aria-label={unsaved ? "Unsaved changes — close tab" : "Close tab"}
              onClick={(e) => {
                e.stopPropagation();
                ws.closeTab(tab.id);
              }}
            >
              <span aria-hidden="true" className={styles.tabDot} />
              <span aria-hidden="true" className={styles.tabX}>
                ×
              </span>
            </button>
          </div>
        );
      })}
      <button className={styles.newTab} title="New file" onClick={() => ws.createFile()}>
        +
      </button>
    </div>
  );
}
