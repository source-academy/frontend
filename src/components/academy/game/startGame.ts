import { IAssessmentOverview } from 'src/components/assessment/assessmentShape';
import { Story } from '../../../reducers/states';
import { LINKS } from '../../../utils/constants';
import { fetchGameData } from './backend/gameState';
import Constants from './constants/constants';
import { loadStoryById } from './preloadManager/storyManager';
import { initStage } from './storyXmlPlayer';
import hookHandlers from './utils/hookHandlers';

const config = {
  hookHandlers,
  wristDeviceFunc: () => window.open(LINKS.LUMINUS),
  playerImageCanvas: document.createElement('CANVAS'),
  changeLocationHook: (newLocation: string) =>
    localStorage.setItem(Constants.LOCATION_KEY, newLocation)
};

async function startGame(
  div: HTMLDivElement,
  canvas: HTMLCanvasElement,
  username: string | undefined,
  userStory: Story | undefined,
  gameState: object,
  missions: IAssessmentOverview[] | undefined
) {
  const storyId: string = await fetchGameData(userStory, gameState, missions);
  initStage(div, canvas, { ...config, playerName: username });
  loadStoryById(storyId);
}

export default startGame;
