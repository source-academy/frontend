import Konva from 'konva';
import { Layer, Text } from 'react-konva';

import { Config } from '../Config';
import DataVisualizer from '../dataVisualizer';
import { Data, Pair } from '../dataVisualizerTypes';
import { isArray, isFunction, toText } from '../dataVisualizerUtils';
import { ArrowDrawable, BackwardArrowDrawable } from '../drawable/Drawable';
import { AlreadyParsedTreeNode } from './AlreadyParsedTreeNode';
import {
  ArrayTreeNode,
  DataTreeNode,
  DrawableTreeNode,
  FunctionTreeNode,
  TreeNode
} from './TreeNode';

/**
 *  A tree object built based on the given Data, Function or Array of
 *  data/functions/arrays.
 */
export class Tree {
  private _rootNode: TreeNode;
  private nodes: DrawableTreeNode[];

  /**
   * Constructs a tree given a root node and a list of nodes.
   * @param rootNode The root node of the tree.
   * @param nodes The memoized nodes of the tree in list form.
   */
  constructor(rootNode: TreeNode, nodes: DrawableTreeNode[]) {
    this._rootNode = rootNode;
    this.nodes = nodes;
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
    function constructNode(structure: Data): TreeNode {
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
      const node = new ArrayTreeNode();
      visitedStructures.set(tree, node);
      treeNodes[nodeCount] = node;
      nodeCount++;
      
      if (typeof tree[tree.length-1] == 'number'){
        node.nodePos=tree.pop();
      }
      //console.log(tree);
      //node.nodePos=nodeCount;
      // Done like that instead of in constructor to prevent infinite recursion
      node.children = tree.map(constructNode);

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
    TreeDrawer.colorCounter = 0;
    return new TreeDrawer(this);
  }
}

/**
 *  Drawer function of a tree
 */
class TreeDrawer {
  private tree: Tree;
  public leftCOUNTER: integer = 0;
  public rightCOUNTER: integer = 0;
  public downCOUNTER: integer = 0;
  private runningX: integer = 0;
  private runningY: integer = 0;
  private runningX2: integer = 0; // for rightCOUNTER

  private drawables: JSX.Element[];
  private nodeWidths: Map<TreeNode, number>;
  public width: number = 0;
  public height: number = 0;

  // Used to account for backward arrow
  private minX = 0;
  private minY = 0;
  public static colorCounter=0;

  constructor(tree: Tree) {
    this.tree = tree;
    this.drawables = [];
    this.nodeWidths = new Map();
  }

