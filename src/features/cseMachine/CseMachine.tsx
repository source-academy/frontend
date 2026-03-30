import { Context } from 'js-slang';
import { Control, Stash } from 'js-slang/dist/cse-machine/interpreter';
import React from 'react';

import { arrowSelection } from './components/arrows/ArrowSelection';
import { Layout, LayoutCache } from './CseMachineLayout';
import { EnvTree } from './CseMachineTypes';
import { deepCopyTree, getEnvId } from './CseMachineUtils';

type SetVis = (vis: React.ReactNode) => void;
type SetEditorHighlightedLines = (segments: [number, number][]) => void;
type SetisStepLimitExceeded = (isControlEmpty: boolean) => void;

/** CSE Machine is exposed from this class */
export default class CseMachine {
  /** callback function to update the visualization state in the SideContentCseMachine component */
  private static setVis: SetVis;
  /** function to highlight editor lines */
  public static setEditorHighlightedLines: SetEditorHighlightedLines;
  /** callback function to update the step limit exceeded state in the SideContentCseMachine component */
  private static setIsStepLimitExceeded: SetisStepLimitExceeded;
  // Ghost layout snapshots, separated by mode to keep coordinates fixed within each mode.
  public static normalLayoutCache: LayoutCache | null = null;
  public static normalLiveLayoutCache: LayoutCache | null = null;
  public static printLayoutCache: LayoutCache | null = null;
  public static printLiveLayoutCache: LayoutCache | null = null;
  private static printableMode: boolean = false;
  private static controlStash: boolean = false; // TODO: discuss if the default should be true
  private static stackTruncated: boolean = false;
  private static centerAlignment: boolean = false; // added for center alignment
  private static centerAlignmentToggled: boolean = false;
  private static environmentTree: EnvTree | undefined;
  private static currentEnvId: string;
  private static control: Control | undefined;
  private static stash: Stash | undefined;
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
  }
  public static clearLiveLayouts(): void {
    CseMachine.normalLiveLayoutCache = null;
    CseMachine.printLiveLayoutCache = null;
  }
  public static toggleCenterAlignment(): void {
    CseMachine.centerAlignment = !CseMachine.centerAlignment;
    CseMachine.centerAlignmentToggled = true;
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
      CseMachine.printLayoutCache = cache;
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

  public static isControl(): boolean {
    return this.control ? !this.control.isEmpty() : false;
  }

  /** SideContentCseMachine initializes this onMount with the callback function */
  static init(
    setVis: SetVis,
    width: number,
    height: number,
    setEditorHighlightedLines: (segments: [number, number][]) => void,
    setIsStepLimitExceeded: SetisStepLimitExceeded
  ) {
    Layout.visibleHeight = height;
    Layout.visibleWidth = width;
    this.setVis = setVis;
    this.setEditorHighlightedLines = setEditorHighlightedLines;
    this.setIsStepLimitExceeded = setIsStepLimitExceeded;
  }

  static clear() {
    Layout.values.clear();
    arrowSelection.clearSelection();
  }

  /** updates the visualization state in the SideContentCseMachine component based on
   * the JS Slang context passed in */
  static drawCse(context: Context) {
    // store environmentTree at last breakpoint.
    CseMachine.environmentTree = deepCopyTree(context.runtime.environmentTree as EnvTree);
    CseMachine.currentEnvId = getEnvId(context.runtime.environments[0]);
    if (!this.setVis || !context.runtime.control || !context.runtime.stash)
      throw new Error('CSE machine not initialized');
    CseMachine.control = context.runtime.control;
    CseMachine.stash = context.runtime.stash;
    CseMachine.setClearDeadFrames(false);

    Layout.setContext(
      context.runtime.environmentTree as EnvTree,
      context.runtime.control,
      context.runtime.stash,
      context.chapter
    );

    // Build ghost layout cache lazily per mode, using mode-specific layout.
    if (!CseMachine.normalLayoutCache || !CseMachine.printLayoutCache) {
      const originalMode = CseMachine.getPrintableMode();

      const buildCache = (printable: boolean) => {
        CseMachine.printableMode = printable;
        Layout.setContext(
          context.runtime.environmentTree as EnvTree,
          context.runtime.control!,
          context.runtime.stash!,
          context.chapter
        );
        return Layout.getLayoutPositions(this.controlStash);
      };

      CseMachine.printLayoutCache = buildCache(true);
      CseMachine.normalLayoutCache = buildCache(false);

      // Restore the user's actual mode setting and layout.
      CseMachine.printableMode = originalMode;
      Layout.setContext(
        context.runtime.environmentTree as EnvTree,
        context.runtime.control,
        context.runtime.stash,
        context.chapter
      );
    }

    // Apply Fixed Positions
    if (CseMachine.getMasterLayout()) {
      Layout.applyFixedPositions();
    }
    this.setVis(Layout.draw());
    this.setIsStepLimitExceeded(context.runtime.control.isEmpty());
    Layout.updateDimensions(Layout.visibleWidth, Layout.visibleHeight);
  }

  static redraw() {
    if (CseMachine.environmentTree && CseMachine.control && CseMachine.stash) {
      // checks if the required diagram exists, and updates the dom node using setVis

      // if center alignment is toggled, change the alignment and redraw the diagram with new coordinates
      if (this.centerAlignmentToggled) {
        Layout.setContext(CseMachine.environmentTree, CseMachine.control, CseMachine.stash);
        if (!CseMachine.getMasterLayout()) {
          CseMachine.setMasterLayout(Layout.getLayoutPositions(this.controlStash));
        }
        Layout.applyFixedPositions();
        this.setVis(Layout.draw());
        this.centerAlignmentToggled = false;
      }
      // redraw environment model and populate live layout caches
      if (Layout.clearDeadFrames) {
        Layout.setContext(CseMachine.environmentTree, CseMachine.control, CseMachine.stash);
        if (!CseMachine.getMasterLayout()) {
          CseMachine.setMasterLayout(Layout.getLayoutPositions(this.controlStash));
        }
        Layout.applyFixedPositions();
      }

      if (
        CseMachine.getPrintableMode() &&
        CseMachine.getControlStash() &&
        CseMachine.getStackTruncated() &&
        Layout.currentStackTruncLight !== undefined
      ) {
        this.setVis(Layout.currentStackTruncLight);
      } else if (
        CseMachine.getPrintableMode() &&
        CseMachine.getControlStash() &&
        !CseMachine.getStackTruncated() &&
        Layout.currentStackLight !== undefined
      ) {
        this.setVis(Layout.currentStackLight);
      } else if (
        !CseMachine.getPrintableMode() &&
        CseMachine.getControlStash() &&
        CseMachine.getStackTruncated() &&
        Layout.currentStackTruncDark !== undefined
      ) {
        this.setVis(Layout.currentStackTruncDark);
      } else if (
        !CseMachine.getPrintableMode() &&
        CseMachine.getControlStash() &&
        !CseMachine.getStackTruncated() &&
        Layout.currentStackDark !== undefined
      ) {
        this.setVis(Layout.currentStackDark);
      } else if (
        CseMachine.getPrintableMode() &&
        !CseMachine.getControlStash() &&
        Layout.currentLight !== undefined
      ) {
        this.setVis(Layout.currentLight);
      } else if (
        !CseMachine.getPrintableMode() &&
        !CseMachine.getControlStash() &&
        Layout.currentDark !== undefined
      ) {
        this.setVis(Layout.currentDark);
      } else {
        Layout.setContext(CseMachine.environmentTree, CseMachine.control, CseMachine.stash);
        if (!CseMachine.getMasterLayout()) {
          CseMachine.setMasterLayout(Layout.getLayoutPositions(this.controlStash));
        }
        Layout.applyFixedPositions();
        this.setVis(Layout.draw());
      }
      Layout.updateDimensions(Layout.visibleWidth, Layout.visibleHeight);
    }
  }

  static updateDimensions(width: number, height: number) {
    if (Layout.stageRef != null && width !== null && height !== null) {
      Layout.updateDimensions(width, height);
    }
  }

  static clearCse() {
    if (this.setVis) {
      this.setVis(undefined);
      CseMachine.environmentTree = undefined;
      CseMachine.control = undefined;
      CseMachine.stash = undefined;
    }
    CseMachine.setClearDeadFrames(false);
    this.clear();
  }
}
