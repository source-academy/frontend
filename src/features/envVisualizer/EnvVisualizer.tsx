import { Context } from 'js-slang';
import { Agenda, Stash } from 'js-slang/dist/ec-evaluator/interpreter';
import React from 'react';

import { Layout } from './EnvVisualizerLayout';
import { EnvTree } from './EnvVisualizerTypes';
import { deepCopyTree } from './EnvVisualizerUtils';

type SetVis = (vis: React.ReactNode) => void;

/** Environment Visualizer is exposed from this class */
export default class EnvVisualizer {
  /** callback function to update the visualization state in the SideContentEnvVis component */
  private static setVis: SetVis;
  private static printableMode: boolean = false;
  private static compactLayout: boolean = true;
  private static agendaStash: boolean = false;
  private static environmentTree: EnvTree;
  private static agenda: Agenda;
  private static stash: Stash;
  public static togglePrintableMode(): void {
    EnvVisualizer.printableMode = !EnvVisualizer.printableMode;
  }
  public static toggleCompactLayout(): void {
    EnvVisualizer.compactLayout = !EnvVisualizer.compactLayout;
  }
  public static toggleAgendaStash(): void {
    EnvVisualizer.agendaStash = !EnvVisualizer.agendaStash;
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

  /** SideContentEnvVis initializes this onMount with the callback function */
  static init(setVis: SetVis, width: number, height: number) {
    Layout.visibleHeight = height;
    Layout.visibleWidth = width;
    this.setVis = setVis;
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
      if (EnvVisualizer.getAgendaStash() && Layout.currentAgendaStash !== undefined) {
        this.setVis(Layout.currentAgendaStash);
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
