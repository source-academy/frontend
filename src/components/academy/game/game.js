import createInitializer from './create-initializer'

export default function(div, canvas, username, userStory) {
  var StoryXMLPlayer = require('./story-xml-player');
  var container = document.getElementById('game-display')
  var initialize = createInitializer(StoryXMLPlayer, username, userStory)
  initialize(div, canvas);
}
