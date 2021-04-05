import { Layer, Line } from "react-konva";

import { Config } from "../Config";
import { Data, Pair } from "../ListVisualizerTypes";
import { head, isFunction, isPair, tail } from "../ListVisualizerUtils";
import { DataTreeNode } from "./DataTreeNode";
import { PairTreeNode } from "./PairTreeNode";
import { DrawableTreeNode, FunctionTreeNode, TreeNode } from "./TreeNode";

/**
 *  A tree object built based on a list or pair.
 */
export class Tree {
    private _rootNode: PairTreeNode;
    private nodes: DrawableTreeNode[];

    /**
     * Constructs a tree given a root node and a list of nodes.
     * @param {PairTreeNode} rootNode The root node of the tree.
     * @param {DrawableTreeNode[]} nodes The memoized nodes of the tree in list form.
     */
    constructor(rootNode: PairTreeNode, nodes: DrawableTreeNode[]) {
        this._rootNode = rootNode;
        this.nodes = nodes;
    }

    /**
     * The root node of the tree.
     */
    get rootNode(): PairTreeNode {
        return this._rootNode;
    }

    /**
     * Returns the memoized node of the given id.
     * @param {number} id The id of the node.
     */
    getNodeById(id: number): DrawableTreeNode {
        return this.nodes[id];
    }

    static fromSourceTree(tree: Pair) {
        let nodeCount: number = 0;
        /**
         * Returns a node representing the given tree as a pair.
         * Also memoizes the pair object, for the case where the
         * pair appears multiple times in the data structure.
         * @param {Pair} tree The Source tree to construct a node for.
         */
        function constructTree(tree: Pair) {
            const node = new PairTreeNode(nodeCount);

            visitedStructures[nodeCount] = tree;
            treeNodes[nodeCount] = node;
            nodeCount++;

            const headNode = head(tree);
            const tailNode = tail(tree);

            if (visitedStructures.indexOf(headNode) > -1) {
                // tree already built
                node.left = visitedStructures.indexOf(headNode);
            } else {
                node.left = isPair(headNode)
                    ? constructTree(headNode)
                    : isFunction(headNode)
                        ? constructFunction(headNode)
                        : constructData(headNode);
            }

            if (visitedStructures.indexOf(tailNode) > -1) {
                // tree already built
                node.right = visitedStructures.indexOf(tailNode);
            } else {
                node.right = isPair(tailNode)
                    ? constructTree(tailNode)
                    : isFunction(tailNode)
                        ? constructFunction(tailNode)
                        : constructData(tailNode);
            }

            return node;
        }

        /**
         * Returns a node representing the given function.
         * Also memoizes the function object, for the case where the
         * function appears multiple times in the data structure.
         * @param {Function} func The function to construct a node for.
         */
        function constructFunction(func: Function) {
            const node = new FunctionTreeNode(nodeCount);

            // memoise current function
            visitedStructures[nodeCount] = func;
            treeNodes[nodeCount] = node;
            nodeCount++;

            return node;
        }

        /**
         * Returns a node representing the given data.
         * Anything except functions and pairs are considered data, including empty lists.
         * @param {Data} data The data to construct a node for.
         */
        function constructData(data: Data) {
            return new DataTreeNode(data);
        }

        const visitedStructures: (Function | Pair)[] = []; // detects cycles
        const treeNodes: DrawableTreeNode[] = [];

        const rootNode = constructTree(tree);

        return new Tree(rootNode, treeNodes);
    }

    draw(x: number, y: number): JSX.Element {
        return new TreeDrawer(this).draw(x, y);
    }
}

/**
 *  Drawer function of a tree
 */
class TreeDrawer {
    private tree: Tree;

    // keeps track the extreme left end of the tree. In units of pixels.
    private minLeft = 500;

    private drawables: JSX.Element[];

    constructor(tree: Tree) {
        this.tree = tree;
        this.drawables = [];
    }

    /**
     *  Draws a tree at x, y, by calling drawNode on the root at x, y.
     */
    draw(x: number, y: number): JSX.Element {
        this.drawNode(this.tree.rootNode, x, y, x, y);
        return <Layer
            offsetX={this.minLeft - 20}
            offsetY={0}>
            {this.drawables}
        </Layer>
    }

