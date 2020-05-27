import * as PIXI from 'pixi.js';
import Methods from '../utils/protos.js';
import { defaultText } from '../constants/styles.js';
import Constants from '../constants/constants';

var blackOverlay;
var tween;

export function createBlackOverlay(alpha) {
  return new PIXI.Graphics()
    .beginFill(0, 1)
    .drawRect(0, 0, Constants.screenWidth, Constants.screenHeight)
    .endFill()
    .setAlpha(alpha);
}

export function createText(message) {
  return new PIXI.Text(message, defaultText).centralise();
}

export function createLoadingScreen() {
  const loadingOverlay = new PIXI.Container();
  const blackOverlay = createBlackOverlay(0.8);
  const loadingText = new PIXI.Text('Loading...', defaultText).centralise();
  loadingOverlay.addChild(blackOverlay);
  loadingOverlay.addChild(loadingText);
  loadingOverlay.visible = false;

  return loadingOverlay;
}

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