  /**
   *  Draws a tree at x, y, by calling drawNode on the root at x, y.
   */
  draw(x: number, y: number): JSX.Element {
    if (this.tree.rootNode instanceof DataTreeNode) {
      const text = toText(this.tree.rootNode.data);
      const textConfig = {
        text: text,
        align: 'center',
        fontStyle: 'normal',
        fontSize: 20,
        fill: Config.Stroke
      };
      const konvaText = new Konva.Text(textConfig);
      this.width = konvaText.width();
      this.height = konvaText.height();
      return (
        <Layer>
          <Text {...textConfig} />
        </Layer>
      );
    } 
    // NON-BINARY TREE WARNING
    if(!DataVisualizer.isBinTree&&DataVisualizer.getBinTreeMode()){
      return (
        <Layer>
          <Text text={'Render binary tree only supports binary trees'} align='center' fontStyle='normal' fontSize={20} fill={"red"} />
        </Layer>
      )
    }
    // NON-GENERAL TREE WARNING
    else if(!DataVisualizer.isGenTree&&DataVisualizer.getTreeMode()){
      console.log("Not general tree");
      return (
        <Layer>
          <Text text={'Render general tree only supports trees'} align='center' fontStyle='normal' fontSize={20} fill={"red"} />
        </Layer>
      )
    }
    else {
      if (DataVisualizer.getBinTreeMode()) { // RenderBinaryTree
        this.drawNode(this.tree.rootNode, x, y, x, y, 0, 0, 0, 0);
        this.width = ( this.getNodeWidth(this.tree.rootNode) - this.minX );
        this.height = ( this.getNodeHeight(this.tree.rootNode) - this.minY + Config.StrokeWidth );

        const EY1 = Math.max(this.leftCOUNTER, this.rightCOUNTER); 
        let EY2;
        if (EY1 == 0) {
          EY2 = EY1;
        } else {
          EY2 = 2 * (Math.pow(2, EY1 - 1) - 1) + 1; // how many nodegroups stretch left or right (not including root)
        }
        return (
          <Layer key={x + ', ' + y} offsetX={-(EY2 * Config.NWidth)} offsetY={this.minY}>
            {this.drawables}
          </Layer>
        );
      } else if (DataVisualizer.getTreeMode()) { // RenderGeneralTree
        this.drawNode(this.tree.rootNode, x, y, x, y, 0, 0, 0, 0);
        this.width = ( this.getNodeWidth(this.tree.rootNode) - this.minX );
        this.height = ( this.getNodeHeight(this.tree.rootNode) - this.minY + Config.StrokeWidth );

        return (
          <Layer key={x + ', ' + y} offsetX={0} offsetY={this.minY}>
            {this.drawables}
          </Layer>
        );
      } else { // OriginalView
        this.drawNode(this.tree.rootNode, x, y, x, y, 0, 0, 0, 0);
        this.width = ( this.getNodeWidth(this.tree.rootNode) - this.minX );
        this.height = ( this.getNodeHeight(this.tree.rootNode) - this.minY + Config.StrokeWidth );

        return (
          <Layer key={x + ', ' + y} offsetX={0} offsetY={this.minY}>
            {this.drawables}
          </Layer>
        );
      }
      
    }
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
  drawNode(node: TreeNode, x: number, y: number, parentX: number, parentY: number, colorIndex:number, parentIndex: number, originIndex: number, originX: number) {
    if (node instanceof AlreadyParsedTreeNode) {
      // if its child is part of a cycle and it's been drawn, link back to that node instead
      const drawnNode = node.actualNode;
      const arrowProps = {
        from: {
          x: parentX + Config.BoxWidth / 2,
          y: parentY + Config.BoxHeight / 2
        },
        to: {
          x: drawnNode.drawableX!,
          y: drawnNode.drawableY!
        }
      };

      const isBackwardArrow = arrowProps.from.y >= arrowProps.to.y;

      let arrow: JSX.Element;

      if (isBackwardArrow) {
        // Update the minX and minY, in case overflow to the top or left happens
        this.minX = Math.min(
          this.minX,
          drawnNode.drawableX! - Config.ArrowMarginHorizontal - Config.StrokeWidth / 2
        );
        this.minY = Math.min(
          this.minY,
          drawnNode.drawableY! - Config.ArrowMarginTop - Config.StrokeWidth / 2
        );
        arrow = (
          <BackwardArrowDrawable key={'Arrow (back)' + parentX + x + parentY + y} {...arrowProps} />
        );
      } else {
        arrow = <ArrowDrawable key={'Arrow' + parentX + x + parentY + y} {...arrowProps} />;
      }
      this.drawables.push(arrow);
    }

    if (!(node instanceof DrawableTreeNode)) return;

    // draws the content
    if (node instanceof FunctionTreeNode) {
      const drawable = node.createDrawable(x, y, parentX, parentY, 0);
      this.drawables.push(drawable);
    } else if (node instanceof ArrayTreeNode) {
      if (DataVisualizer.getBinTreeMode()) { // RenderBinaryTree
        const drawable = node.createDrawable(x, y, parentX, parentY, colorIndex);
        this.drawables.push(drawable);

        node.children?.forEach((childNode, index) => {
          let myY;
          let myX;
          let scalerV = Math.round( Math.pow(2, DataVisualizer.binaryTreeDepth) / 
                                    Math.pow(2, (Math.round(y / (6 * Config.BoxHeight)))) );
          scalerV--;

          if (index == 0 && y == parentY + Config.DistanceY) { // NEW left branch
            myY = y + Config.DistanceY * 2;
            myX = x - Config.NWidth * scalerV;
            TreeDrawer.colorCounter++;
            colorIndex=TreeDrawer.colorCounter;
          } else if (index == 0) { // NEW right branch
            myY = y + Config.DistanceY * 2;
            myX = x + Config.NWidth * scalerV;
            colorIndex=TreeDrawer.colorCounter;
          } else if (y == parentY + Config.DistanceY) { // third box
            myY = y;
            myX = x + Config.NWidth * 2;
            colorIndex=parentIndex;
          } else { // second box
            myY = y + Config.DistanceY;
            myX = x - Config.NWidth;
            colorIndex=parentIndex;
          }
        
          if (x < this.runningX && index == 0 && y == parentY + Config.DistanceY) { // NEW left branches that stretch towards the left
            this.leftCOUNTER++;
            this.runningX = myX;
          } else if (x > this.runningX2 && index == 0 && y == parentY + Config.DistanceY) { // NEW right branches that stretch towards the right
            this.rightCOUNTER++;
            this.runningX2 = myX;
          }

          if (y > this.runningY && index == 0) { // NEW branches (doesn't matter left or right) that stretches down
            this.downCOUNTER++;
            this.runningY = myY;
          }

          this.drawNode(childNode, myX, myY, x + Config.BoxWidth * index, y, colorIndex, colorIndex, 0, 0);
        });
      }
      else if (DataVisualizer.getTreeMode()) {  // RenderGeneralTree
        const drawable = node.createDrawable(x, y, parentX, parentY, colorIndex);
        this.drawables.push(drawable);

        const longest = DataVisualizer.nodeCount[0]; // e.g. 3
        this.runningX2 = (Config.NWidth + Config.BoxWidth) * (longest + 1);
        this.downCOUNTER = DataVisualizer.binaryTreeDepth;

        node.children?.forEach((childNode, index) => {
          let myY;
          let myX;
          const scalerV = Math.round( Math.pow(longest, DataVisualizer.binaryTreeDepth) / 
                                    Math.pow(longest, (Math.round(y / (Config.BoxHeight * 4))) + 1) );
        
          /*
          if (node.children[1] instanceof ArrayTreeNode) {
            if (node.children[1].children[0] instanceof ArrayTreeNode) {
              console.log("Origin Index: " + node.children[1].nodePos + ", Value: " + node.children[1].children[0].children[0].data);
            }
          }
            */

          if (index == 0) {
            if (node.children[0] instanceof ArrayTreeNode) {
              console.log("Origin Index: " + originIndex + ", Value: " + node.children[0].children[0].data);
            }
            myY = y + Config.DistanceY * 2;
            myX = originX + (Config.NWidth + Config.BoxWidth) * (longest + 1) * (originIndex - 1) * scalerV;
            TreeDrawer.colorCounter++;
            colorIndex = TreeDrawer.colorCounter;
          } else {
            myY = y;
            myX = x + Config.NWidth + Config.BoxWidth;
            colorIndex = parentIndex;
          }

          if (x > this.runningX2 && index == 0 && y == parentY + Config.DistanceY * 2) { // NEW right branches that stretch towards the right
            this.rightCOUNTER++;
            this.runningX2 = myX;
          }

          if (node.children[1] instanceof ArrayTreeNode) {
            if (node.children[1].children[0] instanceof ArrayTreeNode) {
              originIndex = node.children[1].nodePos;
              originX = myX - (Config.NWidth + Config.BoxWidth) * originIndex;
            }
          }

          this.drawNode(childNode, myX, myY, x + Config.BoxWidth * index, y, colorIndex, colorIndex, originIndex, originX);
        });
      }
      else { // OriginalView
        console.log(node);
        const drawable = node.createDrawable(x, y, parentX, parentY, 0);
        this.drawables.push(drawable);
        let leftX = x;
        node.children?.forEach((childNode, index) => {
          const childY = childNode instanceof AlreadyParsedTreeNode ? y : y + Config.DistanceY;
          this.drawNode(childNode, leftX, childY, x + Config.BoxWidth * index, y, 0, 0, 0, 0);
          const childNodeWidth = this.getNodeWidth(childNode);
          leftX += childNodeWidth ? childNodeWidth + Config.DistanceX : 0;
        });
      }
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
      return Config.CircleRadiusLarge * 4 + 2 * Config.StrokeWidth;
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
          node.children.length * Config.BoxWidth + Config.StrokeWidth,
          childrenWidth,
          Config.BoxMinWidth + Config.StrokeWidth
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
    if (node instanceof DataTreeNode) {
      return 0;
    } else if (node instanceof FunctionTreeNode) {
      return Config.BoxHeight;
    } else if (node instanceof AlreadyParsedTreeNode) {
      return Config.ArrowMarginBottom;
    } else if (node instanceof ArrayTreeNode) {
      // Height of array node is BoxHeight + StrokeWidth / 2 + max(childrenHeights)
      return (
        (node.children ?? [])
          .map(child => {
            const childHeight = this.getNodeHeight(child);
            return childHeight + (child instanceof DrawableTreeNode ? Config.DistanceY / 2 : 0);
          })
          .filter(height => height > 0)
          .reduce((x, y) => Math.max(x, y), 0) + Config.BoxHeight
      );
    } else {
      return 0;
    }
  }
}
