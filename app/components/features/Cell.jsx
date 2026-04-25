'use client'
  import Editor from '@/app/editor/Editor'
  import { FaTrash } from 'react-icons/fa'

  export default function Cell({ 
        id, 
        isSelected,
        isOpSelected,
        isCellOpMode, 
        onSelect, 
        onEnterCellOpMode, 
        onDelete, 
        showDelete, 
        initialContent, 
        registerEditor, 
    }) {
      return (
          <div className="group flex relative" onClick={onSelect}>
                <div 
                    className="w-6 shrink flex items-stretch cursor-pointer" 
                    onClick={(e) => { e.stopPropagation(); onEnterCellOpMode() }}
                >
                    <div className={`w-2 ${isSelected ? 'bg-blue-500' : ''}`} />
                </div>
                <div className="flex-1">
                    <Editor
                        id={id}
                        onFocus={onSelect}
                        isSelected={isSelected}
                        isCellOpMode={isCellOpMode}
                        isOpSelected={isOpSelected}
                        registerEditor={registerEditor}
                        initialContent={initialContent}
                    />
              </div>
              {showDelete && (
                    <button
                        title="Delete cell"
                        onClick={(e) => { e.stopPropagation(); onDelete() }}
                        className="absolute end-2.5 top-2 duration-150 opacity-0 group-hover:opacity-100 transition-all hover:text-red-400 text-sm cursor-pointer"   
                    >
                        <FaTrash />
                    </button>
              )}
          </div>
      )
  }
