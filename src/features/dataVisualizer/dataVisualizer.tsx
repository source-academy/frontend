import type { JSX } from 'react';

import { Config } from './Config';
import { Data, Step } from './dataVisualizerTypes';
import { Tree } from './tree/Tree';
import { DataTreeNode } from './tree/TreeNode';

/**
 * The data visualizer class.
 * Exposes three function: init, drawData, and clear.
 *
 * init is used by SideContentDataVisualizer as a hook.
 * drawData is the draw_data function in source.
 * clear is used by WorkspaceSaga to reset the visualizer after every "Run" button press
 */
export default class DataVisualizer {
  private static empty() {}
  private static setSteps: (step: Step[]) => void = DataVisualizer.empty;
  public static dataRecords: Data[] = [];
  public static isRedraw = false;
  private static _instance = new DataVisualizer();
  public static treeMode = false;
  public static BinTreeMode = false;
  public static normalMode = true;
  public static TreeDepth = 0;
  public static isBinTree = false;
  public static isGenTree = false;
  public static nodeCount: number[] = [];
  public static nodeColor: number[] = [];
  public static longestNodePos: number = 0;
  public static colorMap: WeakMap<any, number> = new WeakMap();
  public static posMap: WeakMap<any, number> = new WeakMap();

  private steps: Step[] = [];
  private nodeLabel = 0;
  private nodeToLabelMap: Map<DataTreeNode, number> = new Map();

  private constructor() {}

  public static isBinaryTree(structures: Data[], data: any): boolean {
    if (structures == null) {
      return true;
    }
    if (!(structures instanceof Array)) {
      return false;
    }
    if (structures[0] === null) {
      return true;
    }
    if (structures.length != 2 || !(structures[1] instanceof Array)) {
      return false;
    }
    if (data != null && !(structures[0] instanceof Array) && typeof structures[0] != typeof data) {
      return false;
    }
    let next = structures[1];
    data = structures[0];

    let ans = false;
    let count = 0;
    while (next instanceof Array) {
      if (!(next[0] instanceof Array) && typeof next[0] == typeof structures[0]) {
        return false;
      }
      count++;
      next = next[1];
    }
    if (count == 2) {
      ans = true;
    }
    //further checks to ensure that the left and right subtrees are also binary trees and structures can be accessed
    const left = structures[1];
    const right = structures[1][1];
    if (left instanceof Array && right instanceof Array) {
      return ans && this.isBinaryTree(left[0], data) && this.isBinaryTree(right[0], data);
    } else {
      return false;
    }
  }

  public static isGeneralTree(structures: Data[], data: any): boolean {
    console.log(structures);
    console.log(data);
    if (structures == null) {
      return true;
    }
    if (
      data != null &&
      !(structures[0] instanceof Array) &&
      typeof structures[0] != typeof data &&
      structures[0] != null
    ) {
      return false;
    }
    if (structures.length == 2 && structures[1] == null) {
      if (structures[0] instanceof Array) {
        return this.isGeneralTree(structures[0], data);
      }
      return true;
    }
    if (!(structures[0] instanceof Array) && structures[1] != null) {
      if (!(structures[0] instanceof Array)) {
        data = structures[0];
      }
      return this.isGeneralTree(structures[1], data);
    }
    if (structures.length != 2 || (!(structures[1] instanceof Array) && structures[1] != null)) {
      return false;
    }
    return this.isGeneralTree(structures[1], data) && this.isGeneralTree(structures[0], data);
  }

  public static initializeTreeMetaData(
    structures: Data[],
    depth: number,
    nodePos: number,
    newNode: boolean
  ): number {
    if (!(structures instanceof Array)) {
      return 0;
    }
    // nodeCount keeps track of the current index of nodes at each depth
    if (this.getTreeMode()) {
      if (this.nodeCount[depth] === undefined) {
        this.nodeCount[depth] = 0;
      }
      this.posMap.set(structures, this.nodeCount[depth]);
      if (this.nodeCount[depth] > this.longestNodePos) {
        this.longestNodePos = this.nodeCount[depth];
      }
      this.nodeCount[depth]++;
    }
    if (this.getBinTreeMode() || this.getTreeMode()) {
      if (this.nodeColor[depth] === undefined) {
        this.nodeColor[depth] = depth;
      }
      if (newNode) {
        this.nodeColor[depth]++;
      }
      this.colorMap.set(structures, this.nodeColor[depth]);
    }

    this.TreeDepth = Math.max(this.TreeDepth, depth);
    this.initializeTreeMetaData(structures[0], depth + 1, 0, true);
    this.initializeTreeMetaData(structures[1], depth, nodePos + 1, false);
    return depth;
  }

