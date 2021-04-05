import { TreeNode } from "./BaseTreeNode";

/**
 * Represents a node whose drawable should be cached.
 * 
 * Concrete implementations: FunctionTreeNode, PairTreeNode
 */
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

    /**
     * Creates a Konva object representing the drawable. Should be called only once.
     * Subsequent references of the drawable to be obtained using the drawable getter.
     * 
     * @param x The x position of the drawable.
     * @param y The y position of the drawable.
     * @param parentX The x position of the parent.
     * @param parentY The y position of the parent.
     */
    abstract createDrawable(x: number, y: number, parentX: number, parentY: number): JSX.Element;
}