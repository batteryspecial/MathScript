"use client"
import { useRef, useState } from "react"

import { useWorkspace } from "@/app/hooks/workspace/useWorkspace"
import { useEquationEditor } from "@/app/hooks/equation/useEquationEditor"

import Notebook from "@/app/notebook/Notebook"
import type { CellSnapshot } from "@/lib/cells/types"
import type { NotebookAPI } from "@/app/notebook/NotebookAPI"

import Toolbar from "@/app/components/tools/Toolbar"
import Sidebar from "@/app/components/finder/Sidebar"
import Filebar from "@/app/components/finder/Filebar"
import Operationbar from "@/app/components/tools/Operationbar"

import SymbolPanel from "@/app/components/math/equation/SymbolPanel"
import EquationEditor from "@/app/components/math/equation/EquationEditor"

export default function AppShell() {
    const ws = useWorkspace()
    const eqEditor = useEquationEditor()

    const [symbolsOpen, setSymbolsOpen] = useState(false)
    const [activeAPI, setActiveAPI] = useState<NotebookAPI | null>(null)

    // one clipboard shared by every open notebook
    const clipboard = useRef<CellSnapshot[] | null>(null)

    // only trust the published API if it belongs to the currently active file
    // (activeAPI may be stale if we switch files quickly)
    const liveAPI = (activeAPI && activeAPI.fileId === ws.activeFileId) ? activeAPI : null
    const selectedEq = (liveAPI && liveAPI.selectedCell?.type === "equation") ? liveAPI.selectedCell : null


    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar ws={ws} cellCount={liveAPI?.cellCount ?? 0} />
            <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                <Filebar ws={ws} />
                <Operationbar api={liveAPI} />
                <Toolbar
                    api={liveAPI}
                    fileName={ws.fileName(ws.activeFileId)}
                    symbolsOpen={symbolsOpen}
                    onToggleSymbols={() => setSymbolsOpen((v) => !v)}
                />
                {symbolsOpen && (
                    <SymbolPanel canInsert={!!selectedEq} onInsert={eqEditor.insertAtCursor} />
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
                                <Notebook
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
                        inputRef={eqEditor.inputRef}
                        value={selectedEq.equationContent}
                        onChange={(v) => liveAPI.setEquationContent(selectedEq.id, v)}
                    />
                )}
            </div>
        </div>
    )
}
