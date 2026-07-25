"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import type { TreeNodeInput } from "@mathscript/postgres"

import type { FileNode, NodeId, TreeNode, VisibleRow } from "@/lib/workspace/types"
import { descendantIds, flattenVisible, newId, sanitizeName } from "@/lib/workspace/filetree"
import { saveTreeAction } from "@/lib/db/actions"
import { useAutosave } from "@/hooks/document/useAutosave"
import type { InitialWorkspace } from "@/lib/db/hydrate"

// Tree writes run ahead of document writes on purpose: Document.nodeId is a FK,
// so a brand-new file's Node row has to land before its cells do.
const TREE_SAVE_DELAY = 300

function toTreeInput(nodes: TreeNode[]): TreeNodeInput[] {
    return nodes.map((n) => ({
        id: n.id,
        parentId: n.parentId,
        kind: n.kind,
        name: n.name,
        open: n.kind === "folder" ? n.open : true,
    }))
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
    // inline rename UI state
    editingId: NodeId | null
    draft: string
    setDraft: (draft: string) => void
    startEdit: (id: NodeId, currName: string) => void
    cancelEdit: () => void
    discardEdit: () => void
    commitEdit: () => void
}

export function useWorkspace(initial: InitialWorkspace): Workspace {
    const [tree, setTree] = useState<TreeNode[]>(initial.nodes)
    const [openTabIds, setOpenTabIds] = useState<NodeId[]>(() =>
        initial.activeFileId ? [initial.activeFileId] : [],
    )
    const [activeFileId, setActiveFileId] = useState<NodeId | null>(initial.activeFileId)
    const [editingId, setEditingId] = useState<NodeId | null>(null)
    const [draft, setDraft] = useState<string>("")

    const { markDirty } = useAutosave(
        () => toTreeInput(tree),
        (nodes) => saveTreeAction(initial.projectId, nodes),
        TREE_SAVE_DELAY,
    )

    // setTree always produces a new array, so identity is the change signal.
    // The mount pass is skipped — it matches what the server just sent.
    const treeSaved = useRef(true)
    useEffect(() => {
        if (treeSaved.current) {
            treeSaved.current = false
            return
        }
        markDirty()
    }, [tree, markDirty])

    // tracks a freshly created, still-unconfirmed file/folder so an escaped
    // rename (Escape before Enter) deletes it instead of leaving it orphaned
    const pendingOpenId = useRef<NodeId | null>(null)

    const fileMap = useMemo(() => {
        const m = new Map<NodeId, TreeNode>()
        for (const n of tree) m.set(n.id, n)
        return m
    }, [tree])

    const visible = useMemo(() => flattenVisible(tree), [tree])

    const openTabs = useMemo(() => 
        openTabIds
            .map((id) => fileMap.get(id))
            .filter((n): n is FileNode => n?.kind === "file")
    , [openTabIds, fileMap])

    const fileName = useCallback((id: NodeId | null): string => (
        id ? (fileMap.get(id)?.name ?? "") : ""
    ), [fileMap])

    const openFile = useCallback((id: NodeId) => {
        setOpenTabIds((prev) => (prev.includes(id) ? prev : [...prev, id]))
        setActiveFileId(id)
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

    const setActive = useCallback((id: NodeId) => setActiveFileId(id), [])

    const toggleFolder = useCallback((id: NodeId) => {
        setTree((prev) =>
            prev.map((n) => (n.id === id && n.kind === "folder" ? { ...n, open: !n.open } : n)),
        )
    }, [])

    const renameNode = useCallback((id: NodeId, name: string) => {
        setTree((prev) => prev.map((n) => (
            (n.id === id) ? { ...n, name: sanitizeName(name, n.name) } : n
        )))
    }, [])

    const startEdit = useCallback((id: NodeId, currName: string, ) => {
        setEditingId(id)
        setDraft(currName)
    }, [])

    // open the file that was parked during a create-then-rename, if any
    const flushPendingOpen = useCallback(() => {
        const id = pendingOpenId.current
        pendingOpenId.current = null
        if (id) openFile(id)
    }, [openFile])

    const cancelEdit = useCallback(() => {
        setEditingId(null)
        flushPendingOpen()
    }, [flushPendingOpen])

    const discardEdit = useCallback(() => {
        const pendingId = pendingOpenId.current
        setEditingId((id) => {
            if (id && id === pendingId) {
                deleteNode(id)
            }
            return null
        })

        flushPendingOpen()
    }, [deleteNode, flushPendingOpen])

    const commitEdit = useCallback(() => {
        setEditingId((id) => {
            if (id) {
                renameNode(id, draft)
                flushPendingOpen()
            }
            return null
        })
    }, [renameNode, draft, flushPendingOpen])

    const createFile = useCallback((parentId: NodeId | null = null) => {
        const file: FileNode = { id: newId(), kind: "file", name: "untitled.ms", parentId }

        setTree((prev) => [...prev, file])
        openFile(file.id)
        // still tracked: an escaped, never-confirmed rename deletes the file (see discardEdit)
        pendingOpenId.current = file.id
        startEdit(file.id, file.name)
    }, [startEdit, openFile])

    const createFolder = useCallback((parentId: NodeId | null = null) => {
        const folder: TreeNode = {
            id: newId(),
            kind: "folder",
            name: "new folder",
            parentId,
            open: true,
        }
        setTree((prev) => [...prev, folder])
        pendingOpenId.current = folder.id
        // folders open nothing, so no focus-steal concern
        startEdit(folder.id, folder.name)
    }, [startEdit])

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
        editingId,
        draft,
        setDraft,
        startEdit,
        cancelEdit,
        discardEdit,
        commitEdit,
    }
}
