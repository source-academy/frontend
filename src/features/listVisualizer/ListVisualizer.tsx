import { Stage } from 'react-konva';

import { Config } from './Config';
import { Data, Step } from './ListVisualizerTypes';
import { Tree } from './tree/Tree';
import { DataTreeNode } from './tree/TreeNode';

/**
 * The list visualizer class.
 * Exposes three function: init, drawData, and clear.
 *
 * init is used by SideContentListVisualizer as a hook.
 * drawData is the draw_data function in source.
 * clear is used by WorkspaceSaga to reset the visualizer after every "Run" button press
 */
export default class ListVisualizer {
  private static empty(step: Step[]) { }
  private static setSteps: (step: Step[]) => void = ListVisualizer.empty;
  private static _instance = new ListVisualizer();

  private steps: Step[] = [];
  private nodeLabel = 0;
  private nodeToLabelMap: Map<DataTreeNode, number> = new Map();

  private constructor() { }

  public static init(setSteps: (step: Step[]) => void): void {
    ListVisualizer.setSteps = setSteps;
  }

  public static drawData(structures: Data[]): void {
    if (!ListVisualizer.setSteps) {
      throw new Error('List visualizer not initialized');
    }
    ListVisualizer._instance.addStep(structures);
    ListVisualizer.setSteps(ListVisualizer._instance.steps);
  }

  public static clear(): void {
    ListVisualizer._instance = new ListVisualizer();
    ListVisualizer.setSteps(ListVisualizer._instance.steps);
  }

  public static displaySpecialContent(dataNode: DataTreeNode): number {
    return ListVisualizer._instance.displaySpecialContent(dataNode);
  }

  private displaySpecialContent(dataNode: DataTreeNode): number {
    if (this.nodeToLabelMap.has(dataNode)) {
      return this.nodeToLabelMap.get(dataNode) ?? 0;
    } else {
      console.log('*' + this.nodeLabel + ': ' + dataNode.data);
      this.nodeToLabelMap.set(dataNode, this.nodeLabel);
      return this.nodeLabel++;
    }
  }

  private addStep(structures: Data[]) {
    const step = structures.map(this.createDrawing);
    this.steps.push(step);
  }

  /**
   *  For student use. Draws a list by converting it into a tree object, attempts to draw on the canvas,
   *  Then shift it to the left end.
   */
  private createDrawing(xs: Data): JSX.Element {
    const treeDrawer = Tree.fromSourceStructure(xs).draw();

    // To account for overflow to the left side due to a backward arrow
    // const leftMargin = Config.ArrowMarginHorizontal + Config.StrokeWidth;
    const leftMargin = Config.StrokeWidth / 2;

    // To account for overflow to the top due to a backward arrow
    const topMargin = Config.StrokeWidth / 2;

    const layer = treeDrawer.draw(leftMargin, topMargin);
    return <Stage key={xs} width={treeDrawer.width + leftMargin} height={treeDrawer.height + topMargin}>
      {layer}
    </Stage>
  }
}
