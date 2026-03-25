import type { JSX } from 'react';
import { Stage } from 'react-konva';

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
  private static counter = 1;
  private static empty(step: Step[]) {}
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

  private steps: Step[] = [];
  private nodeLabel = 0;
  private nodeToLabelMap: Map<DataTreeNode, number> = new Map();

  private constructor() {}

  public static get_depth(
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
      structures.push(this.nodeCount[depth]);
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
      structures.push(this.nodeColor[depth]);
    }

    this.TreeDepth = Math.max(this.TreeDepth, depth);
    this.get_depth(structures[0], depth + 1, 0, true);
    this.get_depth(structures[1], depth, nodePos + 1, false);
    return depth;
  }

  public static isBinaryTree(structures: Data[]): boolean {
    if (structures[0] === null) {
      return true;
    }
    let next = structures[0];
    let ans = false;
    let count = 0;
    while (next instanceof Array) {
      count++;
      next = next[1];
    }
    if (count == 3) {
      ans = true;
    }
    return ans && this.isBinaryTree(structures[0][1]);
  }

  public static isGeneralTree(structures: Data[]): boolean {
    if (structures == null) {
      return true;
    }
    if (structures.length > 2 || (!(structures[1] instanceof Array) && structures[1] != null)) {
      return false;
    }
    return this.isGeneralTree(structures[1]) && this.isGeneralTree(structures[0]);
  }

  public static init(setSteps: (step: Step[]) => void): void {
    DataVisualizer.setSteps = setSteps;
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

  public static drawData(structures: Data[]): void {
    if (!DataVisualizer.setSteps) {
      throw new Error('Data visualizer not initialized');
    }
    if (!DataVisualizer.isRedraw) {
      this.dataRecords.push(structures);
    }
    DataVisualizer.isBinTree = this.isBinaryTree(structures);
    DataVisualizer.isGenTree = this.isGeneralTree(structures);
    DataVisualizer.nodeCount = [];
    DataVisualizer.nodeColor = [];
    this.nodeColor[0] = -1;
    this.get_depth(structures[0], 0, 0, false);

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
      // console.log('*' + this.nodeLabel + ': ' + dataNode.data);
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
    DataVisualizer.counter = -DataVisualizer.counter;
    return DataVisualizer.dataRecords.map(structures => this.drawData(structures));
  }
}
