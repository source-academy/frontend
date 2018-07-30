var Constants = require('../../constants/constants.js');
var FilterEffects = require('../../filter-effects/filter-effects.js');

var playerName;
var playerAvatar;

function Avatar() {
  var container = new PIXI.Container();
  var image = new PIXI.Sprite();
  image.anchor.set(0, 1);
  image.visible = false;
  container.addChild(image);

  var nameText = new PIXI.Text('', {
    fontFamily: 'Arial',
    fontSize: Constants.fontSize
  });
  nameText.anchor.set(0, 1);
  nameText.position.set(Constants.nameBoxXPadding, 0);
  var nameBack = new PIXI.Graphics();
  nameBack.position.set(0, -Constants.nameBoxHeight / 2 - nameText.height / 2);
  var nameBox = new PIXI.Container();
  nameBox.position.set(0, 0);
  nameBox.addChild(nameBack);
  nameBox.addChild(nameText);
  nameBox.visible = false;
  container.addChild(nameBox);

  this.container = container;
  this.image = image;
  this.nameText = nameText;
  this.nameBack = nameBack;
  this.nameBox = nameBox;

  this.isFocused = true;
}

module.exports = Avatar;
module.exports.setPlayerInfo = function(name, avatar) {
  playerName = name;
  playerAvatar = avatar;
};

Avatar.prototype.hide = function() {
  this.image.visible = false;
  this.nameBox.visible = false;
};

function capitalizeName(name) {
  if (!name) {
    return name;
  }
  if (name == 'all') {
    return name;
  }
  function upperCase(text) {
    return text.toUpperCase();
  }
  return name.replace(/(?:^|-)([a-z])/g, upperCase).replace(/-/g, ' ');
}

function isSameName(name1, name2) {
  return capitalizeName(name1) == capitalizeName(name2);
}

Avatar.prototype.isCharacter = function(name) {
  if (name == 'you') {
    return this.nameText.text == playerName;
  } else {
    return isSameName(name, this.nameText.text);
  }
};

Avatar.prototype.setCharacter = function(name, expression, isFocused) {
  try {
    if (name == 'you') {
      this.image.texture = playerAvatar;
    } else {
      this.image.texture = PIXI.Texture.fromFrame(
        name + '.' + expression + '.png'
      );
    }
    if (!isFocused) {
      this.image.texture = FilterEffects.createDarkenedTexture(
        this.image.texture
      );
    }
    this.image.visible = true;
  } catch (e) {
    this.image.texture = PIXI.Texture.EMPTY;
    console.error(e);
  }
  this.isFocused = isFocused;
  this.nameText.text = capitalizeName(name == 'you' ? playerName : name);
  this.nameBack.clear();
  this.nameBack.beginFill(isFocused ? 0x7fbbb3 : 0x546e6a);
  this.nameBack.drawRoundedRect(
    0,
    0,
    Math.abs(this.nameText.width) + 2 * Constants.nameBoxXPadding,
    Constants.nameBoxHeight,
    10
  );
  this.nameBack.endFill();
  this.nameBox.visible = true;
};

Avatar.prototype.unfocus = function() {
  if (this.isFocused) {
    this.isFocused = false;
    this.image.texture = FilterEffects.createDarkenedTexture(
      this.image.texture
    );
    this.image.visible = true;
    this.nameBack.clear();
    this.nameBack.beginFill(0x546e6a);
    this.nameBack.drawRoundedRect(
      0,
      0,
      Math.abs(this.nameText.width) + 2 * Constants.nameBoxXPadding,
      Constants.nameBoxHeight,
      10
    );
    this.nameBack.endFill();
  }
};

Avatar.prototype.reset = function() {
  this.nameText.text = '';
};
