import createInitializer from './create-initializer'

export default function(div, canvas, username, story, attemptedAll) {
  window.ASSETS_HOST =
    'https://s3-ap-southeast-1.amazonaws.com/source-academy-assets/';
  window.LOCAL_HOST =
      'http://localhost:8088/';
  var StoryXMLPlayer = require('./story-xml-player');
  var container = document.getElementById('game-display')
  var initialize = createInitializer(StoryXMLPlayer, story, username, attemptedAll)
  initialize(div, canvas);
}
