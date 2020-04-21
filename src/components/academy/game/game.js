import createInitializer from './create-initializer'

export default function(div, canvas, username, userStory, gameState, missions) {
  var StoryXMLPlayer = require('./story-xml-player');
  var container = document.getElementById('game-display')
  var initialize = createInitializer(StoryXMLPlayer, username, userStory, gameState, missions)
  initialize(div, canvas);
}