    /**
     *  Draws the box for the pair representing the tree, then recursively draws its children.
     *  A slash is drawn for empty lists.
     * 
     *  If a child node has been drawn previously, an arrow is drawn pointing to the children,
     *  instead of drawing the child node again.
     * @param {TreeNode} node The node to draw.
     * @param {number} x The x position to draw at.
     * @param {number} y The y position to draw at.
     * @param {number} parentX The x position of the parent. If there is no parent, it is the same as x.
     * @param {number} parentY The y position of the parent. If there is no parent, it is the same as y.
     */
    drawNode(node: TreeNode, x: number, y: number, parentX: number, parentY: number) {
        if (!(node instanceof DrawableTreeNode)) return;

        // draws the content
        if (node instanceof FunctionTreeNode) {
            const drawable = node.createDrawable(x, y, parentX, parentY);
            this.drawables.push(drawable);

            // update left extreme of the tree
            this.minLeft = Math.min(this.minLeft, x);
        } else if (node instanceof PairTreeNode) {
            const drawable = node.createDrawable(x, y, parentX, parentY);
            this.drawables.push(drawable);

            // if it has a left new child, draw it
            if (node.left != null) {
                if (node.left instanceof TreeNode) {
                    this.drawLeft(node.left, x, y);
                } else {
                    // if its left child is part of a cycle and it's been drawn, link back to that node instead
                    const drawnNode = this.tree.getNodeById(node.left);
                    this.backwardLeftEdge(x, y, drawnNode.drawableX ?? 0, drawnNode.drawableY ?? 0);
                }
            }

            if (node.right != null) {
                if (node.right instanceof TreeNode) {
                    this.drawRight(node.right, x, y);
                } else {
                    const drawnNode = this.tree.getNodeById(node.right);
                    this.backwardRightEdge(x, y, drawnNode.drawableX ?? 0, drawnNode.drawableY ?? 0);
                }
            }

            // update left extreme of the tree
            this.minLeft = Math.min(this.minLeft, x);
        }
    }

    /**
     *  Draws a node to the left of its parent, making necessary left shift depending how far the structure of subtree
     *  extends to the right.
     *
     *  It first draws the individual box, then see if its children have been drawn before (by set_head and set_tail).
     *  If so, it checks the position of the children and draws an arrow pointing to the children.
     *  Otherwise, recursively draws the children, or a slash in case of empty lists.
     */
    drawLeft(node: TreeNode, parentX: number, parentY: number) {
        let count: number;
        // checks if it has a right child, how far it extends to the right direction
        if (node.right instanceof DrawableTreeNode) {
            count = 1 + this.shiftScaleCount(node.right);
        } else {
            count = 0;
        }
        // shifts left accordingly
        const x = parentX - Config.DistanceX - count * Config.DistanceX;
        const y = parentY + Config.DistanceY;

        this.drawNode(node, x, y, parentX, parentY);
    }

    /**
     *  Draws a node to the right of its parent, making necessary right shift depending how far the structure of subtree
     *  extends to the left.
     *
     *  It first draws the individual box, then see if it's children have been drawn before (by set_head and set_tail).
     *  If so, it checks the position of the children and draws an arrow pointing to the children.
     *  Otherwise, recursively draws the children, or a slash in case of empty lists.
     */
    drawRight(node: TreeNode, parentX: number, parentY: number) {
        let count: number;
        if (node.left instanceof DrawableTreeNode) {
            count = 1 + this.shiftScaleCount(node.left);
        } else {
            count = 0;
        }
        const x = parentX + Config.DistanceX + count * Config.DistanceX;
        const y = parentY + Config.DistanceY;

        this.drawNode(node, x, y, parentX, parentY);
    }

    /**
       * Returns the distance necessary for the shift of each node, calculated recursively.
       */
    shiftScaleCount(node: TreeNode) {
        let count = 0;
        // if there is something on the left, it needs to be shifted to the right for 1 + how far that right child shifts
        if (node.left instanceof DrawableTreeNode) {
            count = count + 1 + this.shiftScaleCount(node.left);
        }
        // if there is something on the right, it needs to be shifted to the left for 1 + how far that left child shifts
        if (node.right instanceof DrawableTreeNode) {
            count = count + 1 + this.shiftScaleCount(node.right);
        }
        return count;
    }

