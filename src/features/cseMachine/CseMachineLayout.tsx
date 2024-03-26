import Heap from 'js-slang/dist/cse-machine/heap';
import { Control, Stash } from 'js-slang/dist/cse-machine/interpreter';
import { KonvaEventObject } from 'konva/lib/Node';
import React, { RefObject } from 'react';
import { Layer, Rect, Stage } from 'react-konva';
import classes from 'src/styles/Draggable.module.scss';

import { ControlStack } from './components/ControlStack';
import { Level } from './components/Level';
import { StashStack } from './components/StashStack';
import { ArrayValue } from './components/values/ArrayValue';
import { FnValue } from './components/values/FnValue';
import { GlobalFnValue } from './components/values/GlobalFnValue';
import { PrimitiveValue } from './components/values/PrimitiveValue';
import { UnassignedValue } from './components/values/UnassignedValue';
import { Value } from './components/values/Value';
import CseMachine from './CseMachine';
import { CseAnimation } from './CseMachineAnimation';
import { Config, ShapeDefaultProps } from './CseMachineConfig';
import {
  Closure,
  Data,
  DataArray,
  EnvTree,
  EnvTreeNode,
  GlobalFn,
  ReferenceType
} from './CseMachineTypes';
import {
  convertClosureToGlobalFn,
  deepCopyTree,
  getNextChildren,
  isArray,
  isClosure,
  isFunction,
  isGlobalFn,
  isPrimitiveData,
  isUnassigned,
  setDifference
} from './CseMachineUtils';

/** this class encapsulates the logic for calculating the layout */
export class Layout {
  /** the width of the stage */
  private static _width: number;
  /** the height of the stage */
  private static _height: number;
  /** the width of the controlStash stage */
  static controlStashWidth: number;
  /** the height of the controlStash stage */
  static controlStashHeight: number;
  /** the visible height of the stage */
  static visibleHeight: number = window.innerHeight;
  /** the visible width of the stage */
  static visibleWidth: number = window.innerWidth;
  /** total height of stage */
  static stageHeight: number = window.innerHeight;
  /** total width of stage */
  static stageWidth: number = window.innerWidth;
  /** the unique key assigned to each node */
  static key: number = 0;
  /** scale factor for zooming and out of canvas */
  static scaleFactor = 1.02;

  /** the environment tree */
  static environmentTree: EnvTree;
  /** the global environment */
  static globalEnvNode: EnvTreeNode;
  /** grid of frames */
  static levels: Level[] = [];
  /** the control and stash */
  static control: Control;
  static stash: Stash;
  static controlComponent: ControlStack;
  static stashComponent: StashStack;

  static previousControlComponent: ControlStack;
  static previousStashComponent: StashStack;

  /** memoized values */
  static values = new Map<Data, Value>();
  /** memoized layout */
  static prevLayout: React.ReactNode;
  static currentDark: React.ReactNode;
  static currentLight: React.ReactNode;
  static currentStackDark: React.ReactNode;
  static currentStackTruncDark: React.ReactNode;
  static currentStackLight: React.ReactNode;
  static currentStackTruncLight: React.ReactNode;
  static stageRef: RefObject<any> = React.createRef();
  // buffer for faster rendering of diagram when scrolling
  static invisiblePaddingVertical: number = 300;
  static invisiblePaddingHorizontal: number = 300;
  static scrollContainerRef: RefObject<any> = React.createRef();

  static updateDimensions(width: number, height: number) {
    // update the size of the scroll container and stage given the width and height of the sidebar content.
    Layout.visibleWidth = width;
    Layout.visibleHeight = height;
    if (
      Layout.stageRef.current !== null &&
      (Math.min(Layout.width(), window.innerWidth) > Layout.stageWidth ||
        Math.min(Layout.height(), window.innerHeight) > Layout.stageHeight)
    ) {
      Layout.currentLight = undefined;
      Layout.currentDark = undefined;
      Layout.stageWidth = Math.min(Layout.width(), window.innerWidth);
      Layout.stageHeight = Math.min(Layout.height(), window.innerHeight);
      Layout.stageRef.current.width(Layout.stageWidth);
      Layout.stageRef.current.height(Layout.stageHeight);
      CseMachine.redraw();
    }
    if (Layout.stageHeight > Layout.visibleHeight) {
    }
    Layout.invisiblePaddingVertical =
      Layout.stageHeight > Layout.visibleHeight
        ? (Layout.stageHeight - Layout.visibleHeight) / 2
        : 0;
    Layout.invisiblePaddingHorizontal =
      Layout.stageWidth > Layout.visibleWidth ? (Layout.stageWidth - Layout.visibleWidth) / 2 : 0;

    const container: HTMLElement | null = this.scrollContainerRef.current as HTMLDivElement;
    if (container) {
      container.style.width = `${Layout.visibleWidth}px`;
      container.style.height = `${Layout.visibleHeight}px`;
    }
  }

