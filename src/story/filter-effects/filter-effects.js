import * as PIXI from 'pixi.js'

var Constants = require('../constants/constants.js');
var Utils = require('../utils/utils.js');

var darkFilter = new PIXI.filters.ColorMatrixFilter();
darkFilter.brightness(0.6);

function createTexture(displayObject, filters, width, height) {
  var texture = new PIXI.RenderTexture(Utils.getRenderer(), width, height);
  displayObject.filters = filters;
  texture.render(displayObject);
  return texture;
}

function createFilteredTexture(texture, filters) {
  var sprite = new PIXI.Sprite(texture);
  return createTexture(sprite, filters, texture.width, texture.height);
}

function createGlowTexture(displayObject) {
  var width = displayObject.width + 2 * Constants.glowDistance;
  var height = displayObject.height + 2 * Constants.glowDistance;
  displayObject.position.x = width / 2;
  displayObject.position.y = height / 2;
  var container = new PIXI.Container();
  container.addChild(displayObject);
  var glowFilter = new PIXI.filters.GlowFilter(
    width,
    height,
    Constants.glowDistance,
    2.5,
    0,
    0xfffbd6,
    0.5
  );
  glowFilter.padding = Constants.glowDistance;
  return createTexture(container, [glowFilter], width, height);
}
module.exports.createGlowTexture = createGlowTexture;

function createDarkenedTexture(texture) {
  return createFilteredTexture(texture, [darkFilter]);
}
module.exports.createDarkenedTexture = createDarkenedTexture;
