export class TreeNode {
  public children: TreeNode[] | null;
  public nodePos: number = 0;

  constructor() {
    this.children = null;
    this.nodePos = 0;
  }
}
