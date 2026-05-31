"use client"

import { useCallback, useMemo, useState } from "react"
import type { FileNode, NodeId, TreeNode, VisibleRow } from "@/lib/workspace/types"
import { descendantIds, flattenVisible, newId, sanitizeName } from "@/lib/workspace/filetree"

// The only place that knows where the workspace comes from
// Future persistence goes here
function createInitialWorkspace(): { nodes: TreeNode[]; activeFileId: NodeId | null } {
    const main: FileNode = { id: newId(), kind: "file", name: "main.ms", parentId: null }
    const intro: FileNode = { id: newId(), kind: "file", name: "intro.ms", parentId: null }
    const chapters: TreeNode = {
        id: newId(),
        kind: "folder",
        name: "chapters",
        parentId: null,
        open: true,
    }

    const derivation: FileNode = {
        id: newId(),
        kind: "file",
        name: "derivation.ms",
        parentId: chapters.id,
    }

    const proofs: FileNode = { 
        id: newId(), 
        kind: "file", 
        name: "proofs.ms", 
        parentId: chapters.id 
    }

    return {
        nodes: [main, intro, chapters, derivation, proofs],
        activeFileId: main.id,
    }
}


export interface Workspace {
  visible: VisibleRow[]
  openTabs: FileNode[]
  activeFileId: NodeId | null
  fileName: (id: NodeId | null) => string
  createFile: (parentId?: NodeId | null) => void
  createFolder: (parentId?: NodeId | null) => void
  openFile: (id: NodeId) => void
  closeTab: (id: NodeId) => void
  setActive: (id: NodeId) => void
  toggleFolder: (id: NodeId) => void
  renameNode: (id: NodeId, name: string) => void
  deleteNode: (id: NodeId) => void
}

export function useWorkspace(): Workspace {
    const [seed] = useState(createInitialWorkspace)
    const [tree, setTree] = useState<TreeNode[]>(seed.nodes)
    const [openTabIds, setOpenTabIds] = useState<NodeId[]>(() =>
        seed.activeFileId ? [seed.activeFileId] : [],
    )
    const [activeFileId, setActiveFileId] = useState<NodeId | null>(seed.activeFileId)

    const fileMap = useMemo(() => {
        const m = new Map<NodeId, TreeNode>()
        for (const n of tree) m.set(n.id, n)
        return m
    }, [tree])

    const visible = useMemo(() => flattenVisible(tree), [tree])

    const openTabs = useMemo(
        () =>
        openTabIds
            .map((id) => fileMap.get(id))
            .filter((n): n is FileNode => n?.kind === "file"),
        [openTabIds, fileMap],
    )

    const fileName = useCallback(
        (id: NodeId | null): string => (id ? (fileMap.get(id)?.name ?? "") : ""),
        [fileMap],
    )

    const openFile = useCallback((id: NodeId) => {
        setOpenTabIds((prev) => (prev.includes(id) ? prev : [...prev, id]))
        setActiveFileId(id)
    }, [])

    const setActive = useCallback((id: NodeId) => setActiveFileId(id), [])

    const createFile = useCallback(
        (parentId: NodeId | null = null) => {
        const file: FileNode = { id: newId(), kind: "file", name: "untitled.ms", parentId }
        setTree((prev) => [...prev, file])
        openFile(file.id)
        },
        [openFile],
    )

    const createFolder = useCallback((parentId: NodeId | null = null) => {
        const folder: TreeNode = {
        id: newId(),
        kind: "folder",
        name: "new folder",
        parentId,
        open: true,
        }
        setTree((prev) => [...prev, folder])
    }, [])

    const toggleFolder = useCallback((id: NodeId) => {
        setTree((prev) =>
        prev.map((n) => (n.id === id && n.kind === "folder" ? { ...n, open: !n.open } : n)),
        )
    }, [])

    const renameNode = useCallback((id: NodeId, name: string) => {
        setTree((prev) =>
        prev.map((n) => (
            (n.id === id)
            ? { ...n, name: sanitizeName(name, n.name) } : n
        )))
    }, [])

    const closeTab = useCallback((id: NodeId) => {
        setOpenTabIds((prev) => {
            const idx = prev.indexOf(id)
            if (idx === -1) return prev
            
            const next = prev.filter((t) => t !== id)
            setActiveFileId((active) =>
                active === id ? (next[idx - 1] ?? next[idx] ?? next[0] ?? null) : active,
            )

            return next
        })
    }, [])

    const deleteNode = useCallback((id: NodeId) => {
        setTree((prev) => {
            const doomed = descendantIds(prev, id)
            const next = prev.filter((n) => !doomed.has(n.id))
            setOpenTabIds((tabs) => tabs.filter((t) => !doomed.has(t)))
            setActiveFileId((active) => (active && doomed.has(active) ? null : active))

            return next
        })
    }, [])

    return {
        visible,
        openTabs,
        activeFileId,
        fileName,
        createFile,
        createFolder,
        openFile,
        closeTab,
        setActive,
        toggleFolder,
        renameNode,
        deleteNode,
    }
}
