'use client';
import Block from "./Block"
import { FaTrash } from "react-icons/fa";

export default function BlockContainer({ id, isSelected, onSelect, onDelete, showDelete, initialContent, registerEditor }) {
    return (
        <>
            <div className='group flex relative' onClick={onSelect}>
                <div className={`w-2 me-4 ${ isSelected ? 'bg-blue-500' : 'bg-transparent' }`}></div>
                <div className={`flex-1 ${ isSelected ? 'border-blue-400' : '' }`} >
                    <Block 
                        id={id} 
                        onFocus={onSelect} 
                        isSelected={isSelected}
                        registerEditor={registerEditor}
                        initialContent={initialContent}
                    />
                </div>
                {showDelete && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            onDelete()
                        }}
                        className="
                            absolute end-2.5 top-2 transform duration-150
                            opacity-0 group-hover:opacity-100 transition-all
                            hover:text-red-400 text-sm cursor-pointer
                        "
                        title='Delete block'
                    >
                        <FaTrash />
                    </button>
                )}
            </div>
        </>
    )
}