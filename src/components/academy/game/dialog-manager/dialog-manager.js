import * as PIXI from 'pixi.js'
import Text from './Text'

var Constants = require('../constants/constants.js');
var LocationManager = require('../location-manager/location-manager.js');
var ObjectManager = require('../object-manager/object-manager.js');
var FilterEffects = require('../filter-effects/filter-effects.js');
var Avatar = require('./avatar/avatar.js');
var Utils = require('../utils/utils.js');
var SoundManager = require('../sound-manager/sound-manager.js');

var advancePlaceHolder;
var pauseOverlayAction;
var numLines;
var imageGlowTextures;
var playerName;
var playerAvatar;

var blackOverlay;
var pauseObjects;
var pauseOverlay;
var popupImage;
var dialogContainer;
var dialogText;
var leftAvatar;
var rightAvatar;
var dialogOverlay;

export function init(playerName_parameter, playerImageCanvas) {
  const renderer = Utils.getRenderer()
  playerName = playerName_parameter;
  var avatarTotalSize =
    Constants.playerAvatarSize + Constants.playerAvatarLineWidth;
  playerAvatar = PIXI.RenderTexture.create(
    avatarTotalSize + Constants.playerAvatarOffset,
    avatarTotalSize
  );
  PIXI.loader.load(function() {
    var circle = new PIXI.Graphics();
    circle.lineStyle(Constants.playerAvatarLineWidth, 0x7fbbb3, 1);
    circle.drawCircle(
      avatarTotalSize / 2 + Constants.playerAvatarOffset,
      avatarTotalSize / 2,
      Constants.playerAvatarSize / 2
    );

    var avatar = new PIXI.Sprite(PIXI.Texture.fromCanvas(playerImageCanvas));
    avatar.scale.set(
      Constants.playerAvatarSize / Math.min(avatar.width, avatar.height)
    );
    avatar.position.x = Constants.playerAvatarOffset;
    var circleMask = new PIXI.Graphics();
    circleMask.beginFill();
    circleMask.drawCircle(
      avatarTotalSize / 2 + Constants.playerAvatarOffset,
      avatarTotalSize / 2,
      Constants.playerAvatarSize / 2
    );
    circleMask.endFill();
    avatar.mask = circleMask;
    var temp = new PIXI.Container();
    temp.addChild(avatar);
    renderer.render(temp, playerAvatar);
    renderer.render(circle, playerAvatar);
    Avatar.setPlayerInfo(playerName, playerAvatar);
  });

  var container = new PIXI.Container();
  // pause objects
  pauseObjects = new PIXI.Container();
  pauseObjects.visible = false;
  container.addChild(pauseObjects);
  // pause overlay to detect click during pause
  pauseOverlay = new PIXI.Graphics();
  pauseOverlay.interactive = true;
  pauseOverlay.hitArea = new PIXI.Rectangle(
    0,
    0,
    Constants.screenWidth,
    Constants.screenHeight
  );
  pauseOverlay.visible = false;
  function onClickPause() {
    pauseOverlay.visible = false;
    pauseOverlayAction();
  }
  pauseOverlay.on('click', onClickPause);
  pauseOverlay.on('tap', onClickPause);
  container.addChild(pauseOverlay);
  // dialog container
  dialogContainer = new PIXI.Container();
  dialogContainer.position.x =
    (Constants.screenWidth - Constants.dialogBoxWidth) / 2;
  dialogContainer.position.y =
    Constants.screenHeight -
    Constants.dialogBoxHeight -
    Constants.dialogBoxPadding;
  dialogContainer.visible = false;
  container.addChild(dialogContainer);
  // black overlay to darken the background
  blackOverlay = new PIXI.Graphics();
  blackOverlay.beginFill(0, 1);
  blackOverlay.drawRect(0, 0, Constants.screenWidth, Constants.screenHeight);
  blackOverlay.endFill();
  blackOverlay.alpha = 0.5;
  blackOverlay.position.x = -dialogContainer.position.x;
  blackOverlay.position.y = -dialogContainer.position.y;
  blackOverlay.visible = false;
  dialogContainer.addChild(blackOverlay);
  // popup image
  popupImage = new PIXI.Sprite();
  popupImage.anchor.set(0.5, 0.5);
  popupImage.position.set(
    Constants.screenWidth / 2 - dialogContainer.position.x,
    -dialogContainer.position.y / 2
  );
  dialogContainer.addChild(popupImage);
  // dialog box
  var dialogBox = new PIXI.Graphics();
  dialogBox.beginFill(0xffffff);
  dialogBox.drawRoundedRect(
    0,
    0,
    Constants.dialogBoxWidth,
    Constants.dialogBoxHeight,
    10
  );
  dialogBox.endFill();
  dialogBox.alpha = 0.87;
  dialogContainer.addChild(dialogBox);
  dialogText = new Text('', {
    fontFamily: 'Arial',
    fontSize: Constants.fontSize,
    wordWrap: true,
    wordWrapWidth: Constants.dialogBoxWidth - 2 * Constants.innerDialogPadding,
    lineHeight: Constants.fontSize * 1.3
  });
  dialogText.position.x = Constants.innerDialogPadding;
  dialogText.position.y = Constants.innerDialogPadding;
  numLines = Math.round(
    (dialogBox.height - 2 * Constants.innerDialogPadding) / dialogText.height
  );
  dialogContainer.addChild(dialogText);
  // left and right avatars, note that they are children of dialogContainer
  leftAvatar = new Avatar();
  leftAvatar.container.position.set(Constants.avatarOffset, 0);
  dialogContainer.addChild(leftAvatar.container);

  rightAvatar = new Avatar();
  rightAvatar.container.position.set(
    dialogBox.width - Constants.avatarOffset,
    0
  );
  rightAvatar.container.scale.x = -1;
  rightAvatar.nameText.scale.x = -1;
  rightAvatar.nameText.anchor.set(1, 1);
  dialogContainer.addChild(rightAvatar.container);

  dialogOverlay = new PIXI.Graphics();
  dialogOverlay.interactive = true;
  dialogOverlay.hitArea = new PIXI.Rectangle(
    0,
    0,
    Constants.screenWidth,
    Constants.screenHeight
  );
  dialogOverlay.position.x = -dialogContainer.position.x;
  dialogOverlay.position.y = -dialogContainer.position.y;
  function onClick() {
    dialogOverlay.interactive = false;
    advancePlaceHolder();
  }
  dialogOverlay.on('click', onClick);
  dialogOverlay.on('tap', onClick);
  dialogContainer.addChild(dialogOverlay);

  return container;
};

