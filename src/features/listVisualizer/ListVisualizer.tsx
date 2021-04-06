import { Layer, Stage, Text } from 'react-konva';

import { Data, Step } from './ListVisualizerTypes';
import { findDataHeight, findDataWidth, isFunction, isPair, toText } from './ListVisualizerUtils';
import { Tree } from './tree/Tree';
import { DataTreeNode, FunctionTreeNode } from './tree/TreeNode';

/**
 * The list visualizer class.
 * Exposes three function: init, drawData, and clear.
 *
 * init is used by SideContentListVisualizer as a hook.
 * drawData is the draw_data function in source.
 * clear is used by WorkspaceSaga to reset the visualizer after every "Run" button press
 */
export default class ListVisualizer {
  private static setSteps: ((step: Step[]) => void) = ([]) => {};
  private static _instance = new ListVisualizer();

  private steps: Step[] = [];
  private nodeLabel = 0;
  private nodeToLabelMap: Map<DataTreeNode, number> = new Map();

  private constructor() {}

  public static init(setSteps: ((step: Step[]) => void)): void {
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
      // if (typeof display === 'function') {
      //     display('*' + nodeLabel + ': ' + value);
      // } else {
      console.log('*' + this.nodeLabel + ': ' + dataNode.data);
      this.nodeToLabelMap.set(dataNode, this.nodeLabel);
      // }
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
    /**
     * Create konva stage according to calculated width and height of drawing.
     * Theoretically, as each box is 90px wide and successive boxes overlap by half,
     * the width of the drawing should be roughly (width * 45), with a similar calculation
     * for height.
     * In practice, likely due to browser auto-scaling, for large drawings this results in
     * some of the drawing being cut off. Hence the width and height formulas used are approximations.
     */
    let layer: JSX.Element;

    if (isPair(xs)) {
      layer = Tree.fromSourceTree(xs).draw(500, 50);
    } else if (isFunction(xs)) {
      layer = <Layer>{new FunctionTreeNode(0).createDrawable(50, 50, 50, 50)}</Layer>;
    } else {
      layer = (
        <Layer>
          <Text
            text={toText(xs, true)}
            align={'center'}
            //  x={500}
            //  y={50}
            fontStyle={'normal'}
            fontSize={20}
            fill={'white'}
          />
        </Layer>
      );
    }
    const stage = (
      <Stage key={xs} width={findDataWidth(xs) * 60 + 60} height={findDataHeight(xs) * 60 + 100}>
        {layer}
      </Stage>
    );
    return stage;
  }
}
