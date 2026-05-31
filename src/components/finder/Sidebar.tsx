"use client";
import { FileText, Folder, FolderOpen } from "lucide-react";
import type { Workspace } from "@/hooks/workspace/useWorkspace";

import styles from "./sidebar.module.css";

interface SidebarProps {
  ws: Workspace;
  cellCount: number;
}

export default function Sidebar({ ws, cellCount }: SidebarProps) {
  return (
    <aside className="flex flex-col flex-none w-[200px] bg-[var(--ms-sb-bg)] text-[var(--ms-sb-text)] border-r border-[var(--ms-sb-border)]">
      <div className="flex items-center pt-3 px-2.5 pb-2">
        <span className="text-white text-[14.5px] font-bold">MathScript</span>
        <span className={styles.sbBadge}>V1</span>
      </div>

      <div className="flex gap-[5px] px-2.5 pb-2">
        <button className={styles.sbActionBtn} onClick={() => ws.createFile()}>
          + File
        </button>
        <button className={styles.sbActionBtn} onClick={() => ws.createFolder()}>
          + Folder
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pt-1">
        {ws.visible.map(({ node, depth }) => {
          const isFolder = node.kind === "folder";
          const active = !isFolder && node.id === ws.activeFileId;
          return (
            <div
              key={node.id}
              className={`${styles.sbRow} ${active ? styles.sbRowActive : ""}`}
              style={{ paddingLeft: 12 + depth * 14 }}
              title={node.name}
              onClick={() => (isFolder ? ws.toggleFolder(node.id) : ws.openFile(node.id))}
            >
              <span className="flex items-center shrink-0 opacity-85">
                {isFolder ? (
                  node.open ? (
                    <FolderOpen size={13} />
                  ) : (
                    <Folder size={13} />
                  )
                ) : (
                  <FileText size={13} />
                )}
              </span>
              <span className="overflow-hidden text-ellipsis">{node.name}</span>
            </div>
          );
        })}
      </div>

      <div className="px-2.5 py-1.5 text-[11px] text-[var(--ms-sb-text)] border-t border-[var(--ms-sb-border)]">
        {cellCount} {cellCount === 1 ? "cell" : "cells"}
      </div>
    </aside>
  );
}
