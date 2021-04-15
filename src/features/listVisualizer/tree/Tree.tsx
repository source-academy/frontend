import { Layer, Line, Text } from 'react-konva';

import { Config } from '../Config';
import { Data, Pair } from '../ListVisualizerTypes';
import { isArray, isFunction, toText } from '../ListVisualizerUtils';
import { AlreadyParsedTreeNode } from './AlreadyParsedTreeNode';
import {
  ArrayTreeNode,
  DataTreeNode,
  DrawableTreeNode,
  FunctionTreeNode,
  TreeNode
} from './TreeNode';

/**
 *  A tree object built based on a list or pair.
 */
export class Tree {
  private _rootNode: TreeNode;
  // private _actual;
  private nodes: DrawableTreeNode[];

  /**
   * Constructs a tree given a root node and a list of nodes.
   * @param rootNode The root node of the tree.
   * @param nodes The memoized nodes of the tree in list form.
   */
  constructor(rootNode: TreeNode, nodes: DrawableTreeNode[]) {
    this._rootNode = rootNode;
    this.nodes = nodes;
    // this._actual = rootNode?.children[0];
  }

  /**
   * The root node of the tree.
   */
  get rootNode(): TreeNode {
    return this._rootNode;
  }

  /**
   * Returns the memoized node of the given id.
   * @param id The id of the node.
   */
  getNodeById(id: number): DrawableTreeNode {
    return this.nodes[id];
  }

  static fromSourceStructure(tree: Data): Tree {
    let nodeCount = 0;

    function constructNode(structure: Data) : TreeNode {
      console.log(structure, visitedStructures.get(structure));
      const alreadyDrawnNode = visitedStructures.get(structure);
      if (alreadyDrawnNode !== undefined) {
        return new AlreadyParsedTreeNode(alreadyDrawnNode);
      }
      return isArray(structure)
          ? constructTree(structure)
          : isFunction(structure)
          ? constructFunction(structure)
          : constructData(structure);
    }

    /**
     * Returns a node representing the given tree as a pair.
     * Also memoizes the pair object, for the case where the
     * pair appears multiple times in the data structure.
     * @param tree The Source tree to construct a node for.
     */
    function constructTree(tree: Array<Data>) {
      const node = new ArrayTreeNode(tree.map(constructNode));

      visitedStructures.set(tree, node);
      treeNodes[nodeCount] = node;
      nodeCount++;

      return node;
    }

    /**
     * Returns a node representing the given function.
     * Also memoizes the function object, for the case where the
     * function appears multiple times in the data structure.
     * @param func The function to construct a node for.
     */
    function constructFunction(func: Function) {
      const node = new FunctionTreeNode();

      // memoise current function
      visitedStructures.set(func, node);
      treeNodes[nodeCount] = node;
      nodeCount++;

      return node;
    }

    /**
     * Returns a node representing the given data.
     * Anything except functions and pairs are considered data, including empty lists.
     * @param data The data to construct a node for.
     */
    function constructData(data: Data) {
      return new DataTreeNode(data);
    }

    const visitedStructures: Map<Function | Pair | Array<Data>, DrawableTreeNode> = new Map(); // detects cycles
    const treeNodes: DrawableTreeNode[] = [];
    const rootNode = constructNode(tree);

    return new Tree(rootNode, treeNodes);
  }

