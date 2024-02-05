import { Context } from 'js-slang';
import { Control, Stash } from 'js-slang/dist/cse-machine/interpreter';
import React from 'react';

import { Layout } from './EnvVisualizerLayout';
import { EnvTree } from './EnvVisualizerTypes';
import { deepCopyTree, getEnvID } from './EnvVisualizerUtils';

type SetVis = (vis: React.ReactNode) => void;
type SetEditorHighlightedLines = (segments: [number, number][]) => void;
type SetisStepLimitExceeded = (isControlEmpty: boolean) => void;

/** Environment Visualizer is exposed from this class */
export default class EnvVisualizer {
  /** callback function to update the visualization state in the SideContentEnvVis component */
  private static setVis: SetVis;
  /** function to highlight editor lines */
  public static setEditorHighlightedLines: SetEditorHighlightedLines;
  /** callback function to update the step limit exceeded state in the SideContentEnvVis component */
  private static setIsStepLimitExceeded: SetisStepLimitExceeded;
  private static printableMode: boolean = false;
  private static compactLayout: boolean = true;
  private static controlStash: boolean = false;
  private static stackTruncated: boolean = false;
  private static environmentTree: EnvTree | undefined;
  private static currentEnvId: string;
  private static control: Control | undefined;
  private static stash: Stash | undefined;
  public static togglePrintableMode(): void {
    EnvVisualizer.printableMode = !EnvVisualizer.printableMode;
  }
  public static toggleCompactLayout(): void {
    EnvVisualizer.compactLayout = !EnvVisualizer.compactLayout;
  }
  public static toggleControlStash(): void {
    EnvVisualizer.controlStash = !EnvVisualizer.controlStash;
  }
  public static toggleStackTruncated(): void {
    EnvVisualizer.stackTruncated = !EnvVisualizer.stackTruncated;
  }
  public static getCurrentEnvId(): string {
    return EnvVisualizer.currentEnvId;
  }
  public static getPrintableMode(): boolean {
    return EnvVisualizer.printableMode;
  }
  public static getCompactLayout(): boolean {
    return EnvVisualizer.compactLayout;
  }
  public static getControlStash(): boolean {
    return EnvVisualizer.controlStash;
  }
  public static getStackTruncated(): boolean {
    return EnvVisualizer.stackTruncated;
  }

  public static isControl(): boolean {
    return this.control ? !this.control.isEmpty() : false;
  }

  /** SideContentEnvVis initializes this onMount with the callback function */
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

  /** updates the visualization state in the SideContentEnvVis component based on
   * the JS Slang context passed in */
  static drawEnv(context: Context) {
    // store environmentTree at last breakpoint.
    EnvVisualizer.environmentTree = deepCopyTree(context.runtime.environmentTree as EnvTree);
    EnvVisualizer.currentEnvId = getEnvID(context.runtime.environments[0]);
    if (!this.setVis || !context.runtime.control || !context.runtime.stash)
      throw new Error('env visualizer not initialized');
    EnvVisualizer.control = context.runtime.control;
    EnvVisualizer.stash = context.runtime.stash;

    Layout.setContext(
      context.runtime.environmentTree as EnvTree,
      context.runtime.control,
      context.runtime.stash
    );
    this.setVis(Layout.draw());
    this.setIsStepLimitExceeded(context.runtime.control.isEmpty());
    Layout.updateDimensions(Layout.visibleWidth, Layout.visibleHeight);

    // icon to blink
    const icon = document.getElementById('env_visualizer-icon');
    icon && icon.classList.add('side-content-tab-alert');
  }

  static redraw() {
    if (EnvVisualizer.environmentTree && EnvVisualizer.control && EnvVisualizer.stash) {
      // checks if the required diagram exists, and updates the dom node using setVis
      if (
        EnvVisualizer.getCompactLayout() &&
        EnvVisualizer.getPrintableMode() &&
        EnvVisualizer.getControlStash() &&
        EnvVisualizer.getStackTruncated() &&
        Layout.currentStackTruncLight !== undefined
      ) {
        this.setVis(Layout.currentStackTruncLight);
      } else if (
        EnvVisualizer.getCompactLayout() &&
        EnvVisualizer.getPrintableMode() &&
        EnvVisualizer.getControlStash() &&
        !EnvVisualizer.getStackTruncated() &&
        Layout.currentStackLight !== undefined
      ) {
        this.setVis(Layout.currentStackLight);
      } else if (
        EnvVisualizer.getCompactLayout() &&
        !EnvVisualizer.getPrintableMode() &&
        EnvVisualizer.getControlStash() &&
        EnvVisualizer.getStackTruncated() &&
        Layout.currentStackTruncDark !== undefined
      ) {
        this.setVis(Layout.currentStackTruncDark);
      } else if (
        EnvVisualizer.getCompactLayout() &&
        !EnvVisualizer.getPrintableMode() &&
        EnvVisualizer.getControlStash() &&
        !EnvVisualizer.getStackTruncated() &&
        Layout.currentStackDark !== undefined
      ) {
        this.setVis(Layout.currentStackDark);
      } else if (
        EnvVisualizer.getCompactLayout() &&
        EnvVisualizer.getPrintableMode() &&
        !EnvVisualizer.getControlStash() &&
        Layout.currentCompactLight !== undefined
      ) {
        this.setVis(Layout.currentCompactLight);
      } else if (
        EnvVisualizer.getCompactLayout() &&
        !EnvVisualizer.getPrintableMode() &&
        !EnvVisualizer.getControlStash() &&
        Layout.currentCompactDark !== undefined
      ) {
        this.setVis(Layout.currentCompactDark);
      } else if (
        !EnvVisualizer.getCompactLayout() &&
        EnvVisualizer.getPrintableMode() &&
        !EnvVisualizer.getControlStash() &&
        Layout.currentLight !== undefined
      ) {
        this.setVis(Layout.currentLight);
      } else if (
        !EnvVisualizer.getCompactLayout() &&
        !EnvVisualizer.getPrintableMode() &&
        !EnvVisualizer.getControlStash() &&
        Layout.currentDark !== undefined
      ) {
        this.setVis(Layout.currentDark);
      } else {
        Layout.setContext(
          EnvVisualizer.environmentTree,
          EnvVisualizer.control,
          EnvVisualizer.stash
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

  static clearEnv() {
    if (this.setVis) {
      this.setVis(undefined);
      EnvVisualizer.environmentTree = undefined;
      EnvVisualizer.control = undefined;
      EnvVisualizer.stash = undefined;
    }
    this.clear();
  }
}