  /** processes the runtime context from JS Slang */
  static setContext(envTree: EnvTree, control: Control, stash: Stash): void {
    Layout.currentLight = undefined;
    Layout.currentDark = undefined;
    Layout.currentStackDark = undefined;
    Layout.currentStackTruncDark = undefined;
    Layout.currentStackLight = undefined;
    Layout.currentStackTruncLight = undefined;
    // clear/initialize data and value arrays
    Layout.values.clear();
    Layout.key = 0;

    // deep copy so we don't mutate the context
    Layout.environmentTree = deepCopyTree(envTree);
    Layout.globalEnvNode = Layout.environmentTree.root;
    Layout.control = control;
    Layout.stash = stash;

    // remove program environment and merge bindings into global env
    Layout.removePreludeEnv();
    // remove global functions that are not referenced in the program
    Layout.removeUnreferencedGlobalFns();
    // initialize levels and frames
    Layout.initializeGrid();
    // initialize control and stash
    Layout.initializeControlStash();

    if (CseMachine.getControlStash()) {
      Layout.controlStashHeight = Math.max(
        Config.CanvasMinHeight,
        Layout.controlComponent.y() + Layout.controlComponent.height() + Config.CanvasPaddingY
      );
      Layout.controlStashWidth = Math.max(
        Config.CanvasMinWidth,
        Layout.controlComponent.x() + Layout.controlComponent.width() + Config.CanvasPaddingX,
        Layout.stashComponent.x() + Layout.stashComponent.width() + Config.CanvasPaddingX
      );
    }
    // calculate height and width by considering lowest and widest level
    const lastLevel = Layout.levels[Layout.levels.length - 1];
    Layout._height = Math.max(
      Config.CanvasMinHeight,
      lastLevel.y() + lastLevel.height() + Config.CanvasPaddingY,
      Layout.controlStashHeight ?? 0
    );

    Layout._width = Math.max(
      Config.CanvasMinWidth,
      Layout.levels.reduce<number>((maxWidth, level) => Math.max(maxWidth, level.width()), 0) +
        Config.CanvasPaddingX * 2 +
        (CseMachine.getControlStash()
          ? Layout.controlComponent.width() + Config.CanvasPaddingX * 2
          : 0)
    );
    // initialise animations
    CseAnimation.updateAnimation();
  }

  static initializeControlStash() {
    Layout.previousControlComponent = Layout.controlComponent;
    Layout.previousStashComponent = Layout.stashComponent;
    this.controlComponent = new ControlStack(this.control);
    this.stashComponent = new StashStack(this.stash);
  }

  /**
   * remove prelude environment containing predefined functions, by merging the prelude
   * objects into the global environment head and heap
   */
  private static removePreludeEnv() {
    if (!Layout.globalEnvNode.children) return;

    const preludeEnvNode = Layout.globalEnvNode.children[0];
    const preludeEnv = preludeEnvNode.environment;
    const globalEnvNode = Layout.globalEnvNode;
    const globalEnv = globalEnvNode.environment;

    // merge preludeEnvNode bindings and heap into globalEnvNode
    const preludeObjects = [...preludeEnvNode.environment.heap.getHeap()];
    const preludeMap = new Map(Object.entries(preludeEnv.head).map(([key, value]) => [value, key]));
    const arrayReferenceMap = new Map<DataArray, DataArray>();
    while (preludeObjects.length > 0) {
      const value = preludeObjects.shift()!;
      let newValue: Closure | DataArray;
      if (isArray(value)) {
        // Modify environment of each array by creating new array
        newValue = [...value] as DataArray;
        arrayReferenceMap.set(value, newValue);
        // Also change the reference of any nested arrays to the one with the modified environment.
        // `arrayReferenceMap` is guaranteed to contain any nested array, because the heap order is
        // based on object creation order, and nested arrays are always created before parent array.
        newValue.forEach((child, i) => {
          if (isArray(child) && arrayReferenceMap.has(child)) {
            newValue[i] = arrayReferenceMap.get(child);
          }
        });
        Object.defineProperties(newValue, {
          id: { value: value.id },
          environment: { value: globalEnvNode.environment }
        });
      } else {
        // Modify environment of each closure by mutation
        newValue = value;
        newValue.environment = globalEnvNode.environment;
      }
      globalEnv.heap.add(newValue);
      const key = preludeMap.get(value);
      if (key) {
        globalEnv.head[key] = newValue;
      }
    }

    // update globalEnvNode children
    globalEnvNode.resetChildren(preludeEnvNode.children);

    // go through new bindings and update functions to be global functions
    for (const value of Object.values(globalEnvNode.environment.head)) {
      if (isClosure(value)) {
        convertClosureToGlobalFn(value);
      }
    }
  }