  draw(): TreeDrawer {
    return new TreeDrawer(this);
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
  private nodeWidths: Map<TreeNode, number>;
  public width: number = 0;
  public height: number = 0;

  constructor(tree: Tree) {
    this.tree = tree;
    this.drawables = [];
    this.nodeWidths = new Map();
  }

  /**
   *  Draws a tree at x, y, by calling drawNode on the root at x, y.
   */
  draw(x: number, y: number): JSX.Element {
    const layer =
     this.tree.rootNode instanceof DataTreeNode ? (
        <Layer>
          <Text
            text={toText(this.tree.rootNode.data, true)}
            align={'center'}
            fontStyle={'normal'}
            fontSize={20}
            fill={'white'}
          />
        </Layer>
      ) : (
        (() => {
          this.drawNode(this.tree.rootNode, x, y, x, y);
          return (
            <Layer width={this.getNodeWidth(this.tree.rootNode)} offsetY={0}>
              {this.drawables}
            </Layer>
          );
        })()
      );
    this.width = this.getNodeWidth(this.tree.rootNode);
    this.height = this.getNodeHeight(this.tree.rootNode);
    return layer;
  }

  /**
   *  Draws the box for the pair representing the tree, then recursively draws its children.
   *  A slash is drawn for empty lists.
   *
   *  If a child node has been drawn previously, an arrow is drawn pointing to the children,
   *  instead of drawing the child node again.
   * @param node The node to draw.
   * @param x The x position to draw at.
   * @param y The y position to draw at.
   * @param parentX The x position of the parent. If there is no parent, it is the same as x.
   * @param parentY The y position of the parent. If there is no parent, it is the same as y.
   */
  drawNode(node: TreeNode, x: number, y: number, parentX: number, parentY: number) {
    if (node instanceof AlreadyParsedTreeNode) {
      // if its left child is part of a cycle and it's been drawn, link back to that node instead
      const drawnNode = node.actualNode;
      this.backwardLeftEdge(
        parentX,
        parentY,
        drawnNode.drawableX ?? 0,
        drawnNode.drawableY ?? 0
      );
    }


    if (!(node instanceof DrawableTreeNode)) return;

    // draws the content
    if (node instanceof FunctionTreeNode) {
      const drawable = node.createDrawable(x, y, parentX, parentY);
      this.drawables.push(drawable);

      // update left extreme of the tree
      this.minLeft = Math.min(this.minLeft, x);
    } else if (node instanceof ArrayTreeNode) {
      const drawable = node.createDrawable(x, y, parentX, parentY);
      this.drawables.push(drawable);

      // if it has children, draw them
      // const width = this.getNodeWidth(node);
      let leftX = x;
      node.children?.forEach((childNode, index) => {
        if (childNode instanceof AlreadyParsedTreeNode) {
          this.drawNode(childNode, leftX, y, x + Config.BoxWidth * index, y);
          const childNodeWidth = this.getNodeWidth(childNode);
          leftX += childNodeWidth ? childNodeWidth + Config.DistanceX : 0;
        } else if (childNode instanceof TreeNode) {
          this.drawNode(childNode, leftX, y + Config.DistanceY, x + Config.BoxWidth * index, y);
          const childNodeWidth = this.getNodeWidth(childNode);
          leftX += childNodeWidth ? childNodeWidth + Config.DistanceX : 0;
        }
      });

      // if (node.right != null) {
      //   if (node.right instanceof TreeNode) {
      //     this.drawRight(node.right, x, y);
      //   } else {
      //     const drawnNode = this.tree.getNodeById(node.right);
      //     this.backwardRightEdge(x, y, drawnNode.drawableX ?? 0, drawnNode.drawableY ?? 0);
      //   }
      // }

      // update left extreme of the tree
      this.minLeft = Math.min(this.minLeft, x);
    }
  }

  /**
   * Returns the width taken up by the node in pixels.
   * @param node The node to calculate the width of.
   */
  getNodeWidth(node: TreeNode): number {
    if (node instanceof DataTreeNode || node instanceof AlreadyParsedTreeNode) {
      return 0;
    } else if (node instanceof FunctionTreeNode) {
      return Config.BoxWidth;
    } else if (node instanceof ArrayTreeNode) {
      if (this.nodeWidths.has(node)) {
        return this.nodeWidths.get(node) ?? 0;
      } else if (node.children != null) {
        const childrenWidths = node.children
          .map(node => this.getNodeWidth(node))
          .filter(x => x > 0);
        const childrenWidth =
          childrenWidths.length > 0 ? childrenWidths.reduce((x, y) => x + y + Config.DistanceX) : 0;
        const nodeWidth = Math.max(
          node.children.length * Config.BoxWidth + 2 * Config.StrokeWidth,
          childrenWidth
        );
        this.nodeWidths.set(node, nodeWidth);
        return nodeWidth;
      } else {
        return 0;
      }
    } else {
      return 0;
    }
  }

  /**
   * Returns the height taken up by the node in pixels.
   * @param node The node to calculate the width of.
   */
  getNodeHeight(node: TreeNode): number {
    function helper(node: TreeNode): number {
      if (node instanceof DataTreeNode || node instanceof AlreadyParsedTreeNode) {
        return 0;
      } else if (node.children) {
        return (
          node.children
            .map(child => (child instanceof TreeNode ? helper(child) : 0))
            .filter(height => height > 0)
            .reduce((x, y) => Math.max(x, y) + Config.DistanceY, 0) + Config.BoxHeight
        );
      } else {
        return 0;
      }
    }

    return helper(node);
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
    if (x1 > x2 && y1 >= y2 - Config.BoxHeight - 1) {
      // lower right to upper left
      path = [
        //x1 + tcon.boxWidth/4, y1 + tcon.boxHeight/2,
        x1 + Config.BoxWidth / 2,
        y1 + (Config.BoxSpacingY * 3) / 4,
        x2 - Config.BoxSpacingX / 2,
        y1 + (Config.BoxSpacingY * 3) / 4,
        x2 - Config.BoxSpacingX / 2,
        y2 - (Config.BoxSpacingY * 3) / 8,
        x2 + Config.BoxWidth / 2 - Config.ArrowSpaceH,
        y2 - (Config.BoxSpacingY * 3) / 8,
        x2 + Config.BoxWidth / 2 - Config.ArrowSpaceH,
        y2 - Config.ArrowSpace
      ];
    } else if (x1 <= x2 && y1 >= y2 - Config.BoxHeight - 1) {
      // lower left to upper right
      path = [
        //x1 + tcon.boxWidth/4, y1 + tcon.boxHeight/2,
        x1 + Config.BoxWidth / 4,
        y1 + (Config.BoxSpacingY * 3) / 4,
        x1 - Config.BoxSpacingX / 4,
        y1 + (Config.BoxSpacingY * 3) / 4,
        x1 - Config.BoxSpacingX / 4,
        y2 - (Config.BoxSpacingY * 3) / 8,
        x2 + Config.BoxWidth / 4 - Config.ArrowSpaceH,
        y2 - (Config.BoxSpacingY * 3) / 8,
        x2 + Config.BoxWidth / 4 - Config.ArrowSpaceH,
        y2 - Config.ArrowSpace
      ];
    } else if (x1 > x2) {
      // upper right to lower left
      path = [
        //x1 + tcon.boxWidth/4, y1 + tcon.boxHeight/2,
        x1 + Config.BoxWidth / 4,
        y1 + (Config.BoxSpacingY * 3) / 4,
        x1 + Config.BoxWidth / 4,
        y2 - (Config.BoxSpacingY * 3) / 8,
        x2 + Config.BoxWidth / 4 + Config.ArrowSpaceH,
        y2 - (Config.BoxSpacingY * 3) / 8,
        x2 + Config.BoxWidth / 4 + Config.ArrowSpaceH,
        y2 - Config.ArrowSpace
      ];
    } else {
      // upper left to lower right
      path = [
        //x1 + tcon.boxWidth/4, y1 + tcon.boxHeight/2,
        x1 + Config.BoxWidth / 4,
        y1 + (Config.BoxSpacingY * 3) / 4,
        x1 + Config.BoxWidth / 4,
        y2 - (Config.BoxSpacingY * 3) / 8,
        x2 + Config.BoxWidth / 4 - Config.ArrowSpaceH,
        y2 - (Config.BoxSpacingY * 3) / 8,
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
    const arrow = <Line points={arrowPath} strokeWidth={Config.StrokeWidth} stroke={'white'} />;

    // first segment of the path
    const pointerHead = (
      <Line
        points={[
          x1 + Config.BoxWidth / 2,
          y1 + Config.BoxHeight / 2,
          x1 + Config.BoxWidth / 2,
          y1 + (Config.BoxSpacingY * 3) / 4
        ]}
        strokeWidth={Config.StrokeWidth}
        stroke={'white'}
      />
    );

    // following segments of the path
    const pointer = <Line points={path} strokeWidth={Config.StrokeWidth} stroke={'white'} />;

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
    if (x1 > x2 && y1 > y2 - Config.BoxHeight - 1) {
      path = [
        //x1 + tcon.boxWidth*3/4, y1 + tcon.boxHeight/2,
        x1 + (Config.BoxWidth * 3) / 4,
        y1 + (Config.BoxSpacingY * 3) / 4,
        x1 + Config.BoxWidth + Config.BoxSpacingX / 4,
        y1 + (Config.BoxSpacingY * 3) / 4,
        x1 + Config.BoxWidth + Config.BoxSpacingX / 4,
        y2 - (Config.BoxSpacingY * 3) / 8,
        x2 + Config.BoxWidth / 4 + Config.ArrowSpaceH,
        y2 - (Config.BoxSpacingY * 3) / 8,
        x2 + Config.BoxWidth / 4 + Config.ArrowSpaceH,
        y2 - Config.ArrowSpace
      ];
    } else if (x1 <= x2 && y1 > y2 - Config.BoxHeight - 1) {
      path = [
        //x1 + tcon.boxWidth*3/4, y1 + tcon.boxHeight/2,
        x1 + (Config.BoxWidth * 3) / 4,
        y1 + (Config.BoxSpacingY * 3) / 4,
        x2 + Config.BoxWidth + Config.BoxSpacingX / 4,
        y1 + (Config.BoxSpacingY * 3) / 4,
        x2 + Config.BoxWidth + Config.BoxSpacingX / 4,
        y2 - (Config.BoxSpacingY * 3) / 8,
        x2 + Config.BoxWidth / 4 + Config.ArrowSpaceH,
        y2 - (Config.BoxSpacingY * 3) / 8,
        x2 + Config.BoxWidth / 4 + Config.ArrowSpaceH,
        y2 - Config.ArrowSpace
      ];
    } else if (x1 > x2) {
      path = [
        //x1 + tcon.boxWidth*3/4, y1 + tcon.boxHeight/2,
        x1 + (Config.BoxWidth * 3) / 4,
        y1 + (Config.BoxSpacingY * 3) / 4,
        x1 + (Config.BoxWidth * 3) / 4,
        y2 - (Config.BoxSpacingY * 3) / 8 + 7,
        x2 + Config.BoxWidth / 4 + Config.ArrowSpaceH,
        y2 - (Config.BoxSpacingY * 3) / 8 + 7,
        x2 + Config.BoxWidth / 4 + Config.ArrowSpaceH,
        y2 - Config.ArrowSpace
      ];
    } else {
      path = [
        //x1 + tcon.boxWidth*3/4, y1 + tcon.boxHeight/2,
        x1 + (Config.BoxWidth * 3) / 4,
        y1 + (Config.BoxSpacingY * 3) / 4,
        x1 + (Config.BoxWidth * 3) / 4,
        y2 - (Config.BoxSpacingY * 3) / 8,
        x2 + Config.BoxWidth / 4 - Config.ArrowSpaceH,
        y2 - (Config.BoxSpacingY * 3) / 8,
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
    const arrow = <Line points={arrowPath} strokeWidth={Config.StrokeWidth} stroke={'white'} />;

    const pointerHead = (
      <Line
        points={[
          x1 + (Config.BoxWidth * 3) / 4,
          y1 + Config.BoxHeight / 2,
          x1 + (Config.BoxWidth * 3) / 4,
          y1 + (Config.BoxSpacingY * 3) / 4
        ]}
        strokeWidth={Config.StrokeWidth}
        stroke={'white'}
      />
    );
    const pointer = <Line points={path} strokeWidth={Config.StrokeWidth} stroke={'white'} />;

    this.drawables.push(pointerHead);
    this.drawables.push(pointer);
    this.drawables.push(arrow);

    // TODO: Fix this
    // pointer.moveToBottom();
  }
}
