'use client'
import { useState, useCallback } from "react"
import BlockContainer from '../components/editor/BlockContainer'

/**
 * NotebookPage
 * 
 * A parent component that owns all block states.
 * 
 * This uses the "lifted state" pattern. Every child component
 * (Block, Navbar, BlockToolbar) receives callbacks from here.
 * They never mutate blocks directly.
 * 
 * State
 * @param blocks[] Array of { id, type }. Content lives inside each BlockEditor's Slate instance.
 * @selectedBlockId Which block has the blue sidebar. null = none selected.
 */
export default function BlockHandler() {
    const [blocks, setBlocks] = useState(() => [
        {id: crypto.randomUUID(), type: 'markdown',}
    ])
    const [selectedBlockId, setSelectedBlockId] = useState(blocks[0].id);

    // ------------------- CRUD -------------------

    /**
     * @param afterID
     * If provided, the block will be added after that block.
     * Otherwise, the block will be added at the end of all the blocks.
     * 
     * @returns A new block.
     */
    const addBlock = useCallback((afterID = null) => {
        // useCallback ensures the other blocks are not re-rendered
        const newBlock = { id: crypto.randomUUID(), type: 'markdown' }

        setBlocks((prev) => {
            if (!afterID) {
                return [...prev, newBlock]
            }

            const prevIndex = prev.findIndex(b => b.id === afterID)
            const newBlocks = [...prev]
            newBlocks.splice(prevIndex+1, 0, newBlock)
            return newBlocks
        })

        setSelectedBlockId(newBlock.id)
    }, [])

    /**
     * @param id
     * @returns The block list with a block deleted.
     * 
     * Always keeps at least one block. 
     * Focuses the nearest remaining block after deletion.
     * Prefers the top block.
     */
    const deleteBlock = useCallback((id) => {
        setBlocks((prev) => {
            if (prev.length <= 1) return prev

            const index = prev.findIndex(b => b.id === id)
            const next = prev.filter(b => b.id !== id)

            // Focus: prefer the block above, fall back to first
            const focusIndex = Math.min(index, next.length - 1)
            setSelectedBlockId(next[focusIndex].id)

            return next
        })
    }, [])

    // ------------------- RENDER -------------------
    return (
        <>
            <div className="max-w-full py-4 px-2">
                <div className="space-y-2">
                    {blocks.map((block) => (
                        <BlockContainer
                            key={block.id}
                            id={block.id}
                            isSelected={selectedBlockId === block.id}
                            onSelect={() => setSelectedBlockId(block.id)}
                            onDelete={() => deleteBlock(block.id)}
                            showDelete={blocks.length > 1}
                        />
                    ))}
                </div>

                {/* Bottom add button — will be replaced by hover bars in a later phase */}
                <button
                    onClick={() => addBlock()}
                    className="mt-4 w-full py-2 border border-dashed border-gray-300 rounded-lg text-gray-400 hover:border-blue-300 hover:text-blue-400 transition-colors text-sm cursor-pointer"
                >
                    + Add Block
                </button>
            </div>
        </>
    )
}