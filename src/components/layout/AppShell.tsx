"use client"
import { useEffect, useRef, useState } from "react"

import { useWorkspace } from "@/hooks/workspace/useWorkspace"
import { useEquationBar } from "@/hooks/equation/useEquationBar"
import { buildKey } from "@/lib/keybinds/KeyHandler"

import NotebookView from "@/notebook/NotebookView"
import type { CellSnapshot } from "@/lib/cells/types"
import type { NotebookAPI } from "@/lib/notebook/NotebookAPI"

import ToolBar from "@/components/tools/ToolBar"
import ActivityBar from "@/components/finder/ActivityBar"
import FileExplorerView from "@/components/finder/FileExplorerView"
import FileBar from "@/components/finder/FileBar"
import TabBar from "@/components/finder/TabBar"
import CellOperationsBar from "@/components/tools/CellOperationsBar"

import SymbolPanel from "@/components/math/equation/SymbolPanel"
import EquationEditor from "@/components/math/equation/EquationEditor"

export default function AppShell({ id }: { id: string}) {
    const ws = useWorkspace()
    const eqBar = useEquationBar()

    const [symbolsOpen, setSymbolsOpen] = useState(false)
    const [explorerOpen, setExplorerOpen] = useState(true)
    const [activeAPI, setActiveAPI] = useState<NotebookAPI | null>(null)

    // one clipboard shared by every open notebook
    const clipboard = useRef<CellSnapshot[] | null>(null)

    // only trust the published API if it belongs to the currently active file
    // (activeAPI may be stale if we switch files quickly)
    const liveAPI = (activeAPI && activeAPI.fileId === ws.activeFileId) ? activeAPI : null
    const selectedEq = (liveAPI && liveAPI.selectedCell?.type === "equation") ? liveAPI.selectedCell : null

    // Ctrl/Cmd+W closes the active tab instead of the browser tab. Always on,
    // regardless of cell mode — closing a tab isn't a cell operation.
    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            const key = buildKey(e)
            if (key !== "Meta+w" && key !== "Ctrl+w") return
            e.preventDefault()
            if (ws.activeFileId) ws.closeTab(ws.activeFileId)
        }
        document.addEventListener("keydown", onKeyDown)
        return () => document.removeEventListener("keydown", onKeyDown)
    }, [ws.activeFileId, ws.closeTab])

    return (
        <div className="flex h-screen overflow-hidden">
            <ActivityBar explorerOpen={explorerOpen} onToggleExplorer={() => setExplorerOpen((v) => !v)} />
            {explorerOpen && <FileExplorerView ws={ws} cellCount={liveAPI?.cellCount ?? 0} />}
            <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                <FileBar
                    ws={ws}
                    api={liveAPI}
                    fileName={ws.fileName(ws.activeFileId)}
                    explorerOpen={explorerOpen}
                    onToggleExplorer={() => setExplorerOpen((v) => !v)}
                    symbolsOpen={symbolsOpen}
                    onToggleSymbols={() => setSymbolsOpen((v) => !v)}
                />
                <TabBar ws={ws} />
                <CellOperationsBar api={liveAPI} />
                <ToolBar
                    api={liveAPI}
                    symbolsOpen={symbolsOpen}
                    onToggleSymbols={() => setSymbolsOpen((v) => !v)}
                />
                {symbolsOpen && (
                    <SymbolPanel canInsert={!!selectedEq} onInsert={eqBar.insertAtCursor} />
                )}

                <div className="flex-1 overflow-y-auto bg-[var(--ms-body)]">
                    {(ws.openTabs.length === 0) ? (
                        <div className="flex flex-col items-center justify-center h-full gap-3 text-[13px] text-[var(--ms-muted)]">
                        <div>No file open.</div>
                        <button
                            className="px-3.5 py-1.5 border border-[var(--ms-tb-border)] rounded-[3px] bg-white cursor-pointer text-xs [font-family:var(--ms-font-ui)]"
                            onClick={() => ws.createFile()}
                        >
                            + New File
                        </button>
                        </div>
                    ) : (ws.openTabs.map((tab) => (
                            <div
                                key={tab.id}
                                className="h-full"
                                style={{
                                    display: (tab.id === ws.activeFileId) ? "block" : "none"
                                }}
                            >
                                <NotebookView
                                    fileId={tab.id}
                                    onAPI={setActiveAPI}
                                    clipboard={clipboard}
                                    isActive={tab.id === ws.activeFileId}
                                />
                            </div>
                        ))
                    )}
                </div>

                {selectedEq && liveAPI && (
                    <EquationEditor
                        fieldRef={eqBar.fieldRef}
                        value={selectedEq.equationContent}
                        onChange={(v) => liveAPI.setEquationContent(selectedEq.id, v)}
                    />
                )}
            </div>
        </div>
    )
}
