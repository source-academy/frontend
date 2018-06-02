import * as PIXI from 'pixi.js'

var Constants = require('../constants/constants.js');

var hasNotification;
var wristDeviceFunction;

var mapOverlay;
var wristDeviceButton;

module.exports.init = function(wristDeviceFunc) {
  // map overlay, always appear in roaming mode
  mapOverlay = new PIXI.Container();
  wristDeviceButton = new PIXI.Sprite.fromImage(
    Constants.uiPath + 'wristDeviceButton.png'
  );
  wristDeviceButton.position.set(50, 50);
  wristDeviceButton.interactive = true;
  wristDeviceButton.buttonMode = true;
  wristDeviceFunction = wristDeviceFunc;
  function openWristDevice() {
    wristDeviceFunction();
  }
  wristDeviceButton.on('click', openWristDevice).on('tap', openWristDevice);

  mapOverlay.addChild(wristDeviceButton);
  mapOverlay.visible = false;

  return mapOverlay;
};

function sendNotification(callback) {
  var oldFunction = wristDeviceFunction;
  changeWristDeviceFunction(function() {
    changeWristDeviceFunction(oldFunction);
    hasNotification = false;
    callback();
  });
  hasNotification = true;
  var blinkTween;
  function blink() {
    if (!hasNotification) {
      blinkTween.kill();
      return;
    }
    blinkTween = TweenLite.to(wristDeviceButton, 0.1, {
      alpha: 0.1,
      ease: Power0.easeIn,
      onComplete: function() {
        setTimeout(function() {
          blinkTween = TweenLite.to(wristDeviceButton, 0.1, {
            alpha: 1,
            ease: Power0.easeOut,
            onComplete: function() {
              setTimeout(blink, 300);
            }
          });
        }, 100);
      }
    });
  }
  blink();
}
module.exports.sendNotification = sendNotification;

function changeWristDeviceFunction(newFunc) {
  wristDeviceFunction = newFunc;
}
module.exports.changeWristDeviceFunction = changeWristDeviceFunction;

function setVisibility(value) {
  mapOverlay.visible = value;
}
module.exports.setVisibility = setVisibility;
