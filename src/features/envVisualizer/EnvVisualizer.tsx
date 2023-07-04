import { Context } from 'js-slang';
import { Agenda, Stash } from 'js-slang/dist/ec-evaluator/interpreter';
import React from 'react';

import { Layout } from './EnvVisualizerLayout';
import { EnvTree } from './EnvVisualizerTypes';
import { deepCopyTree } from './EnvVisualizerUtils';

type SetVis = (vis: React.ReactNode) => void;
type SetEditorHighlightedLines = (segments: [number, number][]) => void;

/** Environment Visualizer is exposed from this class */
export default class EnvVisualizer {
  /** callback function to update the visualization state in the SideContentEnvVis component */
  private static setVis: SetVis;
  /** function to highlight editor lines */
  private static printableMode: boolean = false;
  private static compactLayout: boolean = true;
  private static agendaStash: boolean = false;
  private static stackTruncated: boolean = false;
  private static environmentTree: EnvTree;
  private static currentEnvId: string;
  private static agenda: Agenda;
  private static stash: Stash;
  public static setEditorHighlightedLines: SetEditorHighlightedLines;
  public static togglePrintableMode(): void {
    EnvVisualizer.printableMode = !EnvVisualizer.printableMode;
  }
  public static toggleCompactLayout(): void {
    EnvVisualizer.compactLayout = !EnvVisualizer.compactLayout;
  }
  public static toggleAgendaStash(): void {
    EnvVisualizer.agendaStash = !EnvVisualizer.agendaStash;
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
  public static getAgendaStash(): boolean {
    return EnvVisualizer.agendaStash;
  }
  public static getStackTruncated(): boolean {
    return EnvVisualizer.stackTruncated;
  }

  /** SideContentEnvVis initializes this onMount with the callback function */
  static init(
    setVis: SetVis,
    width: number,
    height: number,
    setEditorHighlightedLines: (segments: [number, number][]) => void
  ) {
    Layout.visibleHeight = height;
    Layout.visibleWidth = width;
    this.setVis = setVis;
    this.setEditorHighlightedLines = setEditorHighlightedLines;
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
    EnvVisualizer.currentEnvId = context.runtime.environments[0].id;
    if (!this.setVis || !context.runtime.agenda || !context.runtime.stash)
      throw new Error('env visualizer not initialized');
    EnvVisualizer.agenda = context.runtime.agenda;
    EnvVisualizer.stash = context.runtime.stash;

    Layout.setContext(
      context.runtime.environmentTree as EnvTree,
      context.runtime.agenda,
      context.runtime.stash
    );
    this.setVis(Layout.draw());
    Layout.updateDimensions(Layout.visibleWidth, Layout.visibleHeight);

    // icon to blink
    const icon = document.getElementById('env_visualizer-icon');
    icon && icon.classList.add('side-content-tab-alert');
  }

  static redraw() {
    if (this.environmentTree) {
      // checks if the required diagram exists, and updates the dom node using setVis
      if (
        EnvVisualizer.getCompactLayout() &&
        EnvVisualizer.getPrintableMode() &&
        EnvVisualizer.getAgendaStash() &&
        EnvVisualizer.getStackTruncated() &&
        Layout.currentStackTruncLight !== undefined
      ) {
        this.setVis(Layout.currentStackTruncLight);
      } else if (
        EnvVisualizer.getCompactLayout() &&
        EnvVisualizer.getPrintableMode() &&
        EnvVisualizer.getAgendaStash() &&
        !EnvVisualizer.getStackTruncated() &&
        Layout.currentStackLight !== undefined
      ) {
        this.setVis(Layout.currentStackLight);
      } else if (
        EnvVisualizer.getCompactLayout() &&
        EnvVisualizer.getPrintableMode() &&
        EnvVisualizer.getAgendaStash() &&
        EnvVisualizer.getStackTruncated() &&
        Layout.currentStackTruncDark !== undefined
      ) {
        this.setVis(Layout.currentStackTruncDark);
      } else if (
        EnvVisualizer.getCompactLayout() &&
        !EnvVisualizer.getPrintableMode() &&
        EnvVisualizer.getAgendaStash() &&
        !EnvVisualizer.getStackTruncated() &&
        Layout.currentStackLight !== undefined
      ) {
        this.setVis(Layout.currentStackLight);
      } else if (
        EnvVisualizer.getCompactLayout() &&
        EnvVisualizer.getPrintableMode() &&
        !EnvVisualizer.getAgendaStash() &&
        Layout.currentCompactLight !== undefined
      ) {
        this.setVis(Layout.currentCompactLight);
      } else if (
        EnvVisualizer.getCompactLayout() &&
        !EnvVisualizer.getPrintableMode() &&
        !EnvVisualizer.getAgendaStash() &&
        Layout.currentCompactDark !== undefined
      ) {
        this.setVis(Layout.currentCompactDark);
      } else if (
        !EnvVisualizer.getCompactLayout() &&
        EnvVisualizer.getPrintableMode() &&
        !EnvVisualizer.getAgendaStash() &&
        Layout.currentLight !== undefined
      ) {
        this.setVis(Layout.currentLight);
      } else if (
        !EnvVisualizer.getCompactLayout() &&
        !EnvVisualizer.getPrintableMode() &&
        !EnvVisualizer.getAgendaStash() &&
        Layout.currentDark !== undefined
      ) {
        this.setVis(Layout.currentDark);
      } else {
        Layout.setContext(EnvVisualizer.environmentTree, EnvVisualizer.agenda, EnvVisualizer.stash);
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
    }
    this.clear();
  }
}
