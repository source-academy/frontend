import Constants from '../constants/constants';

PIXI.Graphics.prototype.setAlpha = function(alpha) {
  this.alpha = alpha;
  return this;
};

PIXI.Graphics.prototype.setInteractive = function(isInteractive) {
  this.interactive = isInteractive;
  return this;
};

PIXI.Text.prototype.centralise = function() {
  this.anchor.set(0.5, 0.5);
  this.position.set(Constants.screenWidth / 2, Constants.screenHeight / 2);
  return this;
};