function playNarration(node, callback) {
  if (node.tagName != 'NARRATION') {
    return;
  }
  dialogText.text = '';
  dialogContainer.visible = true;
  displayDialogText(node.textContent.trim(), function() {
    advancePlaceHolder = callback;
    dialogOverlay.interactive = true;
  });
}

function advancePopup(node, callback) {
  if (!node) {
    callback();
    return;
  }
  function next() {
    advancePopup(node.nextElementSibling, callback);
  }
  if (node.tagName == 'NARRATION') {
    playNarration(node, next);
  } else if (node.tagName == 'DIALOGUE') {
    playDialogue(node, next);
  }
}

function playPopup(node, callback) {
  if (node.tagName != 'POPUP') {
    return;
  }
  var child = node.children[0];
  if (child.tagName != 'IMAGE') {
    console.error('POPUP has no IMAGE');
    return;
  }
  popupImage.texture = imageGlowTextures[child.textContent];
  popupImage.visible = true;
  child = child.nextElementSibling;

  var next = function() {
    popupImage.visible = false;
    dialogOverlay.interactive = true;
    callback();
  };

  advancePopup(child, next);
}

function advanceDialogue(node, lastChangeLeft, callback) {
  if (!node) {
    // reset name text
    leftAvatar.reset();
    rightAvatar.reset();
    callback();
    return;
  }
  if (node.tagName != 'SPEECH') {
    advanceDialogue(node.nextElementSibling, lastChangeLeft, callback);
  }
  var speaker = node.getAttribute('speaker');
  var expression = node.getAttribute('expression') || 'normal';
  var audience = node.getAttribute('audience') || 'all';
  var speakerLeft;
  var audienceTexture;

  // determine which side to draw on
  if (leftAvatar.isCharacter(speaker)) {
    speakerLeft = true;
  } else if (rightAvatar.isCharacter(speaker)) {
    speakerLeft = false;
  } else if (audience == 'all' || rightAvatar.isCharacter(audience)) {
    speakerLeft = true;
  } else if (leftAvatar.isCharacter(audience)) {
    speakerLeft = false;
  } else {
    speakerLeft = !lastChangeLeft;
    lastChangeLeft = !lastChangeLeft;
  }

  // draw the speaker
  var speakerAvatar = speakerLeft ? leftAvatar : rightAvatar;
  speakerAvatar.setCharacter(speaker, expression, true);

  // the audience
  var audienceAvatar = speakerLeft ? rightAvatar : leftAvatar;
  if (audience == 'all' || audience == speaker) {
    // addressing everyone or talking to oneself, hide audienceSide
    audienceAvatar.hide();
  } else if (!audienceAvatar.isCharacter(audience)) {
    audienceAvatar.setCharacter(audience, 'normal', false);
  } else {
    audienceAvatar.unfocus();
  }

  // dialog text
  displayDialogText(node.textContent.trim(), function() {
    advancePlaceHolder = function() {
      advanceDialogue(node.nextElementSibling, lastChangeLeft, callback);
    };
    dialogOverlay.interactive = true;
  });
}

