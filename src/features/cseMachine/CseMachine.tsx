import type { CseSerializedEnvFrame, CseSnapshot } from '../conductor/CseMachineHostPlugin';
import { arrowSelection } from './components/arrows/ArrowSelection';
import { CseAnimation } from './CseMachineAnimation';
import { Layout, type LayoutCache } from './CseMachineLayout';
import type { ArrowOriginFilterKey, ArrowOriginFilters, EnvTree } from './CseMachineTypes';
import type { Control, Stash } from './CseRenderTypes';
import { buildFakeEnvTreeFromSnapshot } from './CseSnapshotAdapter';

type SetVis = (vis: React.ReactNode) => void;
type SetEditorHighlightedLines = (segments: [number, number][]) => void;

/** CSE Machine is exposed from this class */
export default class CseMachine {
  private static readonly arrowOriginFilterKeys: ArrowOriginFilterKey[] = [
    'text',
    'frame',
    'function',
    'array',
    'control',
    'stash',
  ];
  private static readonly defaultArrowOriginFilters: ArrowOriginFilters = {
    text: true,
    frame: true,
    function: true,
    array: true,
    control: true,
    stash: true,
    program: true,
  };
  /** callback function to update the visualization state in the SideContentCseMachine component */
  private static setVis: SetVis;
  /** function to highlight editor lines */
  public static setEditorHighlightedLines: SetEditorHighlightedLines;
  // Ghost layout snapshots, separated by mode to keep coordinates fixed within each mode.
  public static normalLayoutCache: LayoutCache | null = null;
  public static normalLiveLayoutCache: LayoutCache | null = null;
  public static printLayoutCache: LayoutCache | null = null;
  public static printLiveLayoutCache: LayoutCache | null = null;
  public static usedBuiltInNames = new Set<string>();
  private static printableMode: boolean = false;
  private static controlStash: boolean = false; // TODO: discuss if the default should be true
  private static stackTruncated: boolean = false;
  private static centerAlignment: boolean = false;
  private static arrowOriginFilters: ArrowOriginFilters = {
    ...CseMachine.defaultArrowOriginFilters,
  };
  private static currentEnvId: string;
  /** Toggled each time a pair is created; Layout uses it to alternate arrow directions and avoid visual overlap. */
  private static pairCreationMode: boolean = false;
  /** Last snapshot passed to renderSnapshot(); used by redraw() in snapshot mode. */
  private static lastSnapshot: CseSnapshot | null = null;
  /** The `layoutSnapshot` last passed to renderSnapshot(), for redraw(). */
  private static lastLayoutSnapshot: CseSnapshot | undefined;

  public static togglePairCreationMode(): void {
    CseMachine.pairCreationMode = !CseMachine.pairCreationMode;
  }
  public static getPairCreationMode(): boolean {
    return CseMachine.pairCreationMode;
  }

  public static togglePrintableMode(): void {
    CseMachine.printableMode = !CseMachine.printableMode;
  }
  public static toggleControlStash(): void {
    CseMachine.controlStash = !CseMachine.controlStash;
  }
  public static toggleStackTruncated(): void {
    CseMachine.stackTruncated = !CseMachine.stackTruncated;
  }
  public static setClearDeadFrames(enabled: boolean): void {
    Layout.clearDeadFrames = enabled;
  }
  public static clearCachedLayouts(): void {
    CseMachine.normalLayoutCache = null;
    CseMachine.normalLiveLayoutCache = null;
    CseMachine.printLayoutCache = null;
    CseMachine.printLiveLayoutCache = null;
    CseMachine.usedBuiltInNames.clear();
    CseMachine.clearMemoizedLayouts();
  }

  /**
   * Clears memoized rendered nodes while preserving fixed-position caches and
   * used built-in names inferred from source code.
   *
   * Use this for view-only toggles (for example arrow filters) that should
   * force a fresh draw without recomputing global-frame built-in function names.
   */
  public static clearRenderedLayouts(): void {
    CseMachine.clearMemoizedLayouts();
  }

  private static clearMemoizedLayouts(): void {
    Layout.currentLight = undefined;
    Layout.currentDark = undefined;
    Layout.currentStackDark = undefined;
    Layout.currentStackTruncDark = undefined;
    Layout.currentStackLight = undefined;
    Layout.currentStackTruncLight = undefined;
    Layout.prevLayout = undefined;
    Layout.key = 0;
  }
  public static clearLiveLayouts(): void {
    CseMachine.normalLiveLayoutCache = null;
    CseMachine.printLiveLayoutCache = null;
  }
  public static toggleCenterAlignment(): void {
    CseMachine.centerAlignment = !CseMachine.centerAlignment;
  }

