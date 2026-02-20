'use client'
import BlockEditor from '../../canvas/BlockEditor'
import { FaTrash } from "react-icons/fa";

/**
 * Block - A Jupyter-style cell with blue indicator bar
 * Contains a BlockEditor (Slate instance)
 */
export default function Block({id, isSelected, onSelect, onDelete, showDelete}) {
    return (
        <>
            <div className="group flex relative" onClick={onSelect}>
                <div className={`w-1 rounded-l transition-colors ${
                    isSelected ? 'bg-blue-500' : 'bg-transparent'
                }`} />

                <div className={`flex flex-1 border rounded-r bg-white transition-colors ${
                    isSelected ? 'border-blue-200' : 'border-gray-200 hover:border-gray-300'
                }`}>
                    <div className="flex-1">
                        <BlockEditor onFocus={onSelect} />
                    </div>

                    {showDelete && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                onDelete()
                            }}
                            className="
                                absolute end-2.5 top-3 transform duration-150
                                opacity-0 group-hover:opacity-100 transition-all
                                text-gray-300 hover:text-red-400 text-sm cursor-pointer
                            "
                            title="Delete block"
                        >
                            <FaTrash />
                        </button>
                    )}
                </div>
            </div>
        </>
    )
}