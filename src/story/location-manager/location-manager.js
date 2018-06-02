import * as PIXI from 'pixi.js'

var Constants = require('../constants/constants.js');
var MapManager = require('../map-manager/map-manager.js');
var ObjectManager = require('../object-manager/object-manager.js');
var DialogManager = require('../dialog-manager/dialog-manager.js');
var SaveManager = require('../save-manager/save-manager.js');
var QuestManager = require('../quest-manager/quest-manager.js');
var ExternalManager = require('../external-manager/external-manager.js');
var BlackOverlay = require('../black-overlay/black-overlay.js');
var MapOverlay = require('../map-overlay/map-overlay.js');

var gameBackground;

var curCameraLocation;
var startLocation;
var changeLocationFunc;

export function init(changeLocationHook) {
  changeLocationFunc = changeLocationHook || Constants.nullFunction;
  // background
  gameBackground = new PIXI.Sprite();
  gameBackground.position.x = 0;
  gameBackground.position.y = 0;
  gameBackground.width = Constants.screenWidth;
  gameBackground.height = Constants.screenHeight;

  return gameBackground;
};

// change the location when playing a sequence
export function changeSeqLocation(node, callback) {
  if (node.tagName != 'LOCATION' || node.parentElement.tagName != 'SEQUENCE') {
    return;
  }
  callback = callback || Constants.nullFunction;
  BlackOverlay.blackTransition(function() {
    var name = node.getAttribute('name');
    var skin = node.getAttribute('skin');
    gameBackground.texture = PIXI.Texture.fromImage(
      Constants.locationPath + name + '/' + skin + '.png'
    );
    ObjectManager.clearMapObjects();
    ObjectManager.changeMapObjects(name, node.getAttribute('clear') == 'true');
    ObjectManager.clearSeqObjects();
    if (node.children.length > 0) {
      var child = node.children[0];
      while (child) {
        if (child.tagName == 'OBJECT') {
          ObjectManager.addSeqObject(child);
        }
        child = child.nextElementSibling;
      }
    }
    curCameraLocation = name;
  }, callback);
}

function changeMapLocation(name, callback, middleSynchronous) {
  if (!MapManager.locationExist(name)) {
    return;
  }
  BlackOverlay.blackTransition(function() {
    middleSynchronous();
    var newLocation = MapManager.getGameLocation(name);
    gameBackground.texture = PIXI.Texture.fromImage(
      Constants.locationPath +
        newLocation.name +
        '/' +
        newLocation.skin +
        '.png'
    );
    ObjectManager.clearMapObjects();
    ObjectManager.changeMapObjects(name, false);
    curCameraLocation = name;
    changeLocationFunc(curCameraLocation);
  }, callback);
}

// change the location in roaming mode
export function gotoLocation(name, callback, middleSynchronous) {
  if (!MapManager.locationExist(name)) {
    return;
  }
  callback = callback || Constants.nullFunction;
  middleSynchronous = middleSynchronous || Constants.nullFunction;
  changeMapLocation(
    name,
    function() {
      var gameLocation = MapManager.getGameLocation(name);
      if (gameLocation.sequence) {
        DialogManager.playSequence(gameLocation.sequence, function() {
          var sequence = gameLocation.sequence;
          if (gameLocation.sequence.getAttribute('displayOnce') == 'true') {
            SaveManager.saveSeeDisplayOnceSeq(gameLocation.sequence, name);
            gameLocation.sequence = null;
          }
          var child = sequence.nextElementSibling;
          function nextAction(child) {
            if (!child || child.tagName == 'OBJECT') {
              callback();
              return;
            }
            if (child.tagName == 'COMPLETE_QUEST') {
              QuestManager.playCompleteQuest(child, function() {
                nextAction(child.nextElementSibling);
              });
            } else if (child.tagName == 'UNLOCK_QUEST') {
              QuestManager.playUnlockQuest(child, function() {
                nextAction(child.nextElementSibling);
              });
            } else if (child.tagName == 'EXTERNAL_ACTION') {
              ExternalManager.playExternalAction(child);
              nextAction(child.nextElementSibling);
            } else if (child.tagName == 'CHANGE_START_LOCATION') {
              changeStartLocation(child.textContent);
              nextAction(child.nextElementSibling);
            } else {
              nextAction(child.nextElementSibling);
            }
          }
          nextAction(child);
        });
      } else {
        callback();
      }
    },
    middleSynchronous
  );
}

export function goBackToCurCamLocation(callback, middleSynchronous) {
  verifyCurCamLocation();
  gotoLocation(curCameraLocation, callback, middleSynchronous);
};

// close a story, need to verify whether curCameraLocation is still valid
// return whether current camera location is valid
export function verifyCurCamLocation() {
  var valid = MapManager.locationExist(curCameraLocation);
  curCameraLocation = valid ? curCameraLocation : startLocation;
  if (!MapManager.locationExist(curCameraLocation)) {
    console.error('startLocation/curCameraLocation is corrupted');
    location.reload();
  }
  return valid;
};

export function changeStartLocation(loc) {
  if (loc && MapManager.locationExist(loc)) {
    startLocation = loc;
  }
}

export function getStartLocation(loc) {
  return startLocation;
}

export function gotoStartLocation(callback, middleSynchronous) {
  gotoLocation(startLocation, callback, middleSynchronous);
};

// return a callback function that check ensure valid current location before proceeding
export function verifyGotoStart(callback) {
  return function() {
    if (!verifyCurCamLocation()) {
      gotoStartLocation(callback, function() {
        MapOverlay.setVisibility(true);
      });
    } else {
      callback();
    }
  };
}