  public static getCurrentEnvId(): string {
    return CseMachine.currentEnvId;
  }
  public static getPrintableMode(): boolean {
    return CseMachine.printableMode;
  }
  public static getControlStash(): boolean {
    return CseMachine.controlStash;
  }
  public static getStackTruncated(): boolean {
    return CseMachine.stackTruncated;
  }
  public static getCenterAlignment(): boolean {
    return CseMachine.centerAlignment;
  }

  public static getArrowOriginFilters(): ArrowOriginFilters {
    return { ...CseMachine.arrowOriginFilters };
  }

  public static isArrowOriginVisible(origin: ArrowOriginFilterKey | null): boolean {
    if (origin === null) {
      return true;
    }
    return CseMachine.arrowOriginFilters[origin];
  }

  public static setArrowOriginVisible(origin: ArrowOriginFilterKey, visible: boolean): void {
    CseMachine.arrowOriginFilters[origin] = visible;
  }

  public static setAllArrowOriginsVisible(visible: boolean): void {
    for (const origin of CseMachine.arrowOriginFilterKeys) {
      CseMachine.arrowOriginFilters[origin] = visible;
    }
  }

  public static resetArrowOriginFilters(): void {
    CseMachine.arrowOriginFilters = { ...CseMachine.defaultArrowOriginFilters };
  }
  public static getMasterLayout(): LayoutCache | null {
    return CseMachine.getPrintableMode()
      ? Layout.clearDeadFrames
        ? CseMachine.printLiveLayoutCache
        : CseMachine.printLayoutCache
      : Layout.clearDeadFrames
        ? CseMachine.normalLiveLayoutCache
        : CseMachine.normalLayoutCache;
  }
  public static setMasterLayout(cache: LayoutCache): void {
    if (CseMachine.getPrintableMode()) {
      if (Layout.clearDeadFrames) {
        CseMachine.printLiveLayoutCache = cache;
      } else {
        CseMachine.printLayoutCache = cache;
      }
    } else {
      if (Layout.clearDeadFrames) {
        CseMachine.normalLiveLayoutCache = cache;
      } else {
        CseMachine.normalLayoutCache = cache;
      }
    }
  }

  /** SideContentCseMachine initializes this onMount with the callback function */
  static init(
    setVis: SetVis,
    width: number,
    height: number,
    setEditorHighlightedLines: (segments: [number, number][]) => void,
  ) {
    Layout.visibleHeight = height;
    Layout.visibleWidth = width;
    this.setVis = setVis;
    this.setEditorHighlightedLines = setEditorHighlightedLines;
  }

  static clear() {
    Layout.values.clear();
    arrowSelection.clearSelection();
    CseMachine.lastSnapshot = null;
    CseMachine.lastLayoutSnapshot = undefined;
  }

  /**
   * Renders a language-agnostic CseSnapshot (from the Conductor __cse channel) using the Source
   * renderer. Given `layoutSnapshot`, a snapshot with every frame of the run (see
   * `snapshotWithAllFrames`), frames keep their places from step to step (see `layOutSnapshot`).
   */
  static renderSnapshot(snapshot: CseSnapshot, layoutSnapshot?: CseSnapshot): void {
    if (!this.setVis) {
      throw new Error('CSE machine not initialized');
    }

    CseMachine.lastSnapshot = snapshot;
    CseMachine.lastLayoutSnapshot = layoutSnapshot;

    const activeEnv = snapshot.environments.find((env: CseSerializedEnvFrame) => env.isActive);
    if (activeEnv) {
      CseMachine.currentEnvId = activeEnv.id;
    }

    CseMachine.layOutSnapshot(snapshot, layoutSnapshot);

    this.setVis(Layout.draw());
    Layout.updateDimensions(Layout.visibleWidth, Layout.visibleHeight);
  }

