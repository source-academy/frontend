import hookHandlers from './utils/hookHandlers';
import { fetchGameData } from './backend/gameState';
import Constants from './constants/constants';
import { IAssessmentOverview } from 'src/components/assessment/assessmentShape';
import { Story } from 'src/reducers/states';
import { LINKS } from 'src/utils/constants';
const StoryXMLPlayer = require('./storyXmlPlayer');

const config = {
  hookHandlers: hookHandlers,
  wristDeviceFunc: () => window.open(LINKS.LUMINUS),
  playerImageCanvas: $('<canvas />'),
  changeLocationHook: (newLocation: string) =>
    localStorage.setItem(Constants.LOCATION_KEY, newLocation)
};

export default function(
  div: HTMLDivElement,
  canvas: HTMLCanvasElement,
  username: string | undefined,
  userStory: Story | undefined,
  gameState: Object,
  missions: IAssessmentOverview[] | undefined
) {
  function initialize(story: Story | undefined, div: HTMLDivElement, canvas: HTMLCanvasElement) {
    StoryXMLPlayer.init(div, canvas, { ...config, playerName: username });
    StoryXMLPlayer.loadStory(story, Constants.nullFunction);
  }

  fetchGameData(userStory, gameState, missions, (story: Story) => initialize(story, div, canvas));
}
