import { TreeNode } from './BaseTreeNode';
import { DrawableTreeNode } from './DrawableTreeNode';

/**
 * Represents a node that is already parsed earlier in the tree.
 */
export class AlreadyParsedTreeNode extends TreeNode {
  public actualNode: DrawableTreeNode;

  constructor(actualNode: DrawableTreeNode) {
    super();
    this.actualNode = actualNode;
  }
}
