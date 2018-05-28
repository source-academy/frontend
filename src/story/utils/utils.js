function getStoryAncestor(node) {
  var storyAncestor = node.parentElement;
  while (storyAncestor && storyAncestor.tagName != 'STORY') {
    storyAncestor = storyAncestor.parentElement;
  }
  return storyAncestor;
}
module.exports.getStoryAncestor = getStoryAncestor;

var renderer;
module.exports.saveRenderer = function(aRenderer) {
  renderer = aRenderer;
};
module.exports.getRenderer = function() {
  return renderer;
};
