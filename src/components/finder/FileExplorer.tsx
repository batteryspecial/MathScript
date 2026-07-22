"use client";
import { ChevronDown, ChevronRight, FileText, Folder, FolderOpen } from "lucide-react";
import type { Workspace } from "@/hooks/workspace/useWorkspace";
import { baseName } from "@/lib/workspace/filetree";

import styles from "./fileexplorer.module.css";
import { TreeNode } from "@/lib/workspace/types";


interface RowProps {
    node: TreeNode,
    depth: number,
    isActive: boolean,
    isEditing: boolean,
    ws: Workspace,
}

function ExplorerRow({ node, depth, isActive, isEditing, ws }: RowProps) {
    const isFolder = node.kind === "folder"

    function handleRowClick() {
        if (isEditing) return
        isFolder ? ws.toggleFolder(node.id) : ws.openFile(node.id)
    }

    function handleRowDoubleClick() {
        if (isFolder) return
        ws.startEdit(node.id, node.name)
    }

    const handleOnFocus = (e: React.FocusEvent<HTMLInputElement, Element>) => {
        const end = baseName(e.target.value).length
        e.target.setSelectionRange(0, end)
    }

    const handleEditKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") ws.commitEdit()
        if (e.key === "Escape") ws.discardEdit()
    }

    return (
        <div
            key={node.id}
            title={node.name}
            onClick={handleRowClick}
            onDoubleClick={handleRowDoubleClick}
            style={{ paddingLeft: 4 + depth * 14 }}
            className={`${styles.sbRow} ${isActive ? styles.sbRowActive : ""}`}
        >
            <span className="flex items-center shrink-0 opacity-60 w-4 justify-center">
                {isFolder ? (
                    node.open ? <ChevronDown size={13} /> : <ChevronRight size={13} />
                ) : null}
            </span>

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

            {isEditing ? (
                <input
                    autoFocus
                    value={ws.draft}
                    onBlur={ws.commitEdit}
                    onFocus={handleOnFocus}
                    onKeyDown={handleEditKeyDown}

                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => ws.setDraft(e.target.value)}
                    className="w-full min-w-0 bg-white text-black text-[13px] px-1 rounded-[2px] outline-none"
                />
            ) : (
                <span className="overflow-hidden text-ellipsis">{node.name}</span>
            )}
        </div>
    )
}

interface FileExplorerProps {
  ws: Workspace;
  cellCount: number;
}

export default function FileExplorer({ ws, cellCount }: FileExplorerProps) {
    return (
        <aside className="flex flex-col flex-none w-[220px] bg-[var(--ms-sb-bg)] text-[var(--ms-sb-text)] border-r border-[var(--ms-sb-border)]">
            <div className="flex items-center h-8 px-2.5 shrink-0 text-[11px] font-bold tracking-[0.5px] text-[var(--ms-sb-bright)]">
                EXPLORER
            </div>

            <div className="flex-1 overflow-y-auto pt-0.5">
                {ws.visible.map(({ node, depth }) => (
                    <ExplorerRow
                        key={node.id}
                        node={node}
                        depth={depth}
                        isActive={!(node.kind === 'folder') && node.id === ws.activeFileId}
                        isEditing={ws.editingId === node.id}
                        ws={ws}
                    />
                ))}
            </div>

            <div className="px-2.5 py-1.5 text-[11px] text-[var(--ms-sb-text)] border-t border-[var(--ms-sb-border)]">
                {cellCount} {cellCount === 1 ? "cell" : "cells"}
            </div>
        </aside>
    )
}
