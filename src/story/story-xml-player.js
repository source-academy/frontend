import * as PIXI from 'pixi.js'

// CommonJS Imports
var Constants = require('./constants/constants.js');
var LocationManager = require('./location-manager/location-manager.js');
var ObjectManager = require('./object-manager/object-manager.js');
var DialogManager = require('./dialog-manager/dialog-manager.js');
var QuestManager = require('./quest-manager/quest-manager.js');
var StoryManager = require('./story-manager/story-manager.js');
var SaveManager = require('./save-manager/save-manager.js');
var ExternalManager = require('./external-manager/external-manager.js');
var BlackOverlay = require('./black-overlay/black-overlay.js');
var MapOverlay = require('./map-overlay/map-overlay.js');
var Utils = require('./utils/utils.js');

//-----GLOBAL-----
var renderer;
var stage;
//--------LOGIC--------
// options contains the following properties:
// saveData, hookHandlers, saveFunc, wristDeviceFunc
// changeLocationHook, playerImageCanvas, playerName
module.exports.init = function(container, options, callback) {
  renderer = PIXI.autoDetectRenderer(
    Constants.screenWidth,
    Constants.screenHeight,
    { backgroundColor: 0x000000 }
  );
  container.append(renderer.view);
  Utils.saveRenderer(renderer);

  // create the root of the scene graph
  stage = new PIXI.Container();
  // create necessary layers
  var locationLayers = LocationManager.init(options.changeLocationHook);
  stage.addChild(locationLayers);
  var objectLayers = ObjectManager.init();
  stage.addChild(objectLayers);
  stage.addChild(MapOverlay.init(options.wristDeviceFunc));
  var dialogLayers = DialogManager.init(
    options.playerName,
    options.playerImageCanvas
  );
  stage.addChild(dialogLayers);
  stage.addChild(BlackOverlay.init());
  stage.addChild(StoryManager.init());

  function animate() {
    requestAnimationFrame(animate);
    renderer.render(stage);
  }
  animate();

  SaveManager.init(options.saveFunc, options.saveData, callback);

  // a pixi.container on top of everything that is exported
  stage.addChild(ExternalManager.init(options.hookHandlers));
};

module.exports.getExternalOverlay = ExternalManager.getExternalOverlay;

module.exports.changeStartLocation = LocationManager.changeStartLocation;
module.exports.gotoStartLocation = LocationManager.gotoStartLocation;
module.exports.gotoLocation = LocationManager.gotoLocation;

module.exports.loadStory = StoryManager.loadStory;
module.exports.loadStoryWithoutFirstQuest =
  StoryManager.loadStoryWithoutFirstQuest;

module.exports.unlockQuest = QuestManager.unlockQuest;
module.exports.completeQuest = QuestManager.completeQuest;
module.exports.unlockLastQuest = QuestManager.unlockLastQuest;

module.exports.sendNotification = MapOverlay.sendNotification;
module.exports.changeWristDeviceFunction = MapOverlay.changeWristDeviceFunction;