  /**
   * Lays out `snapshot`, placing its frames where they are in a layout of `layoutSnapshot` (every
   * frame of the run, see `snapshotWithAllFrames`), so that they keep their places from step to
   * step, as a Source program's frames do (source-academy/frontend#3594) — or in a layout of
   * `snapshot` itself while dead frames are cleared, which closes the gaps they leave (#3603).
   * The layout caches are recomputed for this snapshot's run (not another's), and center
   * alignment is applied from them.
   */
  private static layOutSnapshot(snapshot: CseSnapshot, layoutSnapshot?: CseSnapshot): void {
    const setContext = (from: CseSnapshot) => {
      const { envTree, fakeControl, fakeStash } = buildFakeEnvTreeFromSnapshot(from);
      Layout.snapshotMode = true;
      try {
        Layout.setContext(
          envTree as unknown as EnvTree,
          fakeControl as unknown as Control,
          fakeStash as unknown as Stash,
        );
      } finally {
        Layout.snapshotMode = false;
      }
    };
    CseMachine.normalLayoutCache = null;
    CseMachine.normalLiveLayoutCache = null;
    CseMachine.printLayoutCache = null;
    CseMachine.printLiveLayoutCache = null;
    // Laying out the frames for their places is not a step: it must neither animate (from the step
    // drawn before) nor become the step that the next animation starts from — its control and
    // stash, and its current frame.
    const { controlComponent, stashComponent } = Layout;
    const restoreFrames = CseAnimation.keepFrames();
    Layout.controlComponent = undefined as unknown as typeof controlComponent;
    try {
      setContext(Layout.clearDeadFrames ? snapshot : (layoutSnapshot ?? snapshot));
      CseMachine.setMasterLayout(Layout.getLayoutPositions(CseMachine.controlStash));
    } finally {
      // Also when the snapshot is malformed and the layout throws: a later draw or animation
      // dereferences these.
      Layout.controlComponent = controlComponent;
      Layout.stashComponent = stashComponent;
      restoreFrames();
    }
    setContext(snapshot);
    Layout.applyFixedPositions();
  }

  /**
   * Draws a snapshot's environments for a view other than the CSE Machine tab — the environment
   * view lent to web plugins (e.g. the environment stepper's environment pane) — and returns the
   * drawing instead of handing it to the CSE Machine tab (`setVis`), which may be mounted (hidden)
   * at the same time. Control and stash are never drawn; the diagram's display preferences
   * (alignment, printable mode, arrow filters) are the shared ones. Every other piece of global
   * state this touches is restored, so the CSE Machine tab's next draw is unaffected.
   */
  static drawEnvironments(
    snapshot: CseSnapshot,
    options: {
      width: number;
      height: number;
      clearDeadFrames: boolean;
      /** Frame colours by frame id (see `Layout.frameColors`). */
      frameColors?: Record<string, string>;
      /**
       * A snapshot with every frame of the run (see `snapshotWithAllFrames`). Frames are placed
       * where they are in its layout, so that they keep their places from step to step, as in the
       * CSE Machine tab (source-academy/frontend#3594) — except while dead frames are cleared,
       * which closes the gaps they leave (#3603).
       */
      layoutSnapshot?: CseSnapshot;
    },
  ): React.ReactNode {
    const saved = {
      controlStash: CseMachine.controlStash,
      clearDeadFrames: Layout.clearDeadFrames,
      currentEnvId: CseMachine.currentEnvId,
      caches: [
        CseMachine.normalLayoutCache,
        CseMachine.normalLiveLayoutCache,
        CseMachine.printLayoutCache,
        CseMachine.printLiveLayoutCache,
      ],
    };
    try {
      CseMachine.controlStash = false;
      Layout.frameColors = options.frameColors
        ? new Map(Object.entries(options.frameColors))
        : undefined;
      Layout.clearDeadFrames = options.clearDeadFrames;
      Layout.visibleWidth = options.width;
      Layout.visibleHeight = options.height;
      const activeEnv = snapshot.environments.find(env => env.isActive);
      if (activeEnv) {
        CseMachine.currentEnvId = activeEnv.id;
      }
      // Draw afresh, not the CSE Machine tab's memoized drawing.
      CseMachine.clearMemoizedLayouts();
      CseMachine.layOutSnapshot(snapshot, options.layoutSnapshot);
      return Layout.draw();
    } finally {
      [
        CseMachine.normalLayoutCache,
        CseMachine.normalLiveLayoutCache,
        CseMachine.printLayoutCache,
        CseMachine.printLiveLayoutCache,
      ] = saved.caches;
      CseMachine.controlStash = saved.controlStash;
      Layout.clearDeadFrames = saved.clearDeadFrames;
      CseMachine.currentEnvId = saved.currentEnvId;
      Layout.frameColors = undefined;
      // Nor may the CSE Machine tab's next redraw reuse this drawing.
      CseMachine.clearMemoizedLayouts();
    }
  }

  static redraw() {
    // Re-render from the last snapshot, as the drawing is of a snapshot.
    if (CseMachine.lastSnapshot) {
      CseMachine.renderSnapshot(CseMachine.lastSnapshot, CseMachine.lastLayoutSnapshot);
    }
  }

  static updateDimensions(width: number, height: number) {
    if (Layout.isLent()) {
      // The CSE Machine tab is hidden behind a view that borrows `Layout`; resize it once it is back.
      Layout.deferDimensions(width, height);
      return;
    }
    if (Layout.stageRef != null && width !== null && height !== null) {
      Layout.updateDimensions(width, height);
    }
  }

  static clearCse() {
    if (this.setVis) {
      this.setVis(undefined);
    }
    CseMachine.setClearDeadFrames(false);
    this.clear();
  }
}