    /**
     *  Connects a box to a previously known box, the arrow path is more complicated.
     *  After coming out of the starting box, it moves to the left or the right for a short distance,
     *  Then goes to the correct y-value and turns to reach the top of the end box.
     *  It then directly points to the end box. All turnings are 90 degress.
     */
    backwardLeftEdge(x1: number, y1: number, x2: number, y2: number) {
        // coordinates of all the turning points, except the first segment in the path
        let path: number[];
        if (x1 > x2 && y1 >= (y2 - Config.BoxHeight - 1)) {
            // lower right to upper left
            path = [
                //x1 + tcon.boxWidth/4, y1 + tcon.boxHeight/2,
                x1 + Config.BoxWidth / 4,
                y1 + Config.BoxSpacingY * 3 / 4,
                x2 - Config.BoxSpacingX / 4,
                y1 + Config.BoxSpacingY * 3 / 4,
                x2 - Config.BoxSpacingX / 4,
                y2 - Config.BoxSpacingY * 3 / 8,
                x2 + Config.BoxWidth / 4 - Config.ArrowSpaceH,
                y2 - Config.BoxSpacingY * 3 / 8,
                x2 + Config.BoxWidth / 4 - Config.ArrowSpaceH,
                y2 - Config.ArrowSpace
            ];
        } else if (x1 <= x2 && y1 >= (y2 - Config.BoxHeight - 1)) {
            // lower left to upper right
            path = [
                //x1 + tcon.boxWidth/4, y1 + tcon.boxHeight/2,
                x1 + Config.BoxWidth / 4,
                y1 + Config.BoxSpacingY * 3 / 4,
                x1 - Config.BoxSpacingX / 4,
                y1 + Config.BoxSpacingY * 3 / 4,
                x1 - Config.BoxSpacingX / 4,
                y2 - Config.BoxSpacingY * 3 / 8,
                x2 + Config.BoxWidth / 4 - Config.ArrowSpaceH,
                y2 - Config.BoxSpacingY * 3 / 8,
                x2 + Config.BoxWidth / 4 - Config.ArrowSpaceH,
                y2 - Config.ArrowSpace
            ];
        } else if (x1 > x2) {
            // upper right to lower left
            path = [
                //x1 + tcon.boxWidth/4, y1 + tcon.boxHeight/2,
                x1 + Config.BoxWidth / 4,
                y1 + Config.BoxSpacingY * 3 / 4,
                x1 + Config.BoxWidth / 4,
                y2 - Config.BoxSpacingY * 3 / 8,
                x2 + Config.BoxWidth / 4 + Config.ArrowSpaceH,
                y2 - Config.BoxSpacingY * 3 / 8,
                x2 + Config.BoxWidth / 4 + Config.ArrowSpaceH,
                y2 - Config.ArrowSpace
            ];
        } else {
            // upper left to lower right
            path = [
                //x1 + tcon.boxWidth/4, y1 + tcon.boxHeight/2,
                x1 + Config.BoxWidth / 4,
                y1 + Config.BoxSpacingY * 3 / 4,
                x1 + Config.BoxWidth / 4,
                y2 - Config.BoxSpacingY * 3 / 8,
                x2 + Config.BoxWidth / 4 - Config.ArrowSpaceH,
                y2 - Config.BoxSpacingY * 3 / 8,
                x2 + Config.BoxWidth / 4 - Config.ArrowSpaceH,
                y2 - Config.ArrowSpace
            ];
        }
        const endX = path[path.length - 2];
        const endY = path[path.length - 1];
        const arrowPath = [
            endX - Math.cos(Math.PI / 2 - Config.ArrowAngle) * Config.ArrowLength,
            endY - Math.sin(Math.PI / 2 - Config.ArrowAngle) * Config.ArrowLength,
            endX,
            endY,
            endX + Math.cos(Math.PI / 2 - Config.ArrowAngle) * Config.ArrowLength,
            endY - Math.sin(Math.PI / 2 - Config.ArrowAngle) * Config.ArrowLength
        ];
        // pointy arrow
        const arrow = <Line
            points={arrowPath}
            strokeWidth={Config.StrokeWidth}
            stroke={'white'} />;

        // first segment of the path
        const pointerHead = <Line
            points={[
                x1 + Config.BoxWidth / 4,
                y1 + Config.BoxHeight / 2,
                x1 + Config.BoxWidth / 4,
                y1 + Config.BoxSpacingY * 3 / 4
            ]}
            strokeWidth={Config.StrokeWidth}
            stroke={'white'} />;

        // following segments of the path
        const pointer = <Line
            points={path}
            strokeWidth={Config.StrokeWidth}
            stroke={'white'} />

        this.drawables.push(pointerHead);
        this.drawables.push(pointer);
        this.drawables.push(arrow);
        // since arrow path is complicated, move to bottom in case it covers some other box

        // TODO: Fix this
        // pointer.moveToBottom();
    }

