import { Context } from 'js-slang';
import { Control, Stash } from 'js-slang/dist/cse-machine/interpreter';
import React from 'react';

import { Layout } from './CSEMachineLayout';
import { EnvTree } from './CSEMachineTypes';
import { deepCopyTree, getEnvID } from './CSEMachineUtils';

type SetVis = (vis: React.ReactNode) => void;
type SetEditorHighlightedLines = (segments: [number, number][]) => void;
type SetisStepLimitExceeded = (isControlEmpty: boolean) => void;

/** CSE Machine is exposed from this class */
export default class CSEMachine {
  /** callback function to update the visualization state in the SideContentCSEMachine component */
  private static setVis: SetVis;
  /** function to highlight editor lines */
  public static setEditorHighlightedLines: SetEditorHighlightedLines;
  /** callback function to update the step limit exceeded state in the SideContentCSEMachine component */
  private static setIsStepLimitExceeded: SetisStepLimitExceeded;
  private static printableMode: boolean = false;
  private static compactLayout: boolean = true;
  private static controlStash: boolean = false; // TODO: discuss if the default should be true
  private static stackTruncated: boolean = false;
  private static environmentTree: EnvTree | undefined;
  private static currentEnvId: string;
  private static control: Control | undefined;
  private static stash: Stash | undefined;
  public static togglePrintableMode(): void {
    CSEMachine.printableMode = !CSEMachine.printableMode;
  }
  public static toggleCompactLayout(): void {
    CSEMachine.compactLayout = !CSEMachine.compactLayout;
  }
  public static toggleControlStash(): void {
    CSEMachine.controlStash = !CSEMachine.controlStash;
  }
  public static toggleStackTruncated(): void {
    CSEMachine.stackTruncated = !CSEMachine.stackTruncated;
  }
  public static getCurrentEnvId(): string {
    return CSEMachine.currentEnvId;
  }
  public static getPrintableMode(): boolean {
    return CSEMachine.printableMode;
  }
  public static getCompactLayout(): boolean {
    return CSEMachine.compactLayout;
  }
  public static getControlStash(): boolean {
    return CSEMachine.controlStash;
  }
  public static getStackTruncated(): boolean {
    return CSEMachine.stackTruncated;
  }

  public static isControl(): boolean {
    return this.control ? !this.control.isEmpty() : false;
  }

  /** SideContentCSEMachine initializes this onMount with the callback function */
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
    Layout.compactValues.clear();
  }

  /** updates the visualization state in the SideContentCSEMachine component based on
   * the JS Slang context passed in */
  static drawCSE(context: Context) {
    // store environmentTree at last breakpoint.
    CSEMachine.environmentTree = deepCopyTree(context.runtime.environmentTree as EnvTree);
    CSEMachine.currentEnvId = getEnvID(context.runtime.environments[0]);
    if (!this.setVis || !context.runtime.control || !context.runtime.stash)
      throw new Error('CSE machine not initialized');
    CSEMachine.control = context.runtime.control;
    CSEMachine.stash = context.runtime.stash;

    Layout.setContext(
      context.runtime.environmentTree as EnvTree,
      context.runtime.control,
      context.runtime.stash
    );
    this.setVis(Layout.draw());
    this.setIsStepLimitExceeded(context.runtime.control.isEmpty());
    Layout.updateDimensions(Layout.visibleWidth, Layout.visibleHeight);
  }

  static redraw() {
    if (CSEMachine.environmentTree && CSEMachine.control && CSEMachine.stash) {
      // checks if the required diagram exists, and updates the dom node using setVis
      if (
        CSEMachine.getCompactLayout() &&
        CSEMachine.getPrintableMode() &&
        CSEMachine.getControlStash() &&
        CSEMachine.getStackTruncated() &&
        Layout.currentStackTruncLight !== undefined
      ) {
        this.setVis(Layout.currentStackTruncLight);
      } else if (
        CSEMachine.getCompactLayout() &&
        CSEMachine.getPrintableMode() &&
        CSEMachine.getControlStash() &&
        !CSEMachine.getStackTruncated() &&
        Layout.currentStackLight !== undefined
      ) {
        this.setVis(Layout.currentStackLight);
      } else if (
        CSEMachine.getCompactLayout() &&
        !CSEMachine.getPrintableMode() &&
        CSEMachine.getControlStash() &&
        CSEMachine.getStackTruncated() &&
        Layout.currentStackTruncDark !== undefined
      ) {
        this.setVis(Layout.currentStackTruncDark);
      } else if (
        CSEMachine.getCompactLayout() &&
        !CSEMachine.getPrintableMode() &&
        CSEMachine.getControlStash() &&
        !CSEMachine.getStackTruncated() &&
        Layout.currentStackDark !== undefined
      ) {
        this.setVis(Layout.currentStackDark);
      } else if (
        CSEMachine.getCompactLayout() &&
        CSEMachine.getPrintableMode() &&
        !CSEMachine.getControlStash() &&
        Layout.currentCompactLight !== undefined
      ) {
        this.setVis(Layout.currentCompactLight);
      } else if (
        CSEMachine.getCompactLayout() &&
        !CSEMachine.getPrintableMode() &&
        !CSEMachine.getControlStash() &&
        Layout.currentCompactDark !== undefined
      ) {
        this.setVis(Layout.currentCompactDark);
      } else if (
        !CSEMachine.getCompactLayout() &&
        CSEMachine.getPrintableMode() &&
        !CSEMachine.getControlStash() &&
        Layout.currentLight !== undefined
      ) {
        this.setVis(Layout.currentLight);
      } else if (
        !CSEMachine.getCompactLayout() &&
        !CSEMachine.getPrintableMode() &&
        !CSEMachine.getControlStash() &&
        Layout.currentDark !== undefined
      ) {
        this.setVis(Layout.currentDark);
      } else {
        Layout.setContext(
          CSEMachine.environmentTree,
          CSEMachine.control,
          CSEMachine.stash
        );
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

  static clearCSE() {
    if (this.setVis) {
      this.setVis(undefined);
      CSEMachine.environmentTree = undefined;
      CSEMachine.control = undefined;
      CSEMachine.stash = undefined;
    }
    this.clear();
  }
}
