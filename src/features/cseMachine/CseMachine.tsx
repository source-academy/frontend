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
  // This stores the "Ghost Run (last step x coordinates)" snapshot
  public static masterLayout: LayoutCache | null = null;
  private static printableMode: boolean = false;
  private static controlStash: boolean = false; // TODO: discuss if the default should be true
  private static stackTruncated: boolean = false;
    private static centerAlignment: boolean = false; // added for center alignment
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
  // added for center alignment
  public static toggleCenterAlignment(): void {
    CseMachine.centerAlignment = !CseMachine.centerAlignment;
    CseMachine.redraw();
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
  // added for center alignment
  public static getCenterAlignment(): boolean {
    return CseMachine.centerAlignment;
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

    Layout.setContext(
      context.runtime.environmentTree as EnvTree,
      context.runtime.control,
      context.runtime.stash,
      context.chapter
    );
    // get ghost layout on first run (when user press run and code changes)
    if (!CseMachine.masterLayout) {
      Layout.setContext(
        context.runtime.environmentTree as EnvTree,
        context.runtime.control,
        context.runtime.stash,
        context.chapter
      );

      CseMachine.masterLayout = Layout.getLayoutPositions();
    }

    // Apply Fixed Positions
    if (CseMachine.masterLayout) {
      Layout.applyFixedPositions();
      // Layout.applyFixedPositions(CseMachine.masterLayout);
    }

    this.setVis(Layout.draw());
    this.setIsStepLimitExceeded(context.runtime.control.isEmpty());
    Layout.updateDimensions(Layout.visibleWidth, Layout.visibleHeight);
  }

  static redraw() {
    if (CseMachine.environmentTree && CseMachine.control && CseMachine.stash) {
      // checks if the required diagram exists, and updates the dom node using setVis

      if (CseMachine.getCenterAlignment() || !CseMachine.getCenterAlignment()) {
        Layout.setContext(CseMachine.environmentTree, CseMachine.control, CseMachine.stash);
        if (CseMachine.masterLayout) {
          Layout.applyFixedPositions();
        }
        this.setVis(Layout.draw());
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
        if (CseMachine.masterLayout) {
          Layout.applyFixedPositions();
          // Layout.applyFixedPositions(CseMachine.masterLayout);
        }
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
    this.clear();
  }
}

