import { Context } from 'js-slang';
import { Frame } from 'js-slang/dist/types';
import React from 'react';
import { Rect } from 'react-konva';
import { Layer, Stage } from 'react-konva';

import { Value } from './components/binding/Value';
import { ArrayValue } from './components/binding/value/ArrayValue';
import { FnValue } from './components/binding/value/FnValue';
import { GlobalFnValue } from './components/binding/value/GlobalFnValue';
import { PrimitiveValue } from './components/binding/value/PrimitiveValue';
import { Level } from './components/Level';
import { Config } from './EnvVisualizerConfig';
import { Data, Env, ReferenceType } from './EnvVisualizerTypes';
import {
  isArray,
  isEmptyEnvironment,
  isFn,
  isFunction,
  isGlobalFn,
  isPrimitiveData
} from './EnvVisualizerUtils';

/** this class encapsulates the logic for calculating the layout */
export class Layout {
  /** the height of the stage */
  static height: number;
  /** the width of the stage */
  static width: number;
  /** the global environment */
  static globalEnv: Env;
  /** the environment in which the user places the breakpoint */
  static breakpointEnv: Env;
  /** array of levels, which themselves are arrays of frames */
  static levels: Level[];
  /** the Value objects in this layout. note that this corresponds to the data array,
   * that is, `value[i]` has underlying data `data[i]` */
  static values: Value[];
  /** the data in this layout (primitives, arrays, functions, etc). note that this corresponds
   * to the value array, that is, `data[i]` has corresponding Value object `value[i]` */
  static data: Data[];
  /** the unique key assigned to each node */
  static key: number = 0;
  /** memoized layout */
  static prevLayout: React.ReactNode;

  /** processes the runtime context from JS Slang */
  static setContext(context: Context): void {
    // clear/initialize data and value arrays
    Layout.data = [];
    Layout.values = [];
    Layout.levels = [];
    Layout.key = 0;

    const envs = context.runtime.environments;
    Layout.globalEnv = envs[envs.length - 1];
    Layout.breakpointEnv = envs[0];

    // we doubly link the envs so that we can process them 'top-down'
    Layout.doublyLinkEnv();
    // remove references to empty environments
    Layout.removeEmptyEnvRefs();
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

  /** to each environment, add an array of references to child environments,
   *  making them doubly linked */
  private static doublyLinkEnv() {
    const visitedEnvs: Env[] = [];
    const visitedValues: Data[] = [];

    // recursively process environments while keep tracking of the previous env
    const processEnv = (curr: Env | null, prev: Env | null) => {
      if (!curr) return;

      // add prev env to child env list of curr env
      if (prev) {
        if (curr.childEnvs) {
          curr.childEnvs.includes(prev) || curr.childEnvs.push(prev);
        } else {
          curr.childEnvs = [prev];
        }
      }

      // check if we have already processed this env
      if (visitedEnvs.includes(curr)) return;
      visitedEnvs.push(curr);

      // recursively process values in frame
      Object.values(curr.head).forEach(processValue);
      function processValue(data: Data) {
        // mark as visited to account for cyclic structures
        if (visitedValues.includes(data)) return;
        visitedValues.push(data);

        if (isFn(data)) {
          processEnv(data.environment, null);
        } else if (isArray(data)) {
          data.forEach(processValue);
        }
      }

      processEnv(curr.tail, curr);
    };

    processEnv(Layout.breakpointEnv, null);
  }

  /** remove references to empty environments */
  private static removeEmptyEnvRefs() {
    const extractNonEmptyEnvs = (env: Env): Env[] => {
      const nonEmptyEnvs: Env[] = [];
      // recursively extract non empty envs of children
      if (env.childEnvs) env.childEnvs.forEach(e => nonEmptyEnvs.push(...extractNonEmptyEnvs(e)));
      // update child envs list, including only non empty ones
      env.childEnvs = nonEmptyEnvs;
      // if we are empty, don't return ourselves
      return isEmptyEnvironment(env) ? nonEmptyEnvs : [env];
    };

    // start extracting from global env
    extractNonEmptyEnvs(Layout.globalEnv);
  }

  /** remove program environment containing predefined functions */
  private static removeProgramEnv() {
    if (!Layout.globalEnv.childEnvs) return;

    const programEnv = Layout.globalEnv.childEnvs[0];
    const globalEnv = Layout.globalEnv;

    // merge programEnv bindings into globalEnv
    globalEnv.head = { ...programEnv.head, ...globalEnv.head };

    // update globalEnv childEnvs
    if (programEnv.childEnvs) globalEnv.childEnvs = programEnv.childEnvs;

    // go through new bindings and update functions to be global functions
    // by removing extra props such as functionName
    for (const value of Object.values(globalEnv.head)) {
      if (isFn(value)) {
        // HACKY?
        delete (value as { functionName?: string }).functionName;
      }
    }
  }

  /** remove any global functions not referenced elsewhere in the program */
  private static removeUnreferencedGlobalFns() {
    const referencedGlobalFns: (() => any)[] = [];
    const findGlobalFnReferences = (env: Env) => {
      for (const data of Object.values(env.head)) {
        if (isGlobalFn(data)) referencedGlobalFns.push(data);
      }

      if (env.childEnvs) env.childEnvs.forEach(findGlobalFnReferences);
    };

    if (Layout.globalEnv.childEnvs) {
      Layout.globalEnv.childEnvs.forEach(findGlobalFnReferences);
    }

    const newFrame: Frame = {};
    for (const [key, data] of Object.entries(Layout.globalEnv.head)) {
      if (referencedGlobalFns.includes(data)) {
        newFrame[key] = data;
      }
    }

    Layout.globalEnv.head = { [Config.GlobalFrameDefaultText]: '...', ...newFrame };
  }

  /** initializes levels */
  private static initializeLevels() {
    /** checks if the any of the frames in a level contains a child */
    const containsChildEnv = (level: Level): boolean =>
      level.frames.reduce<boolean>(
        (A, { environment: e }) => A || (!!e.childEnvs && e.childEnvs.length > 0),
        false
      );

    /** get the child levels if any */
    const getNextLevels = (prevLevel: Level): Level[] => {
      const accLevels: Level[] = [];
      if (containsChildEnv(prevLevel)) {
        const currLevel = new Level(prevLevel);
        accLevels.push(currLevel, ...getNextLevels(currLevel));
      }

      return accLevels;
    };

    const globalLevel = new Level(null);
    Layout.levels.push(globalLevel, ...getNextLevels(globalLevel));
  }

  /** memoize `Value` (used to detect cyclic references in non-primitive `Value`) */
  static memoizeValue(value: Value) {
    Layout.data.push(value.data);
    Layout.values.push(value);
  }

  /** create an instance of the corresponding `Value` if it doesn't already exists,
   *  else, return the existing value */
  static createValue(data: Data, reference: ReferenceType): Value {
    // primitives don't have to be memoized
    if (isPrimitiveData(data)) {
      return new PrimitiveValue(data, [reference]);
    } else {
      // try to find if this value is already created
      const idx = Layout.data.findIndex(d => d === data);
      if (idx !== -1) {
        const existingValue = Layout.values[idx];
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
        <Stage width={Layout.width} height={Layout.height} container={'stage'}>
          <Layer>
            <Rect
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