  public static init(setSteps: (step: Step[]) => void): void {
    DataVisualizer.setSteps = setSteps;
  }

  /**
   * Set the visualization mode. This ensures only one mode is active at a time.
   * @param mode - 'normal' for original view, 'binTree' for binary tree, 'tree' for general tree
   */
  public static setMode(mode: 'normal' | 'binTree' | 'tree'): void {
    DataVisualizer.normalMode = mode === 'normal';
    DataVisualizer.BinTreeMode = mode === 'binTree';
    DataVisualizer.treeMode = mode === 'tree';
  }

  // RenderBinaryTree
  public static toggleBinTreeMode(): void {
    DataVisualizer.BinTreeMode = !DataVisualizer.BinTreeMode;
  }

  // RenderGeneralTree
  public static toggleTreeMode(): void {
    DataVisualizer.treeMode = !DataVisualizer.treeMode;
  }

  // OriginalView
  public static toggleNormalMode(): void {
    DataVisualizer.normalMode = !DataVisualizer.normalMode;
  }

  public static getBinTreeMode(): boolean {
    return DataVisualizer.BinTreeMode;
  }

  public static getTreeMode(): boolean {
    return DataVisualizer.treeMode;
  }

  public static getNormalMode(): boolean {
    return DataVisualizer.normalMode;
  }

  public static hasCycle(structures: Data, visited: WeakSet<object> = new WeakSet()): boolean {
    if (!(structures instanceof Array)) {
      return false;
    }
    if (visited.has(structures)) {
      return true;
    }
    visited.add(structures);
    return this.hasCycle(structures[0], visited) || this.hasCycle(structures[1], visited);
  }

  public static drawData(structures: Data[]): void {
    if (!DataVisualizer.setSteps) {
      throw new Error('Data visualizer not initialized');
    }
    if (!DataVisualizer.isRedraw) {
      this.dataRecords.push(structures);
    }
    const root = structures[0];
    const isCyclic = this.hasCycle(root);
    DataVisualizer.nodeCount = [];
    DataVisualizer.nodeColor = [];
    this.nodeColor[0] = -1;
    DataVisualizer.longestNodePos = 0;
    DataVisualizer.TreeDepth = 0;
    if (isCyclic) {
      DataVisualizer.isBinTree = false;
      DataVisualizer.isGenTree = false;
    } else {
      DataVisualizer.isBinTree = this.isBinaryTree(root, null);
      DataVisualizer.isGenTree = this.isGeneralTree(root, null);
      if (DataVisualizer.isBinTree || DataVisualizer.isGenTree) {
        this.initializeTreeMetaData(root, 0, 0, false);
      }
    }
    DataVisualizer._instance.addStep(structures);
    DataVisualizer.setSteps(DataVisualizer._instance.steps);
  }

  public static clearWithData(): void {
    DataVisualizer.longestNodePos = 0;
    DataVisualizer.dataRecords = [];
    DataVisualizer.isRedraw = false;
    DataVisualizer.clear();
  }

  public static clear(): void {
    DataVisualizer._instance = new DataVisualizer();
    this.nodeCount = [];
    this.TreeDepth = 0;
    DataVisualizer.setSteps(DataVisualizer._instance.steps);
  }

  public static displaySpecialContent(dataNode: DataTreeNode): number {
    return DataVisualizer._instance.displaySpecialContent(dataNode);
  }

  private displaySpecialContent(dataNode: DataTreeNode): number {
    if (this.nodeToLabelMap.has(dataNode)) {
      return this.nodeToLabelMap.get(dataNode) ?? 0;
    } else {
      this.nodeToLabelMap.set(dataNode, this.nodeLabel);
      return this.nodeLabel++;
    }
  }

  private addStep(structures: Data[]) {
    const step = structures.map((xs, index) => this.createDrawing(xs, index));
    this.steps.push(step);
  }

  private createDrawing(xs: Data, key: number): JSX.Element {
    const treeDrawer = Tree.fromSourceStructure(xs).draw();

    // To account for overflow to the left side due to a backward arrow
    const leftMargin = Config.StrokeWidth / 2;

    // To account for overflow to the top due to a backward arrow
    const topMargin = Config.StrokeWidth / 2;

    return treeDrawer.draw(leftMargin, topMargin, key);
  }

  static redraw() {
    this.isRedraw = true;
    this.clear();
    try {
      return DataVisualizer.dataRecords.map(structures => this.drawData(structures));
    } finally {
      this.isRedraw = false;
    }
  }
}
