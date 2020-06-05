import * as PIXI from 'pixi.js';

import Constants from './constants/constants';
import LocationManager from './locationManager/locationManager';
import ObjectManager from './objectManager/objectManager';
import DialogManager from './dialogManager/dialogManager';
import QuestManager from './questManager/questManager';
import StoryManager from './preloadManager/storyManager';
import SaveManager from './saveManager/saveManager';
import ExternalManager from './externalManager/externalManager';
import BlackOverlay from './blackOverlay/blackOverlay';
import MapOverlay from './mapOverlay/mapOverlay';
import Utils from './utils/utils';

var g_renderer;
var g_stage;

export function initStage(div, canvas, options) {
  g_renderer = PIXI.autoDetectRenderer(Constants.screenWidth, Constants.screenHeight, {
    backgroundColor: 0x000000,
    view: canvas
  });
  div.append(g_renderer.view);
  Utils.saveRenderer(g_renderer);

  // create the root of the scene graph
  g_stage = new PIXI.Container();

  // create necessary layers
  var locationLayers = LocationManager.init(options.changeLocationHook);
  g_stage.addChild(locationLayers);
  var objectLayers = ObjectManager.init();
  g_stage.addChild(objectLayers);
  g_stage.addChild(MapOverlay.init(options.wristDeviceFunc));
  var dialogLayers = DialogManager.init(options.playerName, options.playerImageCanvas);
  g_stage.addChild(dialogLayers);
  g_stage.addChild(BlackOverlay.init());
  g_stage.addChild(StoryManager.init());

  function animate() {
    requestAnimationFrame(animate);
    g_renderer.render(g_stage);
  }
  animate();

  SaveManager.init();

  // a pixi.container on top of everything that is exported
  g_stage.addChild(ExternalManager.init(options.hookHandlers));
}

export function loadingScreen(div, canvas) {
  g_renderer = PIXI.autoDetectRenderer(Constants.screenWidth, Constants.screenHeight, {
    backgroundColor: 0x000000,
    view: canvas
  });
  div.append(g_renderer.view);
  Utils.saveRenderer(g_renderer);
  // create the root of the scene graph
  g_stage = new PIXI.Container();
  g_stage.addChild(BlackOverlay.init());
  const loadingScreen = StoryManager.init();
  loadingScreen.visible = true;
  g_stage.addChild(StoryManager.init());

  function animate() {
    requestAnimationFrame(animate);
    g_renderer.render(g_stage);
  }
  animate();
}

export { getExternalOverlay } from './externalManager/externalManager.js';
export {
  changeStartLocation,
  gotoStartLocation,
  gotoLocation
} from './locationManager/locationManager.js';
export { unlockQuest, completeQuest, unlockLastQuest } from './questManager/questManager.js';
export { sendNotification, changeWristDeviceFunction } from './mapOverlay/mapOverlay.js';
