import { Button, ButtonGroup, Checkbox } from '@blueprintjs/core';
import { Context } from 'js-slang';
import { Frame } from 'js-slang/dist/types';
import React, { RefObject } from 'react';
import { Layer, Rect, Stage } from 'react-konva';

import { Grid } from './components/Grid';
import { ArrayValue } from './components/values/ArrayValue';
import { FnValue } from './components/values/FnValue';
import { GlobalFnValue } from './components/values/GlobalFnValue';
import { PrimitiveValue } from './components/values/PrimitiveValue';
import { UnassignedValue } from './components/values/UnassignedValue';
import { Value } from './components/values/Value';
import EnvVisualizer from './EnvVisualizer';
import { Config, ShapeDefaultProps } from './EnvVisualizerConfig';
import { Data, EnvTree, EnvTreeNode, ReferenceType } from './EnvVisualizerTypes';
import {
  deepCopyTree,
  isArray,
  isDummyKey,
  isEmptyEnvironment,
  isFn,
  isFunction,
  isGlobalFn,
  isPrimitiveData,
  isUnassigned
} from './EnvVisualizerUtils';

/** this class encapsulates the logic for calculating the layout */
export class Layout {
  /** the height of the stage */
  static height: number;
  /** the width of the stage */
  static width: number;
  /** the visible height of the stage */
  static visibleHeight: number = window.innerHeight;
  /** the visible width of the stage */
  static visibleWidth: number = window.innerWidth;
  /** the unique key assigned to each node */
  static key: number = 0;

  /** the environment tree */
  static environmentTree: EnvTree;
  /** the global environment */
  static globalEnvNode: EnvTreeNode;
  /** grid of frames */
  static grid: Grid;
  /** memoized values */
  static values = new Map<Data, Value>();
  static oldValues = new Map<Data, Value>();
  /** memoized layout */
  static prevLayout: React.ReactNode;
  static stageRef: RefObject<any> = React.createRef();
  // buffer for faster rendering of diagram when scrolling
  static readonly invisiblePadding: number = 500;

  static updateDimensions(width: number, height: number) {
    Layout.visibleWidth = width;
    Layout.visibleHeight = height;
    if (Layout.stageRef.current !== null) {
      Layout.stageRef.current.width(width + Layout.invisiblePadding * 2);
      Layout.stageRef.current.height(height + Layout.invisiblePadding * 2);
      EnvVisualizer.redraw();
    }
  }

  /** processes the runtime context from JS Slang */
  static setContext(context: Context): void {
    // clear/initialize data and value arrays
    Layout.values.forEach((v, d) => {
      v.reset();
      Layout.oldValues.set(d, v);
    });
    Layout.values.clear();
    // Layout.levels = [];
    Layout.key = 0;
    // deep copy so we don't mutate the context
    Layout.environmentTree = deepCopyTree(context.runtime.environmentTree as EnvTree);
    Layout.globalEnvNode = Layout.environmentTree.root;

    // remove program environment and merge bindings into global env
    Layout.removeProgramEnv();
    // remove global functions that are not referenced in the program
    Layout.removeUnreferencedGlobalFns();
    // initialize levels and frames
    Layout.initializeGrid();

    // calculate height and width by considering lowest and widest level
    Layout.height = Math.max(Config.CanvasMinHeight, this.grid.height() + Config.CanvasPaddingY);
    Layout.width = Math.max(Config.CanvasMinWidth, this.grid.width() + Config.CanvasPaddingX * 2);
  }

  /** remove program environment containing predefined functions */
  private static removeProgramEnv() {
    if (!Layout.globalEnvNode.children) return;

    const programEnvNode = Layout.globalEnvNode.children[0];
    const globalEnvNode = Layout.globalEnvNode;

    // merge programEnvNode bindings into globalEnvNode
    globalEnvNode.environment.head = {
      ...programEnvNode.environment.head,
      ...globalEnvNode.environment.head
    };

    // update globalEnvNode children
    if (programEnvNode.children) {
      globalEnvNode.resetChildren(programEnvNode.children);
    }

    // go through new bindings and update functions to be global functions
    // by removing extra props such as functionName
    for (const value of Object.values(globalEnvNode.environment.head)) {
      if (isFn(value)) {
        delete (value as { functionName?: string }).functionName;
      }
    }
  }

  /** remove any global functions not referenced elsewhere in the program */
  private static removeUnreferencedGlobalFns(): void {
    const referencedGlobalFns = new Set<() => any>();
    const visitedData = new Set<Data[]>();
    const findGlobalFnReferences = (envNode: EnvTreeNode): void => {
      for (const data of Object.values(envNode.environment.head)) {
        if (isGlobalFn(data)) {
          referencedGlobalFns.add(data);
        } else if (isArray(data)) {
          findGlobalFnReferencesInData(data);
        }
      }
      if (envNode.children) {
        envNode.children.forEach(findGlobalFnReferences);
      }
    };

    const findGlobalFnReferencesInData = (data: Data[]): void => {
      data.forEach(d => {
        if (isGlobalFn(d)) {
          referencedGlobalFns.add(d);
        } else if (isArray(d) && !visitedData.has(d)) {
          visitedData.add(d);
          findGlobalFnReferencesInData(d);
        }
      });
    };

    if (Layout.globalEnvNode.children) {
      Layout.globalEnvNode.children.forEach(findGlobalFnReferences);
    }

    const newFrame: Frame = {};
    for (const [key, data] of Object.entries(Layout.globalEnvNode.environment.head)) {
      if (referencedGlobalFns.has(data) || isDummyKey(key)) {
        newFrame[key] = data;
      }
    }

    Layout.globalEnvNode.environment.head = {
      [Config.GlobalFrameDefaultText]: Symbol(),
      ...newFrame
    };
  }

