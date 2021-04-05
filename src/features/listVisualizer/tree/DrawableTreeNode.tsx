import { TreeNode } from "./TreeNode";

export abstract class DrawableTreeNode extends TreeNode {
    protected readonly id: number;
    protected _drawable?: JSX.Element;
    public drawableX?: number;
    public drawableY?: number;

    constructor(id: number) {
        super();
        this.id = id;
    }

    get drawable() {
        return this._drawable;
    }

    abstract getDrawable(x: number, y: number, parentX: number, parentY: number): JSX.Element;
}