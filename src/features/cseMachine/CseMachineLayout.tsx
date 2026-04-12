import Heap from 'js-slang/dist/cse-machine/heap';
import { Control, Stash } from 'js-slang/dist/cse-machine/interpreter';
import { Chapter } from 'js-slang/dist/langs';
import { Frame } from 'js-slang/dist/types';
import { Group as KonvaGroupNode } from 'konva/lib/Group';
import { Layer as KonvaLayerNode } from 'konva/lib/Layer';
import { KonvaEventObject } from 'konva/lib/Node';
import { Stage } from 'konva/lib/Stage';
import React, { RefObject } from 'react';
import {
  Group as KonvaGroup,
  Layer as KonvaLayer,
  Rect as KonvaRect,
  Stage as KonvaStage
} from 'react-konva';
import classes from 'src/styles/Draggable.module.scss';

import { arrowSelection } from './components/arrows/ArrowSelection';
import { Binding } from './components/Binding';
import { ControlStack } from './components/ControlStack';
import { Level } from './components/Level';
import { StashStack } from './components/StashStack';
import { ArrayValue } from './components/values/ArrayValue';
import { ContValue } from './components/values/ContValue';
import { FnValue } from './components/values/FnValue';
import { GlobalFnValue } from './components/values/GlobalFnValue';
import { PrimitiveValue } from './components/values/PrimitiveValue';
import { UnassignedValue } from './components/values/UnassignedValue';
import { Value } from './components/values/Value';
import CseMachine from './CseMachine';
import { CseAnimation } from './CseMachineAnimation';
import { Config, ShapeDefaultProps } from './CseMachineConfig';
import { ControlStashConfig } from './CseMachineControlStashConfig'; // Added for offset
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
  computeLiveState,
  deepCopyTree,
  defaultBackgroundColor,
  getNextChildren,
  isBuiltInFn,
  isClosure,
  isDataArray,
  isEmptyEnvironment,
  isEnvEqual,
  isGlobalFn,
  isNonGlobalFn,
  isPrimitiveData,
  isStreamFn,
  isUnassigned,
  setDifference
} from './CseMachineUtils';
import { Continuation, isContinuation } from './utils/continuation';
export type LayoutCache = {
  framesX: Map<string, number>;
  framesY: Map<string, number>;
  framesWidth: Map<string, number>;
  levelWidth: Map<string, number>;
  largestWidth: number;
};

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

  /** all environment and value IDs that are live in the current context */
  static liveEnvIDs: Set<string> = new Set();
  static liveObjectIDs: Set<string> = new Set();
  /** hide non-live frames temporarily for the current step */
  static clearDeadFrames: boolean = false;

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
  static stageRef: RefObject<Stage | null> = React.createRef();
  static contentGroupRef: RefObject<KonvaGroupNode | null> = React.createRef();
  static animationGroupRef: RefObject<KonvaGroupNode | null> = React.createRef();
  static arrowUnderlayLayerRef: RefObject<KonvaLayerNode | null> = React.createRef();
  static underlayArrows: React.ReactNode[] = [];

  // buffer for faster rendering of diagram when scrolling
  static invisiblePaddingVertical: number = 300;
  static invisiblePaddingHorizontal: number = 300;
  static scrollContainerRef: RefObject<HTMLDivElement | null> = React.createRef();

  static resetUnderlayArrows() {
    Layout.underlayArrows = [];
  }

  static registerUnderlayArrow(arrow: React.ReactNode) {
    Layout.underlayArrows.push(arrow);
  }

  static updateDimensions(width: number, height: number) {
    // update the size of the scroll container and stage given the width and height of the sidebar content.
    Layout.visibleWidth = width;
    Layout.visibleHeight = height;
    Layout._width = Math.max(Layout.visibleWidth, Layout.stageWidth);
    Layout._height = Math.max(Layout.visibleHeight, Layout.stageHeight);
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
    Layout.invisiblePaddingVertical =
      Layout.stageHeight > Layout.visibleHeight
        ? (Layout.stageHeight - Layout.visibleHeight) / 2
        : 0;
    Layout.invisiblePaddingHorizontal =
      Layout.stageWidth > Layout.visibleWidth ? (Layout.stageWidth - Layout.visibleWidth) / 2 : 0;

    const container = this.scrollContainerRef.current;
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
    arrowSelection.clearSelection();
    Layout.key = 0;
    Layout.resetUnderlayArrows();

    // deep copy so we don't mutate the context
    Layout.globalEnvNode = deepCopyTree(envTree).root;
    Layout.control = control;
    Layout.stash = stash;

    // remove prelude environment and merge bindings into global env
    Layout.removePreludeEnv();
    // remove global functions that are not referenced in the program
    Layout.removeUnreferencedGlobalFns();

    // compute liveness on the same tree we render
    const liveState = computeLiveState({ root: Layout.globalEnvNode } as EnvTree);
    Layout.liveEnvIDs = liveState.liveEnvIds;
    Layout.liveObjectIDs = liveState.liveObjectIds;

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
      Layout.visibleHeight,
      Config.CanvasMinHeight,
      lastLevel.y() + lastLevel.height() + Config.CanvasPaddingY,
      Layout.controlStashHeight ?? 0
    );
    Layout._width = Math.max(
      Layout.visibleWidth,
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

    // only include predeclared or built-in functions used in user code
    for (const name of CseMachine.usedBuiltInNames) {
      const fn = Layout.globalEnvNode.environment.head[name];
      if (fn && isGlobalFn(fn)) referencedFns.add(fn);
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

  /**
   * Sort environment nodes by creation order so left-to-right placement remains chronological.
   * JS Slang environment ids are numeric strings that increase monotonically as frames are created.
   */
  private static sortNodesByCreation(nodes: EnvTreeNode[]): EnvTreeNode[] {
    return [...nodes].sort((left, right) =>
      left.environment.id.localeCompare(right.environment.id, undefined, { numeric: true })
    );
  }

  /** initializes grid */
  private static initializeGrid(): void {
    this.levels = [];
    let frontier: EnvTreeNode[] = Layout.clearDeadFrames
      ? Layout.getVisibleChildren([Layout.globalEnvNode])
      : [Layout.globalEnvNode];
    frontier = Layout.sortNodesByCreation(frontier);
    let prevLevel: Level | null = null;
    let currLevel: Level;

    while (frontier.length > 0) {
      currLevel = new Level(prevLevel, frontier);
      this.levels.push(currLevel);
      const nextFrontier: EnvTreeNode[] = [];

      frontier.forEach(e => {
        e.children.forEach(c => {
          const nextChildren = Layout.clearDeadFrames
            ? Layout.getVisibleChildren([c as EnvTreeNode])
            : getNextChildren(c as EnvTreeNode);
          nextChildren.forEach(c => (c.parent = e));
          nextFrontier.push(...nextChildren);
        });
      });

      prevLevel = currLevel;
      frontier = Layout.sortNodesByCreation(nextFrontier);
    }
  }

  /**
   * Returns the next environment nodes that should be rendered.
   * When broom mode is on, dead environments are skipped and their children are promoted.
   * Empty environments are also skipped to preserve existing behavior.
   *
   * @param nodes candidate nodes
   */
  private static getVisibleChildren(nodes: EnvTreeNode[]): EnvTreeNode[] {
    const result: EnvTreeNode[] = [];

    const visit = (node: EnvTreeNode) => {
      const isLive = Layout.liveEnvIDs.has(node.environment.id);
      const isEmpty = isEmptyEnvironment(node.environment);
      const shouldSkip = isEmpty || !isLive;

      if (!shouldSkip) {
        result.push(node);
        return;
      }

      node.children.forEach(child => visit(child as EnvTreeNode));
    };

    nodes.forEach(node => visit(node));
    return result;
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
      } else if (isContinuation(data)) {
        return new ContValue(data, reference);
      } else if (isGlobalFn(data)) {
        assert(reference instanceof Binding);
        return new GlobalFnValue(data, reference);
      } else if (isNonGlobalFn(data)) {
        return new FnValue(data, reference);
      }

      return new PrimitiveValue(null, reference);
    }
  }

  static memoizeValue(
    data: GlobalFn | NonGlobalFn | StreamFn | Continuation | DataArray,
    value: Value
  ) {
    if (isBuiltInFn(data) || isStreamFn(data)) Layout.values.set(data, value);
    else Layout.values.set((data as any).id, value);
  }

  private static getExportScale(width: number, height: number, padding: number): number {
    const safeWidth = Math.max(Config.MaxExportWidth - padding * 2, 1);
    const safeHeight = Math.max(Config.MaxExportHeight - padding * 2, 1);
    return Math.min(safeWidth / width, safeHeight / height, 1);
  }

  private static getExportBounds() {
    const bounds = [
      this.contentGroupRef.current?.getClientRect(),
      this.animationGroupRef.current?.getClientRect()
    ].filter(
      (rect): rect is { x: number; y: number; width: number; height: number } =>
        !!rect && rect.width > 0 && rect.height > 0
    );

    if (bounds.length === 0) {
      return {
        x: Layout.invisiblePaddingHorizontal,
        y: Layout.invisiblePaddingVertical,
        width: Layout.width(),
        height: Layout.height()
      };
    }

    const minX = Math.min(...bounds.map(rect => rect.x));
    const minY = Math.min(...bounds.map(rect => rect.y));
    const maxX = Math.max(...bounds.map(rect => rect.x + rect.width));
    const maxY = Math.max(...bounds.map(rect => rect.y + rect.height));
    const padding = Math.max(Config.CanvasPaddingX, Config.CanvasPaddingY);

    return {
      x: Math.max(0, minX - padding),
      y: Math.max(0, minY - padding),
      width: maxX - minX + padding * 2,
      height: maxY - minY + padding * 2
    };
  }

  private static fitStageToBounds(bounds: { x: number; y: number; width: number; height: number }) {
    const stage = this.stageRef.current;
    const container = this.scrollContainerRef.current;
    if (!stage) {
      return;
    }

    const viewportWidth = Math.max(Layout.visibleWidth, 1);
    const viewportHeight = Math.max(Layout.visibleHeight, 1);
    const scale = Math.min(viewportWidth / bounds.width, viewportHeight / bounds.height);
    const nextScale = Number.isFinite(scale) && scale > 0 ? scale : 1;

    stage.width(Layout.stageWidth);
    stage.height(Layout.stageHeight);
    stage.scale({ x: nextScale, y: nextScale });
    stage.position({
      x: (viewportWidth - bounds.width * nextScale) / 2 - bounds.x * nextScale,
      y: (viewportHeight - bounds.height * nextScale) / 2 - bounds.y * nextScale
    });
    container?.scrollTo({ left: 0, top: 0 });
    Layout.handleScrollPosition(0, 0);
    stage.batchDraw();
  }

  /**
   * Scrolls diagram to top left, resets the zoom, and saves the full diagram as a single image.
   * If the layout exceeds safe export bounds, the image is scaled down to fit.
   */
  static exportImage = () => {
    const container = this.scrollContainerRef.current;
    const stage = this.stageRef.current;
    if (!stage) {
      return;
    }

    const previousStageWidth = stage.width();
    const previousStageHeight = stage.height();

    const finalizeStage = (bounds: { x: number; y: number; width: number; height: number }) => {
      stage.width(previousStageWidth);
      stage.height(previousStageHeight);
      Layout.fitStageToBounds(bounds);
    };

    container?.scrollTo({ left: 0, top: 0 });
    Layout.handleScrollPosition(0, 0);
    stage.scale({ x: 1, y: 1 });
    stage.position({ x: 0, y: 0 });

    const bounds = Layout.getExportBounds();
    const exportPadding = Math.max(Config.CanvasPaddingX, Config.CanvasPaddingY);
    const exportScale = Layout.getExportScale(bounds.width, bounds.height, exportPadding);

    stage.width(Math.max(previousStageWidth, Math.ceil(bounds.x + bounds.width)));
    stage.height(Math.max(previousStageHeight, Math.ceil(bounds.y + bounds.height)));
    stage.batchDraw();

    const rawImageUrl = stage.toDataURL({
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      height: bounds.height,
      pixelRatio: exportScale,
      mimeType: 'image/png'
    });

    const image = new window.Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = image.width + exportPadding * 2;
      canvas.height = image.height + exportPadding * 2;
      const context = canvas.getContext('2d');

      if (!context) {
        finalizeStage(bounds);
        return;
      }

      context.fillStyle = defaultBackgroundColor();
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, exportPadding, exportPadding);

      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = canvas.toDataURL('image/jpeg');
      a.download = 'diagram.jpg';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      finalizeStage(bounds);
    };
    image.onerror = () => {
      finalizeStage(bounds);
    };
    image.src = rawImageUrl;
  };

  /**
   * Calculates the required transformation for the stage given the scroll-container div scroll position.
   * @param x x position of the scroll container
   * @param y y position of the scroll container
   */
  private static handleScrollPosition(x: number, y: number) {
    if (!this.stageRef.current) return;
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
      const { x: pointerX, y: pointerY } = stage.getPointerPosition() ?? {
        x: Layout.visibleWidth / 2 - stage.x(),
        y: Layout.visibleHeight / 2 - stage.y()
      };
      const mousePointTo = {
        x: (pointerX - stage.x()) / oldScale,
        y: (pointerY - stage.y()) / oldScale
      };

      // zoom in or zoom out
      const direction =
        typeof event != 'boolean' ? (event.evt.deltaY > 0 ? -1 : 1) : event ? 1 : -1;

      // Keep the zoom-in ceiling, but allow unlimited zooming out.
      if (direction < 0 || oldScale < 3) {
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
      Layout.resetUnderlayArrows();
      const levelNodes = Layout.levels.map(level => level.draw());
      const controlNode = CseMachine.getControlStash() ? Layout.controlComponent.draw() : null;
      const stashNode = CseMachine.getControlStash() ? Layout.stashComponent.draw() : null;
      const underlayArrows = [...Layout.underlayArrows];
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
              <KonvaStage
                width={Layout.stageWidth}
                height={Layout.stageHeight}
                ref={Layout.stageRef}
                draggable
                onWheel={Layout.zoomStage}
                className={classes['draggable']}
              >
                <KonvaLayer ref={Layout.arrowUnderlayLayerRef}>
                  <KonvaRect
                    {...ShapeDefaultProps}
                    x={0}
                    y={0}
                    width={Layout.width()}
                    height={Layout.height()}
                    fillEnabled={true}
                    strokeEnabled={false}
                    key={Layout.key++}
                    listening={false}
                  />
                  {underlayArrows}
                </KonvaLayer>
                <KonvaLayer>
                  <KonvaRect
                    {...ShapeDefaultProps}
                    x={0}
                    y={0}
                    width={Layout.width()}
                    height={Layout.height()}
                    // fill={defaultBackgroundColor()}
                    key={Layout.key++}
                    listening={false}
                  />
                  <KonvaGroup ref={Layout.contentGroupRef}>
                    {levelNodes}
                    {controlNode}
                    {stashNode}
                  </KonvaGroup>
                </KonvaLayer>
                <KonvaLayer ref={CseAnimation.layerRef} listening={false}>
                  <KonvaGroup ref={Layout.animationGroupRef}>
                    {CseAnimation.animations.map(c => c.draw())}
                  </KonvaGroup>
                </KonvaLayer>
              </KonvaStage>
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

  /**
   * Populate cache with final x coordinates of each frame, width of each level, and largest level width,
   * to be used for fixed positioning of frames and center alignment.
   */
  static getLayoutPositions(controlStash: boolean): LayoutCache {
    const cache: LayoutCache = {
      framesX: new Map(),
      framesY: new Map(),
      framesWidth: new Map(),
      levelWidth: new Map(),
      largestWidth: 0
    };

    Layout.levels.forEach(level => {
      const frames = level.frames;
      const controlStashOffset =
        ControlStashConfig.ControlPosX + ControlStashConfig.ControlItemWidth;
      const offset = controlStash ? controlStashOffset : 0;
      // `level.width()` already includes the last frame's right-side overflow.
      const currWidth = level.width();
      cache.largestWidth = Math.max(cache.largestWidth, currWidth);
      frames.forEach(frame => {
        cache.framesX.set(frame.environment.id, frame.x() - offset);
        cache.framesWidth.set(frame.environment.id, frame.width());
        cache.framesY.set(frame.environment.id, frame.y());
        cache.levelWidth.set(frame.environment.id, currWidth);
      });
    });
    return cache;
  }

  /**
   * Get the cached x coordinate corresponding to the given environment id, and add offset.
   * @param envId id of current component in the environment
   * @returns coordinate of cached position, or undefined if it doesn't exist
   */
  static getGhostFrameX(envId: string): number | undefined {
    const cache = CseMachine.getMasterLayout();
    if (cache && cache.framesX.has(envId)) {
      const fixedX = cache.framesX.get(envId)!;
      let offset: number = 0;
      offset += CseMachine.getControlStash()
        ? ControlStashConfig.ControlPosX + ControlStashConfig.ControlItemWidth
        : 0;
      offset += CseMachine.getCenterAlignment()
        ? Math.floor((cache.largestWidth - cache.levelWidth.get(envId)!) / 2)
        : 0;
      return fixedX + offset;
    }
    return undefined;
  }

  /**
   * Get the cached y coordinate corresponding to the given environment id, and add offset.
   * @param envId id of current component in the environment
   * @returns coordinate of cached position, or undefined if it doesn't exist
   */
  static getGhostFrameY(envId: string): number | undefined {
    const cache = CseMachine.getMasterLayout();
    if (cache && cache.framesY.has(envId)) {
      const fixedY = cache.framesY.get(envId)!;
      return fixedY;
    }
    return undefined;
  }

  static getGhostFrameWidth(envId: string): number | undefined {
    const cache = CseMachine.getMasterLayout();
    if (cache && cache.framesWidth.has(envId)) {
      const fixedWidth = cache.framesWidth.get(envId)!;
      return fixedWidth;
    }
    return undefined;
  }

  /**
   * Reassign x coordinate of every frame to their predetermined position
   */
  static applyFixedPositions() {
    if (!CseMachine.getMasterLayout()) {
      // shouldn't happen since getLayoutPositions is called before, but just in case
      return;
    }
    const cache = CseMachine.getMasterLayout()!; // getLayoutPositions() must have been called before
    Layout.levels.forEach(level => {
      level.frames.forEach(frame => {
        const id = frame.environment.id;

        // Get predetermined X and Y coordinates together
        if (cache.framesX.has(id) && cache.framesY.has(id)) {
          const fixedX = Layout.getGhostFrameX(id)!;
          const fixedY = Layout.getGhostFrameY(id)!;

          frame.reassignCoordinatesX(fixedX);
          frame.reassignCoordinatesY(fixedY);

          frame.bindings.forEach(binding => {
            binding.reassignCoordinates(fixedX, fixedY);
          });
        }

        // get predetermined width
        if (cache.framesWidth.has(id)) {
          const fixedWidth = Layout.getGhostFrameWidth(id)!;
          // assuming current frame's width is bigger. Shouldn't happen but keep Seer happy
          const currentWidth = frame.width();
          frame.reassignWidth(Math.max(currentWidth, fixedWidth));
        }
      });
    });
  }
}
