import * as PIXI from 'pixi.js'

var ObjectManager = require('../object-manager/object-manager.js');
var LocationManager = require('../location-manager/location-manager.js');

var gameMap = {};

export function processMap(map) {
  for (var i = 0; i < map.children.length; i++) {
    var rawLocation = map.children[i];
    processMapLocation(rawLocation);
  }
  if (!LocationManager.getStartLocation()) {
    LocationManager.changeStartLocation(map.children[0].getAttribute('name'));
  }
}

function createGameLocation(name, skin, objects) {
  return { name: name, skin: skin, objects: objects, sequence: null };
}

function addSeqAndObjects(child, gameLocation) {
  if (child && child.tagName == 'SEQUENCE') {
    gameLocation.sequence = child;
    child = child.nextElementSibling;
  }
  while (child) {
    if (child.tagName == 'OBJECT') {
      gameLocation.objects.addChild(ObjectManager.parseObject(child));
    } else if (child.tagName == 'TEMP_OBJECT') {
      ObjectManager.processTempObject(gameLocation, child);
    }
    child = child.nextElementSibling;
  }
}

function processMapLocation(node) {
  if (node.tagName != 'LOCATION' || node.parentElement.tagName != 'MAP') {
    return;
  }
  var name = node.getAttribute('name');
  var skin = node.getAttribute('skin');
  var gameLocation;
  var child = node.children[0];
  var objects = new PIXI.Container();
  gameLocation = createGameLocation(name, skin, objects);
  gameMap[name] = gameLocation;
  addSeqAndObjects(child, gameLocation);
  return gameLocation;
}

export function processEffectsLocation(node) {
  if (node.tagName != 'LOCATION' || node.parentElement.tagName != 'EFFECTS') {
    return;
  }
  var name = node.getAttribute('name');
  var skin = node.getAttribute('skin');
  var gameLocation;
  var child = node.children[0];
  gameLocation = gameMap[name];
  gameLocation.skin = skin;
  if (node.getAttribute('clear') == 'true') {
    gameLocation.objects.removeChildren();
  }
  addSeqAndObjects(child, gameLocation);
  return gameLocation;
}

export function clearMap() {
  gameMap = {};
}

export function getGameLocation(locName) {
  if (locationExist(locName)) {
    return gameMap[locName];
  }
}

export function locationExist(locName) {
  return !!gameMap[locName];
}
