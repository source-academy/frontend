import { DataTreeNode } from "./DataTreeNode";
import { DrawableTreeNode } from "./DrawableTreeNode";
import { FunctionTreeNode } from "./FunctionTreeNode";
import { PairTreeNode } from "./PairTreeNode";

class TreeNode {
    public left: TreeNode | number | null;
    public right: TreeNode | number | null;

    constructor() {
        this.left = null;
        this.right = null;
    }
}

export { DataTreeNode, DrawableTreeNode, FunctionTreeNode, PairTreeNode, TreeNode }