  /** initializes grid */
  private static initializeGrid(): void {
    const getNextChildren = (c: EnvTreeNode): EnvTreeNode[] => {
      if (isEmptyEnvironment(c.environment)) {
        const nextChildren: EnvTreeNode[] = [];
        c.children.forEach(gc => {
          nextChildren.push(...getNextChildren(gc as EnvTreeNode));
        });
        return nextChildren;
      } else {
        return [c];
      }
    };

    const frontiers: EnvTreeNode[][] = [];
    let frontier = [Layout.globalEnvNode];

    while (frontier.length > 0) {
      frontiers.push(frontier);

      const nextFrontier: EnvTreeNode[] = [];

      frontier.forEach(e => {
        e.children.forEach(c => {
          const nextChildren = getNextChildren(c as EnvTreeNode);
          nextChildren.forEach(c => (c.parent = e));
          nextFrontier.push(...nextChildren);
        });
      });

      frontier = nextFrontier;
    }
    if (this.grid === undefined) {
      this.grid = new Grid(frontiers);
    } else {
      this.grid.update(frontiers);
    }
  }

  /** memoize `Value` (used to detect circular references in non-primitive `Value`) */
  static memoizeValue(value: Value): void {
    Layout.values.set(value.data, value);
  }

  /** create an instance of the corresponding `Value` if it doesn't already exists,
   *  else, return the existing value */
  static createValue(data: Data, reference: ReferenceType): Value {
    if (isUnassigned(data)) {
      return new UnassignedValue([reference]);
    } else if (isPrimitiveData(data)) {
      return new PrimitiveValue(data, [reference]);
    } else {
      // try to find if this value is already created
      const existingValue = Layout.values.get(data);
      if (existingValue) {
        existingValue.addReference(reference);
        return existingValue;
      }

      // else create a new one
      let newValue: Value = new PrimitiveValue(null, [reference]);
      if (isArray(data)) {
        newValue = new ArrayValue(data, [reference]);
      } else if (isFunction(data)) {
        if (isFn(data)) {
          // normal JS Slang function
          newValue = new FnValue(data, [reference]);
        } else {
          // function from the global env (has no extra props such as env, fnName)
          newValue = new GlobalFnValue(data, [reference]);
        }
      }

      return newValue;
    }
  }

  /**
   * Scrolls diagram to top left, and saves the diagram as multiple images of width < MaxExportWidth.
   */
  static exportImage = () => {
    Layout.stageRef.current?.y(0);
    Layout.stageRef.current?.x(0);
    for (let i = 0; i < Math.ceil(Layout.width / Config.MaxExportWidth); i = i + 1) {
      Layout.stageRef.current?.width(
        Math.min(Layout.width - i * Config.MaxExportWidth, Config.MaxExportWidth)
      );
      Layout.stageRef.current?.height(Layout.height);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = this.stageRef.current.toDataURL({
        x: i * Config.MaxExportWidth,
        y: 0,
        mimeType: 'image/jpeg'
      });
      a.download = `diagram_${i}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
    Layout.stageRef.current?.width(Layout.visibleWidth);
    Layout.stageRef.current?.height(Layout.visibleHeight);
  };

  static draw(): React.ReactNode {
    if (Layout.key !== 0) {
      return Layout.prevLayout;
    } else {
      const layout = (
        <div className={'sa-env-visualizer'}>
          <div style={{ width: 400 }}>
            <ButtonGroup vertical={false}>
              <Button large={true} outlined={true} onClick={EnvVisualizer.togglePrintableMode}>
                <Checkbox
                  checked={EnvVisualizer.getPrintableMode()}
                  label="Printable Mode"
                  large={true}
                  onChange={EnvVisualizer.togglePrintableMode}
                />
              </Button>
              <Button
                outlined={true}
                text={`Save ${
                  Layout.width > Config.MaxExportWidth
                    ? Math.ceil(Layout.width / Config.MaxExportWidth) + ' images'
                    : 'image'
                }`}
                large={true}
                onClick={this.exportImage}
              />
            </ButtonGroup>
          </div>
          <div
            id="scroll-container"
            onScroll={e => {
              const dx = e.currentTarget.scrollLeft - Layout.invisiblePadding;
              const dy = e.currentTarget.scrollTop - Layout.invisiblePadding;
              this.stageRef.current.container().style.transform =
                'translate(' + dx + 'px, ' + dy + 'px)';
              this.stageRef.current.x(-dx);
              this.stageRef.current.y(-dy);
            }}
            style={{
              width: Layout.visibleWidth,
              height: Layout.visibleHeight,
              overflow: 'auto',
              margin: '10px'
            }}
          >
            <div
              id="large-container"
              style={{
                width: Layout.width,
                height: Layout.height,
                overflow: 'hidden',
                backgroundColor: EnvVisualizer.getPrintableMode()
                  ? Config.PRINT_BACKGROUND.toString()
                  : Config.SA_BLUE.toString()
              }}
            >
              <Stage
                width={Layout.visibleWidth + Layout.invisiblePadding * 2}
                height={Layout.visibleHeight + Layout.invisiblePadding * 2}
                ref={this.stageRef}
              >
                <Layer>
                  <Rect
                    {...ShapeDefaultProps}
                    x={0}
                    y={0}
                    width={Layout.width}
                    height={Layout.height}
                    fill={
                      EnvVisualizer.getPrintableMode()
                        ? Config.PRINT_BACKGROUND.toString()
                        : Config.SA_BLUE.toString()
                    }
                    key={Layout.key++}
                    listening={false}
                  />
                  {Layout.grid.draw()}
                </Layer>
              </Stage>
            </div>
          </div>
        </div>
      );
      Layout.prevLayout = layout;
      return layout;
    }
  }
}
