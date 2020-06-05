import * as PIXI from 'pixi.js'

var Constants = require('../constants/constants.js');
var LocationManager = require('../location-manager/location-manager.js');
var MapManager = require('../map-manager/map-manager.js');
var DialogManager = require('../dialog-manager/dialog-manager.js');
var QuestManager = require('../quest-manager/quest-manager.js');
var SaveManager = require('../save-manager/save-manager.js');
var ExternalManager = require('../external-manager/external-manager.js');
var MapOverlay = require('../map-overlay/map-overlay.js');
var Utils = require('../utils/utils.js');
var FilterEffects = require('../filter-effects/filter-effects.js');
var GameState = require('../backend/game-state')

var mapObjects;
var sequenceObjects;
var objectOverlay;

var removeTempObjFuncs = {};

export function init() {
  var container = new PIXI.Container();
  // map objects
  mapObjects = new PIXI.Container();
  container.addChild(mapObjects);
  // sequenceObjects
  sequenceObjects = new PIXI.Container();
  sequenceObjects.visible = false;
  container.addChild(sequenceObjects);
  // map objects overlay, to disable map objects' interactivity
  objectOverlay = new PIXI.Graphics();
  objectOverlay.interactive = true;
  objectOverlay.beginFill(0, 0);
  objectOverlay.drawRect(0, 0, Constants.screenWidth, Constants.screenHeight);
  objectOverlay.endFill();
  objectOverlay.hitArea = new PIXI.Rectangle(
    0,
    0,
    Constants.screenWidth,
    Constants.screenHeight
  );
  objectOverlay.visible = false; // hide it first
  container.addChild(objectOverlay);

  return container;
};

function createGlowTexture(node) {
  var glowObject = parseStaticObject(node);
  return FilterEffects.createGlowTexture(glowObject);
}

function parseInteractivity(node, object, callback) {
  callback = callback || Constants.nullFunction;
  if (node.children.length > 0) {
    object.interactive = true;
    object.buttonMode = true;
    var glowTexture;
    var originalTexture = object.texture;
    function nextAction(i) {
      if (i >= node.children.length) {
        callback();
        return;
      }
      var child = node.children[i];
      if (child.tagName == 'GOTO_LOCATION') {
        // close this <OBJECT>
        nextAction(node.children.length);
        LocationManager.gotoLocation(child.textContent);
      } else if (child.tagName == 'SEQUENCE') {
        DialogManager.playSequence(child, function() {
          nextAction(i + 1);
        });
      } else if (child.tagName == 'COMPLETE_QUEST') {
        QuestManager.playCompleteQuest(child, function() {
          nextAction(i + 1);
        });
      } else if (child.tagName == 'UNLOCK_QUEST') {
        QuestManager.playUnlockQuest(child, function() {
          nextAction(i + 1);
        });
      } else if (child.tagName == 'EXTERNAL_ACTION') {
        ExternalManager.playExternalAction(child);
        nextAction(i + 1);
      } else if (child.tagName == 'CHANGE_START_LOCATION') {
        LocationManager.changeStartLocation(child.textContent);
        nextAction(i + 1);
      } else {
        nextAction(i + 1);
      }
    }
    function onClick() {
      nextAction(0);
    }
    object
      .on('click', onClick)
      .on('tap', onClick)
      .on('mouseover', function() {
        if (!glowTexture) {
          glowTexture = createGlowTexture(node);
        }
        object.texture = glowTexture;
      })
      .on('mouseout', function() {
        object.texture = originalTexture;
      });
  }
  return object;
}

export function parseObject(node) {
  if (node.tagName != 'OBJECT') {
    return;
  }
  return parseInteractivity(node, parseStaticObject(node));
}

function createGameObject(texture, x, y, scale) {
  var object = new PIXI.Sprite(texture);
  object.anchor.set(0.5, 0.5);
  object.position.x = x + object.width / 2;
  object.position.y = y + object.height / 2;
  object.scale.x = object.scale.y = scale || 1;
  return object;
}

export function parseStaticObject(node) {
  const name = node.getAttribute('name');
  const skin = node.getAttribute('skin') || 'normal';
  const texture = PIXI.Texture.fromImage(
    Constants.objectPath + name + '/' + skin + '.png'
  );
  const x = parseInt(node.getAttribute('x'));
  const y = parseInt(node.getAttribute('y'));
  const scale = parseInt(node.getAttribute('scale')) || 1;
  return createGameObject(texture, x, y, scale);
}

export function parsePauseObject(node, onClick) {
  var object = parseStaticObject(node);
  if (node.children.length > 0 && node.children[0].tagName == 'CONTINUE') {
    object.interactive = true;
    object.buttonMode = true;
    var glowTexture;
    var originalTexture = object.texture;
    object
      .on('click', onClick)
      .on('tap', onClick)
      .on('mouseover', function() {
        if (!glowTexture) {
          glowTexture = createGlowTexture(node);
        }
        object.texture = glowTexture;
      })
      .on('mouseout', function() {
        object.texture = originalTexture;
      });
  }
  return object;
}

export function processTempObject(gameLocation, node) {
  if (node.tagName != 'TEMP_OBJECT') {
    return;
  }
  var collectible = node.getAttribute('name');
  var isInDorm = gameLocation.name == 'yourRoom';
  if ((isInDorm && !GameState.hasCollectible(collectible))||
      (!isInDorm && GameState.hasCollectible(collectible))) {
    return; //don't load the collectible in dorm if it's not collected || don't load if in hidden location and collected
  }
  if (isInDorm) {
    gameLocation.objects.addChild(parseInteractivity(node, parseStaticObject(node)));
  } else {
    var object = parseStaticObject(node);
    var storyId = Utils.getStoryAncestor(node).id;
    if (!removeTempObjFuncs[storyId]) {
      removeTempObjFuncs[storyId] = {};
    }
    removeTempObjFuncs[storyId][node.id] = function() {
      gameLocation.objects.removeChild(object);
    };
    gameLocation.objects.addChild(
        parseInteractivity(node, object, function() {
          removeTempObjFuncs[storyId][node.id]();
          SaveManager.saveClickTempObject(node, storyId);
        })
    );
  }
}

export function removeTempObject(storyId, objectId) {
  if (removeTempObjFuncs[storyId][objectId]) {
    removeTempObjFuncs[storyId][objectId]();
  }
}

export function clearMapObjects() {
  mapObjects.removeChildren();
}

export function changeMapObjects(locName, willClear) {
  if (MapManager.locationExist(locName) && !willClear) {
    mapObjects.addChild(MapManager.getGameLocation(locName).objects);
  }
}

export function setSeqObjectsVisibility(flag) {
  sequenceObjects.visible = flag;
}

export function clearSeqObjects() {
  sequenceObjects.removeChildren();
}

export function addSeqObject(node) {
  if (node.tagName != 'OBJECT') {
    return;
  }
  sequenceObjects.addChild(parseStaticObject(node));
}

export function setMapObjectsInteractivity(flag) {
  objectOverlay.visible = !flag;
  MapOverlay.setVisibility(flag);
}
