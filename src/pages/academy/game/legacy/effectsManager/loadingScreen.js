import * as PIXI from 'pixi.js';

import { createBlackOverlay } from './effects.js';
import { defaultText } from '../constants/styles.js';

export function createLoadingScreen() {
  const blackOverlay = createBlackOverlay(0.8).setInteractive(true);
  const loadingOverlay = new PIXI.Container();
  loadingOverlay.addChild(blackOverlay);
  loadingText = new PIXI.Text('Loading...', defaultText);
  loadingText.anchor.set(0.5, 0.5);
  loadingOverlay.addChild(loadingText);
  loadingOverlay.visible = false;

  const setVisibility = visibility => loadingOverlay.visible(visibility);

  return [loadingOverlay, setVisibility];
}
