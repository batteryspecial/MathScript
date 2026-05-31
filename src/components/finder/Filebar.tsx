"use client";
import type { Workspace } from "@/hooks/workspace/useWorkspace";

import styles from "./filebar.module.css";

export default function Filebar({ ws }: { ws: Workspace }) {
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
            <span className="overflow-hidden text-ellipsis whitespace-nowrap">{tab.name}</span>
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
      <button
        className="px-2 pt-0.5 pb-[5px] text-[#777] cursor-pointer bg-transparent border-none text-[15px] leading-none"
        title="New file"
        onClick={() => ws.createFile()}
      >
        +
      </button>
    </div>
  );
}
