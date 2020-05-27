import createInitializer from './createInitializer';

export default function(div, canvas, username, userStory, gameState, missions) {
  var StoryXMLPlayer = require('./storyXmlPlayer');
  var container = document.getElementById('game-display');
  var initialize = createInitializer(StoryXMLPlayer, username, userStory, gameState, missions);
  initialize(div, canvas);
}
