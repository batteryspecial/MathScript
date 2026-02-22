import BlockEditor from '../../canvas/BlockEditor'

/**
 * Block - A Jupyter-style cell with blue indicator bar
 * Contains a BlockEditor (Slate instance)
 */
export default function Block({id, onFocus, isSelected}) {
    /**
     * State Decoupling
     * - @param isSelected (Boolean): Managed by the parent (BlockHandler). It controls the Blue Sidebar. It stays true even if you click a button or a menu, as long as that block is the "current" one
     * - @param isFocused (Boolean): Managed by the Editor (Slate). It controls the Blue Border. It is only true when the blinking cursor is inside the text area.
     */
    return (
        <>
            <BlockEditor onFocus={onFocus} isSelected={isSelected} />
        </>
    )
}