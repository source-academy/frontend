import { TreeNode } from './BaseTreeNode';
import { DrawableTreeNode } from './DrawableTreeNode';

export class AlreadyParsedTreeNode extends TreeNode {
    public actualNode: DrawableTreeNode;

    constructor(actualNode: DrawableTreeNode) {
        super();
        this.actualNode = actualNode;
    }
}
