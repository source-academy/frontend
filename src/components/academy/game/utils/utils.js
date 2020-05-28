export function getStoryAncestor(node) {
  var storyAncestor = node.parentElement;
  while (storyAncestor && storyAncestor.tagName != 'STORY') {
    storyAncestor = storyAncestor.parentElement;
  }
  return storyAncestor;
}

var renderer;

export function saveRenderer(aRenderer) {
  renderer = aRenderer;
}

export function getRenderer() {
  return renderer;
}

export default { saveRenderer };
