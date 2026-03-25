export class TreeNode {
  public children: TreeNode[] | null;
  public nodePos: number = 0;
  public nodeColor: number = 0;
  public data: any;

  constructor() {
    this.children = null;
    this.nodePos = 0;
    this.nodeColor = 0;
  }
}
