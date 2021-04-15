export class TreeNode {
  public children: TreeNode[] | null;

  constructor(children: TreeNode[] | null = null) {
    this.children = children;
  }
}
