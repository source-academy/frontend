import * as PIXI from 'pixi.js';

import Constants from './constants/constants';

var LocationManager = require('./locationManager/locationManager.js');
var ObjectManager = require('./objectManager/objectManager.js');
var DialogManager = require('./dialogManager/dialogManager.js');
var QuestManager = require('./questManager/questManager.js');
var StoryManager = require('./storyManager/storyManager.js');
var SaveManager = require('./saveManager/saveManager.js');
var ExternalManager = require('./externalManager/externalManager.js');
var BlackOverlay = require('./blackOverlay/blackOverlay.js');
var MapOverlay = require('./mapOverlay/mapOverlay.js');
var Utils = require('./utils/utils.js');

var renderer;
var stage;

export function init(div, canvas, options) {
  renderer = PIXI.autoDetectRenderer(Constants.screenWidth, Constants.screenHeight, {
    backgroundColor: 0x000000,
    view: canvas
  });
  div.append(renderer.view);
  Utils.saveRenderer(renderer);

  // create the root of the scene graph
  stage = new PIXI.Container();
  // create necessary layers
  var locationLayers = LocationManager.init(options.changeLocationHook);
  stage.addChild(locationLayers);
  var objectLayers = ObjectManager.init();
  stage.addChild(objectLayers);
  stage.addChild(MapOverlay.init(options.wristDeviceFunc));
  var dialogLayers = DialogManager.init(options.playerName, options.playerImageCanvas);
  stage.addChild(dialogLayers);
  stage.addChild(BlackOverlay.init());
  stage.addChild(StoryManager.showLoadingScreen());

  function animate() {
    requestAnimationFrame(animate);
    renderer.render(stage);
  }
  animate();

  SaveManager.init();

  // a pixi.container on top of everything that is exported
  stage.addChild(ExternalManager.init(options.hookHandlers));
}

export function loadingScreen(div, canvas) {
  renderer = PIXI.autoDetectRenderer(Constants.screenWidth, Constants.screenHeight, {
    backgroundColor: 0x000000,
    view: canvas
  });
  div.append(renderer.view);
  Utils.saveRenderer(renderer);
  // create the root of the scene graph
  stage = new PIXI.Container();
  stage.addChild(BlackOverlay.init());
  const loadingScreen = StoryManager.showLoadingScreen();
  loadingScreen.visible = true;
  stage.addChild(StoryManager.showLoadingScreen());

  function animate() {
    requestAnimationFrame(animate);
    renderer.render(stage);
  }
  animate();
}

export { getExternalOverlay } from './externalManager/externalManager.js';
export {
  changeStartLocation,
  gotoStartLocation,
  gotoLocation
} from './locationManager/locationManager.js';
export { loadStory, loadStoryWithoutFirstQuest } from './storyManager/storyManager.js';
export { unlockQuest, completeQuest, unlockLastQuest } from './questManager/questManager.js';
export { sendNotification, changeWristDeviceFunction } from './mapOverlay/mapOverlay.js';
