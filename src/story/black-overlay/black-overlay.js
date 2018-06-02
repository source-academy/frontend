import * as PIXI from 'pixi.js'

var Constants = require('../constants/constants.js');

var blackOverlay;
var tween;

export function init() {
  blackOverlay = new PIXI.Graphics();
  blackOverlay.beginFill(0, 1);
  blackOverlay.drawRect(0, 0, Constants.screenWidth, Constants.screenHeight);
  blackOverlay.endFill();

  return blackOverlay;
};

function fadeOut(displayObject, cb) {
  if (tween) tween.progress(1).kill();
  tween = TweenLite.to(displayObject, Constants.fadeTime, {
    alpha: 0,
    ease: Power1.easeInOut,
    onComplete: function() {
      displayObject.visible = false;
      cb();
    }
  });
}

function fadeIn(displayObject, cb) {
  displayObject.visible = true;
  if (tween) tween.progress(1).kill();
  tween = TweenLite.to(displayObject, Constants.fadeTime, {
    alpha: 1,
    ease: Power1.easeInOut,
    onComplete: cb
  });
}

export function blackTransition(middleSynchronous, callback) {
  callback = callback || Constants.nullFunction;
  blackScreen(function() {
    middleSynchronous();
    setTimeout(function() {
      fadeOut(blackOverlay, callback);
    }, 400);
  });
}

export function blackScreen(callback) {
  callback = callback || Constants.nullFunction;
  fadeIn(blackOverlay, callback);
}
