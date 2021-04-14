import { Context } from 'js-slang';
import { Frame } from 'js-slang/dist/types';
import { cloneDeep } from 'lodash';
import React from 'react';
import { Rect } from 'react-konva';
import { Layer, Stage } from 'react-konva';

import { Level } from './components/Level';
import { ArrayValue } from './components/values/ArrayValue';
import { FnValue } from './components/values/FnValue';
import { GlobalFnValue } from './components/values/GlobalFnValue';
import { PrimitiveValue } from './components/values/PrimitiveValue';
import { Value } from './components/values/Value';
import { Config, ShapeDefaultProps } from './EnvVisualizerConfig';
import { Data, EnvTree, EnvTreeNode, ReferenceType } from './EnvVisualizerTypes';
import {
  isArray,
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
  /** the unique key assigned to each node */
  static key: number = 0;

  /** the environment tree */
  static environmentTree: EnvTree;
  /** the global environment */
  static globalEnvNode: EnvTreeNode;
  /** array of levels, which themselves are arrays of frames */
  static levels: Level[];
  /** the Value objects in this layout. note that this corresponds to the data array,
   * that is, `value[i]` has underlying data `data[i]` */
  static values = new Map<Data, Value>();
  /** memoized layout */
  static prevLayout: React.ReactNode;

  /** processes the runtime context from JS Slang */
  static setContext(context: Context): void {
    // clear/initialize data and value arrays
    Layout.values.clear();
    Layout.levels = [];
    Layout.key = 0;
    Layout.environmentTree = cloneDeep(context.runtime.environmentTree as EnvTree);
    Layout.globalEnvNode = Layout.environmentTree.root;

    // remove program environment and merge bindings into global env
    Layout.removeProgramEnv();
    // remove global functions that are not referenced in the program
    Layout.removeUnreferencedGlobalFns();
    // initialize levels and frames
    Layout.initializeLevels();

    // calculate height and width by considering lowest and widest level
    const lastLevel = Layout.levels[Layout.levels.length - 1];
    Layout.height = Math.max(
      Config.CanvasMinHeight,
      lastLevel.y + lastLevel.height + Config.CanvasPaddingY
    );
    Layout.width = Math.max(
      Config.CanvasMinWidth,
      Layout.levels.reduce<number>((maxWidth, level) => Math.max(maxWidth, level.width), 0) +
        Config.CanvasPaddingX * 2
    );
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
    if (programEnvNode.children) globalEnvNode.resetChildren(programEnvNode.children);

    // go through new bindings and update functions to be global functions
    // by removing extra props such as functionName
    for (const value of Object.values(globalEnvNode.environment.head)) {
      if (isFn(value)) {
        // HACKY?
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
      if (envNode.children) envNode.children.forEach(findGlobalFnReferences);
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
      if (referencedGlobalFns.has(data)) {
        newFrame[key] = data;
      }
    }

    Layout.globalEnvNode.environment.head = { [Config.GlobalFrameDefaultText]: '...', ...newFrame };
  }

  /** initializes levels */
  private static initializeLevels(): void {
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
    let frontier: EnvTreeNode[] = [Layout.globalEnvNode];
    let prevLevel: Level | null = null;
    while (frontier.length > 0) {
      const currLevel: Level = new Level(prevLevel, frontier);
      this.levels.push(currLevel);
      const nextFrontier: EnvTreeNode[] = [];
      frontier.forEach(e => {
        e.children.forEach(c => {
          const nextChildren = getNextChildren(c as EnvTreeNode);
          nextChildren.forEach(c => (c.parent = e));
          nextFrontier.push(...nextChildren);
        });
      });
      prevLevel = currLevel;
      frontier = nextFrontier;
    }
  }

  /** memoize `Value` (used to detect cyclic references in non-primitive `Value`) */
  static memoizeValue(value: Value): void {
    Layout.values.set(value.data, value);
  }

  /** create an instance of the corresponding `Value` if it doesn't already exists,
   *  else, return the existing value */
  static createValue(data: Data, reference: ReferenceType): Value {
    // primitives don't have to be memoized
    if (isUnassigned(data)) {
      return new PrimitiveValue(Config.UnassignedData.toString(), [reference]);
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

  static draw(): React.ReactNode {
    if (Layout.key !== 0) {
      return Layout.prevLayout;
    } else {
      const layout = (
        <Stage width={Layout.width} height={Layout.height}>
          <Layer>
            <Rect
              {...ShapeDefaultProps}
              x={0}
              y={0}
              width={Layout.width}
              height={Layout.height}
              fill={Config.SA_BLUE.toString()}
              key={Layout.key++}
              listening={false}
            />
            {Layout.levels.map(level => level.draw())}
          </Layer>
        </Stage>
      );
      Layout.prevLayout = layout;
      return layout;
    }
  }
}
