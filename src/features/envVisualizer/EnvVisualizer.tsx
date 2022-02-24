import { Context } from 'js-slang';
import React from 'react';

import { Layout } from './EnvVisualizerLayout';

type SetVis = (vis: React.ReactNode) => void;

/** Environment Visualizer is exposed from this class */
export default class EnvVisualizer {
  /** callback function to update the visualization state in the SideContentEnvVis component */
  private static setVis: SetVis;
  private static printableMode: boolean = false;
  private static context: Context;
  public static togglePrintableMode(): void {
    EnvVisualizer.printableMode = !EnvVisualizer.printableMode;
    EnvVisualizer.drawEnv(EnvVisualizer.context);
  }
  public static getPrintableMode(): boolean {
    return EnvVisualizer.printableMode;
  }

  /** SideContentEnvVis initializes this onMount with the callback function */
  static init(setVis: SetVis, width: number, height: number) {
    Layout.visibleHeight = Math.max(isNaN(height) ? window.innerHeight - 100 : height - 100, 200);
    Layout.visibleWidth = Math.max(isNaN(width) ? window.innerWidth - 50 : width - 50, 200);
    this.setVis = setVis;
  }

  static clear() {
    Layout.values.clear();
  }

  /** updates the visualization state in the SideContentEnvVis component based on
   * the JS Slang context passed in */
  static drawEnv(context: Context) {
    EnvVisualizer.context = context;
    if (!this.setVis) throw new Error('env visualizer not initialized');

    Layout.setContext(context);
    this.setVis(Layout.draw());

    // icon to blink
    const icon = document.getElementById('env_visualizer-icon');
    icon && icon.classList.add('side-content-tab-alert');
  }

  static redraw() {
    EnvVisualizer.drawEnv(EnvVisualizer.context);
  }

  static updateDimensions(width: number, height: number) {
    if (Layout.stageRef != null && width !== null && height !== null) {
      height = Math.max(isNaN(height) ? window.innerHeight - 100 : height - 100, 200);
      width = Math.max(isNaN(width) ? window.innerWidth - 50 : width - 50, 200);
      Layout.updateDimensions(width, height);
    }
  }
}
