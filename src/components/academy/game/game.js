import createInitializer from './create-initializer'

export default function(div, canvas, story) {
  window.ASSETS_HOST =
    'https://s3-ap-southeast-1.amazonaws.com/source-academy-assets/';
  var StoryXMLPlayer = require('./story-xml-player');
  var container = document.getElementById('game-display')
  var username = container.getAttribute('data-username')
  var attemptedAll = container.getAttribute('data-attempted-all') === "true"
  var initialize = createInitializer(StoryXMLPlayer, story, username, attemptedAll)
  initialize(div, canvas);
}
