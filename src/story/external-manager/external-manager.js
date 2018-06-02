import * as PIXI from 'pixi.js'

var externalHooks;

var externalOverlay;

module.exports.init = function(hookHandlers) {
  externalHooks = hookHandlers;

  externalOverlay = new PIXI.Container();
  externalOverlay.visible = false;
  return externalOverlay;
};

function getExternalOverlay() {
  return externalOverlay;
}
module.exports.getExternalOverlay = getExternalOverlay;

function playExternalAction(node) {
  if (node.tagName != 'EXTERNAL_ACTION') {
    return;
  }
  if (typeof externalHooks[node.getAttribute('name')] != 'function') {
    return;
  }
  var argList = [];
  if (node.children.length > 0) {
    var child = node.children[0];
    while (child) {
      if (child.tagName == 'ARGUMENT') {
        argList.push(child.textContent);
      }
      child = child.nextElementSibling;
    }
  }
  externalHooks[node.getAttribute('name')].apply(this, argList);
}
module.exports.playExternalAction = playExternalAction;