  /** remove any global functions not referenced elsewhere in the program */
  private static removeUnreferencedGlobalFns(): void {
    const referencedGlobalFns = new Set<GlobalFn>();
    const visitedData = new Set<DataArray>();

    const findGlobalFnReferences = (envNode: EnvTreeNode): void => {
      const headValues = Object.values(envNode.environment.head);
      const unreferenced = setDifference(envNode.environment.heap.getHeap(), new Set(headValues));
      for (const data of headValues) {
        if (isGlobalFn(data)) {
          referencedGlobalFns.add(data);
        } else if (isArray(data)) {
          findGlobalFnReferencesInData(data);
        }
      }
      for (const data of unreferenced) {
        // The heap will never contain a global function, unless it is the global/prelude environment
        if (isArray(data)) {
          findGlobalFnReferencesInData(data);
        }
      }
      envNode.children.forEach(findGlobalFnReferences);
    };

    const findGlobalFnReferencesInData = (data: DataArray): void => {
      data.forEach(d => {
        if (isGlobalFn(d)) {
          referencedGlobalFns.add(d);
        } else if (isArray(d) && !visitedData.has(d)) {
          visitedData.add(d);
          findGlobalFnReferencesInData(d);
        }
      });
    };

    // First, add any referenced global functions in the stash
    for (const item of Layout.stash.getStack()) {
      if (isGlobalFn(item)) {
        if (isGlobalFn(item)) {
          referencedGlobalFns.add(item);
        } else if (isArray(item)) {
          findGlobalFnReferencesInData(item);
        }
      }
    }

    // Then, find any references within any arrays inside the global environment heap
    for (const data of Layout.globalEnvNode.environment.heap.getHeap()) {
      if (isArray(data)) {
        findGlobalFnReferencesInData(data);
      }
    }

    // Finally, find any references inside the global environment children
    Layout.globalEnvNode.children.forEach(findGlobalFnReferences);

    const functionNames = new Map(
      Object.entries(Layout.globalEnvNode.environment.head).map(([key, value]) => [value, key])
    );

    const newHead = {};
    const newHeap = new Heap();
    for (const fn of referencedGlobalFns) {
      newHead[functionNames.get(fn)!] = fn;
      if (fn.hasOwnProperty('environment')) {
        newHeap.add(fn as Closure);
      }
    }
    // add any arrays from the original heap to the new heap
    for (const item of Layout.globalEnvNode.environment.heap.getHeap()) {
      if (isArray(item)) {
        newHeap.add(item);
      }
    }

    Layout.globalEnvNode.environment.head = {
      [Config.GlobalFrameDefaultText]: Symbol(),
      ...newHead
    };
    Layout.globalEnvNode.environment.heap = newHeap;
  }

  public static width(): number {
    return Layout._width;
  }

  public static height(): number {
    return Layout._height;
  }

