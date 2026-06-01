import type { NodeId, TreeNode, VisibleRow } from "./types"

const MS_EXT = ".ms"
const ILLEGAL = /[<>:"/\\|?*]/g

// Sanitizes user-supplied file/folder names
// - no path separators
// - no reserved or control characters
// - no leading dots
// - length-capped
// - guards against path traversal once these names reach a real backend

// TODO: replace this with a Zod sanitizer
export function sanitizeName(raw: string, fallback = "untitled.ms"): string {
    let s = (raw ?? "").normalize("NFC").replace(ILLEGAL, "")

    s = Array.from(s).filter((ch) => ch >= " ").join("")
    s = s.replace(/\s+/g, " ").replace(/^\.+/, "").trim().slice(0, 64).trim()

    return s || fallback
}

export function baseName(name: string): string {
    return name.endsWith(MS_EXT) ? name.slice(0, -MS_EXT.length) : name
}

let counter: number = 0
export function newId(): NodeId {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        return crypto.randomUUID()
    }
    return `n-${Date.now().toString(36)}-${(counter++).toString(36)}`
}

function childrenOf(nodes: TreeNode[]): Map<NodeId | null, TreeNode[]> {
    const map = new Map<NodeId | null, TreeNode[]>()
    for (const n of nodes) {
        const arr = map.get(n.parentId)
        if (arr) arr.push(n)
        else map.set(n.parentId, [n])
    }
    return map
}

// Ordered, indentation-aware list for the sidebar closed folders hide subtrees.
export function flattenVisible(nodes: TreeNode[]): VisibleRow[] {
    const children = childrenOf(nodes)
    const out: VisibleRow[] = []
    const walk = (parentId: NodeId | null, depth: number): void => {
        for (const node of children.get(parentId) ?? []) {
            out.push({ node, depth })
            if (node.kind === "folder" && node.open) walk(node.id, depth + 1)
        }
    }
    walk(null, 0)
    return out
}

export function descendantIds(nodes: TreeNode[], id: NodeId): Set<NodeId> {
    const children = childrenOf(nodes)
    const result = new Set<NodeId>([id])
    const stack: NodeId[] = [id]
    
    while (stack.length > 0) {
        const cur = stack.pop() as NodeId
        for (const child of children.get(cur) ?? []) {
            result.add(child.id)
            stack.push(child.id)
        }
    }
    return result
}
