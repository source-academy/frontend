import { Context } from 'js-slang';
import React from 'react';

import { Layout } from './EnvVisualizerLayout';

type SetVis = (vis: React.ReactNode) => void;

/** Environment Visualizer is exposed from this class */
export default class EnvVisualizer {
  /** callback function to update the visualization state in the SideContentEnvVis component */
  private static setVis: SetVis;

  /** SideContentEnvVis intializes this onMount with the callback function */
  static init(setVis: SetVis) {
    this.setVis = setVis;
  }

  /** updates the visualization state in the SideContentEnvVis component based on
   * the JS Slang context passed in */
  static drawEnv(context: Context) {
    if (!this.setVis) throw new Error('env visualizer not initialized');

    Layout.setContext(context);
    this.setVis(Layout.draw());

    // icon to blink
    const icon = document.getElementById('env_visualiser-icon');
    icon && icon.classList.add('side-content-tab-alert');
  }
}
