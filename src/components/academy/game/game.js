import createInitializer from './create-initializer'

export default function(div, canvas, username, story, attemptedAll) {
  window.ASSETS_HOST =
    'https://s3-ap-southeast-1.amazonaws.com/source-academy-assets/';
  window.STORIES_HOST =
      'https://bitbucket.org/cs1101s/cs1101s_story_1920_sem1/src/master/';
  window.LOCAL_HOST =
      'http://localhost:8088/';
  var StoryXMLPlayer = require('./story-xml-player');
  var container = document.getElementById('game-display')
  var initialize = createInitializer(StoryXMLPlayer, story, username, attemptedAll)
  initialize(div, canvas);
}
