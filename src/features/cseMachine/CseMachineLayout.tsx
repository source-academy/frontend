import Heap from 'js-slang/dist/cse-machine/heap';
import { Control, Stash } from 'js-slang/dist/cse-machine/interpreter';
import { Chapter, Frame } from 'js-slang/dist/types';
import { KonvaEventObject } from 'konva/lib/Node';
import React, { RefObject } from 'react';
import { Layer, Rect, Stage } from 'react-konva';
import classes from 'src/styles/Draggable.module.scss';

import { Binding } from './components/Binding';
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
  Data,
  DataArray,
  EnvTree,
  EnvTreeNode,
  GlobalFn,
  NonGlobalFn,
  ReferenceType,
  StreamFn
} from './CseMachineTypes';
import {
  assert,
  deepCopyTree,
  defaultBackgroundColor,
  getNextChildren,
  isBuiltInFn,
  isClosure,
  isDataArray,
  isEnvEqual,
  isGlobalFn,
  isNonGlobalFn,
  isPrimitiveData,
  isStreamFn,
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

  /**
   * memoized values, where keys are either ids for arrays and closures,
   * or the function objects themselves for built-in functions and stream functions
   */
  static values = new Map<string | (() => any), Value>();

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
  static setContext(
    envTree: EnvTree,
    control: Control,
    stash: Stash,
    chapter: Chapter = Chapter.SOURCE_4
  ): void {
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
    Layout.globalEnvNode = deepCopyTree(envTree).root;
    Layout.control = control;
    Layout.stash = stash;

    // remove prelude environment and merge bindings into global env
    Layout.removePreludeEnv();
    // remove global functions that are not referenced in the program
    Layout.removeUnreferencedGlobalFns();
    // initialize levels and frames
    Layout.initializeGrid();
    // initialize control and stash
    Layout.initializeControlStash(chapter);

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

  static initializeControlStash(chapter: Chapter) {
    Layout.previousControlComponent = Layout.controlComponent;
    Layout.previousStashComponent = Layout.stashComponent;
    this.controlComponent = new ControlStack(this.control, chapter);
    this.stashComponent = new StashStack(this.stash, chapter);
  }

  /**
   * remove prelude environment containing predefined functions, by merging the prelude
   * objects into the global environment head and heap
   */
  private static removePreludeEnv() {
    if (!Layout.globalEnvNode.children || Layout.globalEnvNode.children.length === 0) return;

    const preludeEnvNode = Layout.globalEnvNode.children[0];
    const preludeEnv = preludeEnvNode.environment;
    const globalEnv = Layout.globalEnvNode.environment;

    // Add bindings from prelude environment head to global environment head
    for (const [key, value] of Object.entries(preludeEnv.head)) {
      delete preludeEnv.head[key];
      globalEnv.head[key] = value;
      if (isStreamFn(value) && isEnvEqual(value.environment, preludeEnv)) {
        Object.defineProperty(value, 'environment', { value: globalEnv });
      }
    }

    // Move objects from prelude environment heap to global environment heap
    for (const value of preludeEnv.heap.getHeap()) {
      Object.defineProperty(value, 'environment', { value: globalEnv });
      if (isDataArray(value)) {
        for (const item of value) {
          if (isStreamFn(item) && isEnvEqual(item.environment, preludeEnv)) {
            Object.defineProperty(item, 'environment', { value: globalEnv });
          }
        }
      }
      preludeEnv.heap.move(value, globalEnv.heap);
    }

    // update globalEnvNode children
    Layout.globalEnvNode.resetChildren(preludeEnvNode.children);

    // update the tail of each child's environment to point to the global environment
    Layout.globalEnvNode.children.forEach(node => {
      node.environment.tail = globalEnv;
    });
  }

  /** remove any global functions not referenced elsewhere in the program */
  private static removeUnreferencedGlobalFns(): void {
    const referencedFns = new Set<GlobalFn | NonGlobalFn>();
    const visitedData = new Set<DataArray>();

    const findGlobalFnReferences = (envNode: EnvTreeNode): void => {
      const headValues = Object.values(envNode.environment.head);
      const unreferenced = setDifference(envNode.environment.heap.getHeap(), new Set(headValues));
      for (const data of headValues) {
        if (isGlobalFn(data)) {
          referencedFns.add(data);
        } else if (isDataArray(data)) {
          findGlobalFnReferencesInData(data);
        }
      }
      for (const data of unreferenced) {
        // The heap will never contain a global function, unless it is the global/prelude environment
        if (isDataArray(data)) {
          findGlobalFnReferencesInData(data);
        }
      }
      envNode.children.forEach(findGlobalFnReferences);
    };

    const findGlobalFnReferencesInData = (data: DataArray): void => {
      if (visitedData.has(data)) return;
      visitedData.add(data);
      data.forEach(d => {
        if (isGlobalFn(d)) {
          referencedFns.add(d);
        } else if (isDataArray(d)) {
          findGlobalFnReferencesInData(d);
        }
      });
    };

    // First, add any referenced global functions in the stash
    for (const item of Layout.stash.getStack()) {
      if (isGlobalFn(item)) {
        referencedFns.add(item);
      } else if (isDataArray(item)) {
        findGlobalFnReferencesInData(item);
      }
    }

    // Then, find any references within any arrays inside the global environment heap,
    // and also add any non-global functions created in the global frame
    for (const data of Layout.globalEnvNode.environment.heap.getHeap()) {
      if (isNonGlobalFn(data)) {
        referencedFns.add(data);
      } else if (isDataArray(data)) {
        findGlobalFnReferencesInData(data);
      }
    }

    // Finally, find any references inside the global environment children
    Layout.globalEnvNode.children.forEach(findGlobalFnReferences);

    const functionNames = new Map(
      Object.entries(Layout.globalEnvNode.environment.head).map(([key, value]) => [value, key])
    );

    let i = 0;
    const newHead: Frame = {};
    const newHeap = new Heap();
    for (const fn of referencedFns) {
      if (isClosure(fn)) newHeap.add(fn);
      if (isGlobalFn(fn)) newHead[functionNames.get(fn) ?? `${i++}`] = fn;
    }

    // add any arrays from the original heap to the new heap
    for (const item of Layout.globalEnvNode.environment.heap.getHeap()) {
      if (isDataArray(item)) {
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

  /** Creates an instance of the corresponding `Value` if it doesn't already exists,
   *  else, returns the existing value */
  static createValue(data: Data, reference: ReferenceType): Value {
    if (isUnassigned(data)) {
      assert(reference instanceof Binding);
      return new UnassignedValue(reference);
    } else if (isPrimitiveData(data)) {
      return new PrimitiveValue(data, reference);
    } else {
      const existingValue = Layout.values.get(
        isBuiltInFn(data) || isStreamFn(data) ? data : data.id
      );
      if (existingValue) {
        existingValue.addReference(reference);
        return existingValue;
      }

      if (isDataArray(data)) {
        return new ArrayValue(data, reference);
      } else if (isGlobalFn(data)) {
        assert(reference instanceof Binding);
        return new GlobalFnValue(data, reference);
      } else if (isNonGlobalFn(data)) {
        return new FnValue(data, reference);
      }

      return new PrimitiveValue(null, reference);
    }
  }

  static memoizeValue(data: GlobalFn | NonGlobalFn | StreamFn | DataArray, value: Value) {
    if (isBuiltInFn(data) || isStreamFn(data)) Layout.values.set(data, value);
    else Layout.values.set(data.id, value);
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
    if (typeof event != 'boolean') {
      event.evt.preventDefault();
    }
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
        <div className="sa-cse-machine" data-testid="sa-cse-machine">
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
                backgroundColor: defaultBackgroundColor()
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
                    fill={defaultBackgroundColor()}
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
