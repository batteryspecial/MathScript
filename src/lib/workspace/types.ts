export type NodeId = string;

interface BaseNode {
  id: NodeId;
  name: string;
  parentId: NodeId | null;
}

export interface FileNode extends BaseNode {
  kind: "file";
}

export interface FolderNode extends BaseNode {
  kind: "folder";
  open: boolean;
}

export type TreeNode = FileNode | FolderNode;

export interface VisibleRow {
  node: TreeNode;
  depth: number;
}
