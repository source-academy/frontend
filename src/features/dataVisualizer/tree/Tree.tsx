import Konva from 'konva';
import type { JSX } from 'react';
import { Layer, Text } from 'react-konva';

import { Config } from '../Config';
import DataVisualizer from '../dataVisualizer';
import { Data, Pair } from '../dataVisualizerTypes';
import { isArray, isFunction, toText } from '../dataVisualizerUtils';
import { ArrowDrawable, BackwardArrowDrawable } from '../drawable/Drawable';
import { AlreadyParsedTreeNode } from './AlreadyParsedTreeNode';
import { BinaryTreeDrawer } from './BinaryTreeDrawer';
import { GeneralTreeDrawer } from './GeneralTreeDrawer';
import { OriginalTreeDrawer } from './OriginalTreeDrawer';
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
    const genTreeChecker = DataVisualizer.getTreeMode();
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

      if (genTreeChecker) {
        node.nodeColor = tree[tree.length - 1];
        tree.pop();
        node.nodePos = tree[tree.length - 1];
        tree.pop();
      }
      if (DataVisualizer.getBinTreeMode()) {
        node.nodeColor = tree[tree.length - 1];
        tree.pop();
      }

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

  draw(): OriginalTreeDrawer | BinaryTreeDrawer | GeneralTreeDrawer {
    OriginalTreeDrawer.colorCounter = 0;
    if (DataVisualizer.getBinTreeMode()) {
      return new BinaryTreeDrawer(this);
    } else if (DataVisualizer.getTreeMode()) {
      return new GeneralTreeDrawer(this);
    } else {
      return new OriginalTreeDrawer(this);
    }
  }
}