function displayDialogText(text, callback) {
  callback = callback || Constants.nullFunction;
  text = text.replace(/{playerName}/g, playerName);
  var wrappedText = dialogText.wordWrap(text);
  var lines = wrappedText.split(/(?:\r\n|\r|\n)/);
  var curText = '';
  var tween;
  var temp = { _textLength: 0 };
  Object.defineProperty(temp, 'textLength', {
    get: function() {
      return this._textLength;
    },
    set: function(length) {
      this._textLength = length;
      dialogText.text = curText.substring(0, length);
    }
  });
  function displayPart() {
    temp.textLength = 0;
    if (lines.length <= numLines) {
      curText = lines.join('\n');
      tween = TweenLite.to(temp, curText.length * Constants.textSpeed, {
        textLength: curText.length,
        ease: Power0.easeNone,
        onComplete: callback
      });
    } else {
      curText = lines.splice(0, numLines).join('\n');
      tween = TweenLite.to(temp, curText.length * Constants.textSpeed, {
        textLength: curText.length,
        ease: Power0.easeNone,
        onComplete: function() {
          advancePlaceHolder = function() {
            displayPart();
          };
          dialogOverlay.interactive = true;
        }
      });
    }
    advancePlaceHolder = function() {
      tween.progress(1);
    };
    dialogOverlay.interactive = true;
  }
  displayPart();
}

function playDialogue(node, callback) {
  if (node.tagName != 'DIALOGUE') {
    return;
  }
  if (node.children.length <= 0) {
    return callback();
  }
  blackOverlay.visible = true;
  dialogText.text = '';
  dialogContainer.visible = true;
  advanceDialogue(node.children[0], false, function() {
    // hide dialogue layers
    leftAvatar.hide();
    rightAvatar.hide();
    blackOverlay.visible = false;
    callback();
  });
}

function playPause(node, callback) {
  if (node.tagName != 'PAUSE') {
    return;
  }
  dialogContainer.visible = false;
  pauseObjects.removeChildren();
  function onClick() {
    pauseObjects.visible = false;
    callback();
  }
  for (var i = 0; i < node.children.length; i++) {
    var child = node.children[i];
    var object = ObjectManager.parsePauseObject(child, onClick);
    pauseObjects.addChild(object);
  }
  var duration = parseFloat(node.getAttribute('duration'));
  if (duration == 0) {
    pauseOverlayAction = onClick;
    pauseOverlay.visible = true;
  } else if (duration > 0) {
    setTimeout(onClick, 1000 * duration);
  }
  pauseObjects.visible = true;
}

function playLocation(node, callback) {
  if (node.tagName != 'LOCATION') {
    return;
  }
  dialogContainer.visible = false;
  LocationManager.changeSeqLocation(node, callback);
}

function playSound(node, callback) {
  if (node.tagName != 'SOUND') {
    return;
  }
  SoundManager.playAsyncSound(node.getAttribute('name'));
  callback();
}

function advanceSequence(node, callback) {
  if (!node) {
    callback();
    return;
  }
  function next() {
    advanceSequence(node.nextElementSibling, callback);
  }
  if (node.tagName == 'POPUP') {
    playPopup(node, next);
  } else if (node.tagName == 'NARRATION') {
    playNarration(node, next);
  } else if (node.tagName == 'DIALOGUE') {
    playDialogue(node, next);
  } else if (node.tagName == 'PAUSE') {
    playPause(node, next);
  } else if (node.tagName == 'LOCATION') {
    playLocation(node, next);
  } else if (node.tagName == 'SOUND') {
    playSound(node, next);
  } else {
    next();
  }
}

export function playSequence(node, callback) {
  if (node.tagName != 'SEQUENCE') {
    return;
  }
  if (node.children.length <= 0) {
    callback();
    return;
  }
  // pre-render popup image first
  imageGlowTextures = {};
  var images = node.getElementsByTagName('IMAGE');
  for (var i = 0; i < images.length; i++) {
    var rawImage = new PIXI.Sprite.fromImage(
      Constants.imgPath + images[i].textContent
    );
    rawImage.anchor.set(0.5, 0.5);
    var glowTexture = FilterEffects.createGlowTexture(rawImage);
    imageGlowTextures[images[i].textContent] = glowTexture;
  }

  ObjectManager.setMapObjectsInteractivity(false);
  ObjectManager.setSeqObjectsVisibility(true);
  advanceSequence(node.children[0], function() {
    // hide sequence layers
    dialogContainer.visible = false;
    ObjectManager.setMapObjectsInteractivity(true);
    ObjectManager.setSeqObjectsVisibility(false);
    callback();
  });
}

export function skipSequence(node, callback) {
  if (node.tagName == 'SEQUENCE') {
    callback();
  }
}
