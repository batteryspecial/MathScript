"use client";
import type { Workspace } from "@/hooks/workspace/useWorkspace";

import styles from "./tabBar.module.css";

export default function TabBar({ ws }: { ws: Workspace }) {
  return (
    <div className={styles.tabbar}>
      {ws.openTabs.map((tab) => {
        const active = tab.id === ws.activeFileId;
        return (
          <div
            key={tab.id}
            className={`${styles.tab} ${active ? styles.tabActive : ""}`}
            title={tab.name}
            onClick={() => ws.setActive(tab.id)}
          >
            <span className="flex-1 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">{tab.name}</span>
            <button
              className={styles.tabClose}
              title="Close tab"
              onClick={(e) => {
                e.stopPropagation();
                ws.closeTab(tab.id);
              }}
            >
              ×
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