    /**
     *  Same as backwardLeftEdge
     */
    backwardRightEdge(x1: number, y1: number, x2: number, y2: number) {
        let path: number[];
        if (x1 > x2 && y1 > (y2 - Config.BoxHeight - 1)) {
            path = [
                //x1 + tcon.boxWidth*3/4, y1 + tcon.boxHeight/2,
                x1 + Config.BoxWidth * 3 / 4,
                y1 + Config.BoxSpacingY * 3 / 4,
                x1 + Config.BoxWidth + Config.BoxSpacingX / 4,
                y1 + Config.BoxSpacingY * 3 / 4,
                x1 + Config.BoxWidth + Config.BoxSpacingX / 4,
                y2 - Config.BoxSpacingY * 3 / 8,
                x2 + Config.BoxWidth / 4 + Config.ArrowSpaceH,
                y2 - Config.BoxSpacingY * 3 / 8,
                x2 + Config.BoxWidth / 4 + Config.ArrowSpaceH,
                y2 - Config.ArrowSpace
            ];
        } else if (x1 <= x2 && y1 > (y2 - Config.BoxHeight - 1)) {
            path = [
                //x1 + tcon.boxWidth*3/4, y1 + tcon.boxHeight/2,
                x1 + Config.BoxWidth * 3 / 4,
                y1 + Config.BoxSpacingY * 3 / 4,
                x2 + Config.BoxWidth + Config.BoxSpacingX / 4,
                y1 + Config.BoxSpacingY * 3 / 4,
                x2 + Config.BoxWidth + Config.BoxSpacingX / 4,
                y2 - Config.BoxSpacingY * 3 / 8,
                x2 + Config.BoxWidth / 4 + Config.ArrowSpaceH,
                y2 - Config.BoxSpacingY * 3 / 8,
                x2 + Config.BoxWidth / 4 + Config.ArrowSpaceH,
                y2 - Config.ArrowSpace
            ];
        } else if (x1 > x2) {
            path = [
                //x1 + tcon.boxWidth*3/4, y1 + tcon.boxHeight/2,
                x1 + Config.BoxWidth * 3 / 4,
                y1 + Config.BoxSpacingY * 3 / 4,
                x1 + Config.BoxWidth * 3 / 4,
                y2 - Config.BoxSpacingY * 3 / 8 + 7,
                x2 + Config.BoxWidth / 4 + Config.ArrowSpaceH,
                y2 - Config.BoxSpacingY * 3 / 8 + 7,
                x2 + Config.BoxWidth / 4 + Config.ArrowSpaceH,
                y2 - Config.ArrowSpace
            ];
        } else {
            path = [
                //x1 + tcon.boxWidth*3/4, y1 + tcon.boxHeight/2,
                x1 + Config.BoxWidth * 3 / 4,
                y1 + Config.BoxSpacingY * 3 / 4,
                x1 + Config.BoxWidth * 3 / 4,
                y2 - Config.BoxSpacingY * 3 / 8,
                x2 + Config.BoxWidth / 4 - Config.ArrowSpaceH,
                y2 - Config.BoxSpacingY * 3 / 8,
                x2 + Config.BoxWidth / 4 - Config.ArrowSpaceH,
                y2 - Config.ArrowSpace
            ];
        }
        const endX = path[path.length - 2];
        const endY = path[path.length - 1];
        const arrowPath = [
            endX - Math.cos(Math.PI / 2 - Config.ArrowAngle) * Config.ArrowLength,
            endY - Math.sin(Math.PI / 2 - Config.ArrowAngle) * Config.ArrowLength,
            endX,
            endY,
            endX + Math.cos(Math.PI / 2 - Config.ArrowAngle) * Config.ArrowLength,
            endY - Math.sin(Math.PI / 2 - Config.ArrowAngle) * Config.ArrowLength
        ];
        const arrow = <Line
            points={arrowPath}
            strokeWidth={Config.StrokeWidth}
            stroke={'white'} />

        const pointerHead = <Line
            points={[
                x1 + Config.BoxWidth * 3 / 4,
                y1 + Config.BoxHeight / 2,
                x1 + Config.BoxWidth * 3 / 4,
                y1 + Config.BoxSpacingY * 3 / 4
            ]}
            strokeWidth={Config.StrokeWidth}
            stroke={'white'} />
        const pointer = <Line
            points={path}
            strokeWidth={Config.StrokeWidth}
            stroke={'white'} />

        this.drawables.push(pointerHead);
        this.drawables.push(pointer);
        this.drawables.push(arrow);

        // TODO: Fix this
        // pointer.moveToBottom();
    }
}