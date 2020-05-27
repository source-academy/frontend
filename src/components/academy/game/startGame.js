import hookHandlers from './utils/hookHandlers';
import { fetchGameData } from './backend/gameState';
import Constants from './constants/constants';
const StoryXMLPlayer = require('./storyXmlPlayer');

const config = {
  hookHandlers: hookHandlers,
  wristDeviceFunc: () => window.open(LINKS.LUMINUS),
  playerImageCanvas: $('<canvas />'),
  changeLocationHook: newLocation => localStorage.setItem(Constants.LOCATION_KEY, newLocation)
};

export default function(div, canvas, username, userStory, gameState, missions) {
  var container = document.getElementById('game-display');
  config.playerName = username;

  function initialize(story, div, canvas) {
    StoryXMLPlayer.init(div, canvas, config);
    StoryXMLPlayer.loadStory(story, Constants.nullFunction);
  }

  fetchGameData(userStory, gameState, missions, story => initialize(story, div, canvas));
}