  /** initializes grid */
  private static initializeGrid(): void {
    this.levels = [];
    let frontier: EnvTreeNode[] = [Layout.globalEnvNode];
    let prevLevel: Level | null = null;
    let currLevel: Level;

    while (frontier.length > 0) {
      currLevel = new Level(prevLevel, frontier);
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
        if (isClosure(data)) {
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
   * Scrolls diagram to top left, resets the zoom, and saves the diagram as multiple images of width < MaxExportWidth.
   */
  static exportImage = () => {
    const container: HTMLElement | null = this.scrollContainerRef.current as HTMLDivElement;
    container.scrollTo({ left: 0, top: 0 });
    Layout.handleScrollPosition(0, 0);
    this.stageRef.current.scale({ x: 1, y: 1 });
    const height = Layout.height();
    const width = Layout.width();
    const horizontalImages = Math.ceil(width / Config.MaxExportWidth);
    const verticalImages = Math.ceil(height / Config.MaxExportHeight);
    const download_images = () => {
      const download_next = (n: number) => {
        if (n >= horizontalImages * verticalImages) {
          return;
        }
        const x = n % horizontalImages;
        const y = Math.floor(n / horizontalImages);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = this.stageRef.current.toDataURL({
          x: x * Config.MaxExportWidth + Layout.invisiblePaddingHorizontal,
          y: y * Config.MaxExportHeight + Layout.invisiblePaddingVertical,
          width: Math.min(width - x * Config.MaxExportWidth, Config.MaxExportWidth),
          height: Math.min(height - y * Config.MaxExportHeight, Config.MaxExportHeight),
          mimeType: 'image/jpeg'
        });

        a.download = `diagram_${x}_${y}.jpg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(function () {
          download_next(n + 1);
        }, 1000);
      };
      // Initiate the first download.
      download_next(0);
    };
    download_images();
  };

  /**
   * Calculates the required transformation for the stage given the scroll-container div scroll position.
   * @param x x position of the scroll container
   * @param y y position of the scroll container
   */
  private static handleScrollPosition(x: number, y: number) {
    const dx = x - Layout.invisiblePaddingHorizontal;
    const dy = y - Layout.invisiblePaddingVertical;
    this.stageRef.current.container().style.transform = 'translate(' + dx + 'px, ' + dy + 'px)';
    this.stageRef.current.x(-dx);
    this.stageRef.current.y(-dy);
  }

  /**
   * Updates the scale of the stage after the user inititates a zoom in or out
   * by scrolling or by the trackpad.
   */
  static zoomStage(event: KonvaEventObject<WheelEvent> | boolean, multiplier: number = 1) {
    typeof event != 'boolean' && event.evt.preventDefault();
    if (Layout.stageRef.current !== null) {
      const stage = Layout.stageRef.current;
      const oldScale = stage.scaleX();
      const { x: pointerX, y: pointerY } = stage.getPointerPosition();
      const mousePointTo = {
        x: (pointerX - stage.x()) / oldScale,
        y: (pointerY - stage.y()) / oldScale
      };

      // zoom in or zoom out
      const direction =
        typeof event != 'boolean' ? (event.evt.deltaY > 0 ? -1 : 1) : event ? 1 : -1;

      // Check if the zoom limits have been reached
      if ((direction > 0 && oldScale < 3) || (direction < 0 && oldScale > 0.4)) {
        const newScale =
          direction > 0
            ? oldScale * Layout.scaleFactor ** multiplier
            : oldScale / Layout.scaleFactor ** multiplier;
        stage.scale({ x: newScale, y: newScale });
        if (typeof event !== 'boolean') {
          const newPos = {
            x: pointerX - mousePointTo.x * newScale,
            y: pointerY - mousePointTo.y * newScale
          };
          stage.position(newPos);
          stage.batchDraw();
        }
      }
    }
  }

  static draw(): React.ReactNode {
    if (Layout.key !== 0) {
      return Layout.prevLayout;
    } else {
      const layout = (
        <div className={'sa-cse-machine'} data-testid="sa-cse-machine">
          <div
            id="scroll-container"
            ref={Layout.scrollContainerRef}
            onScroll={e =>
              Layout.handleScrollPosition(e.currentTarget.scrollLeft, e.currentTarget.scrollTop)
            }
            style={{
              width: Layout.visibleWidth,
              height: Layout.visibleHeight,
              overflow: 'hidden'
            }}
          >
            <div
              id="large-container"
              style={{
                width: Layout.width(),
                height: Layout.height(),
                overflow: 'hidden',
                backgroundColor: CseMachine.getPrintableMode()
                  ? Config.PRINT_BACKGROUND
                  : Config.SA_BLUE
              }}
            >
              <Stage
                width={Layout.stageWidth}
                height={Layout.stageHeight}
                ref={Layout.stageRef}
                draggable
                onWheel={Layout.zoomStage}
                className={classes['draggable']}
              >
                <Layer>
                  <Rect
                    {...ShapeDefaultProps}
                    x={0}
                    y={0}
                    width={Layout.width()}
                    height={Layout.height()}
                    fill={CseMachine.getPrintableMode() ? Config.PRINT_BACKGROUND : Config.SA_BLUE}
                    key={Layout.key++}
                    listening={false}
                  />
                  {Layout.levels.map(level => level.draw())}
                  {CseMachine.getControlStash() && Layout.controlComponent.draw()}
                  {CseMachine.getControlStash() && Layout.stashComponent.draw()}
                </Layer>
                <Layer ref={CseAnimation.layerRef} listening={false}>
                  {CseMachine.getControlStash() && CseAnimation.animations.map(c => c.draw())}
                </Layer>
              </Stage>
            </div>
          </div>
        </div>
      );
      Layout.prevLayout = layout;
      if (CseMachine.getPrintableMode()) {
        if (CseMachine.getControlStash()) {
          if (CseMachine.getStackTruncated()) {
            Layout.currentStackTruncLight = layout;
          } else {
            Layout.currentStackLight = layout;
          }
        } else {
          Layout.currentLight = layout;
        }
      } else {
        if (CseMachine.getControlStash()) {
          if (CseMachine.getStackTruncated()) {
            Layout.currentStackTruncDark = layout;
          } else {
            Layout.currentStackDark = layout;
          }
        } else {
          Layout.currentDark = layout;
        }
      }

      return layout;
    }
  }
}
