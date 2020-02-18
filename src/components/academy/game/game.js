import createInitializer from './create-initializer'

export default function(div, canvas, username, story, attemptedAll) {
  var StoryXMLPlayer = require('./story-xml-player');
  var container = document.getElementById('game-display')
  var initialize = createInitializer(StoryXMLPlayer, story, username, attemptedAll)
  initialize(div, canvas);
}
