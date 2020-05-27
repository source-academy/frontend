import hookHandlers from './utils/hookHandlers';
import { fetchGameData } from './backend/gameState';
import Constants from './constants/constants';
import { IAssessmentOverview } from 'src/components/assessment/assessmentShape';
import { Story } from 'src/reducers/states';
import { LINKS } from 'src/utils/constants';
import { GameData } from './gameTypes';
import { initStage, loadStory } from './storyXmlPlayer';

const config = {
  hookHandlers: hookHandlers,
  wristDeviceFunc: () => window.open(LINKS.LUMINUS),
  playerImageCanvas: $('<canvas />'),
  changeLocationHook: (newLocation: string) =>
    localStorage.setItem(Constants.LOCATION_KEY, newLocation)
};

async function startGame(
  div: HTMLDivElement,
  canvas: HTMLCanvasElement,
  username: string | undefined,
  userStory: Story | undefined,
  gameState: Object,
  missions: IAssessmentOverview[] | undefined
) {
  const gameData: GameData = await fetchGameData(userStory, gameState, missions);
  initStage(div, canvas, { ...config, playerName: username });
  loadStory(gameData);
}

export default startGame;
