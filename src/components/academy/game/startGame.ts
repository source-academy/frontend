import { IAssessmentOverview } from 'src/components/assessment/assessmentShape';
import { Story } from 'src/reducers/states';
import { LINKS } from 'src/utils/constants';
import { fetchGameData } from './backend/gameState';
import Constants from './constants/constants';
import { initStage, loadStory } from './storyXmlPlayer';
import hookHandlers from './utils/hookHandlers';
import { getMissionPointer } from './backend/missionPointer';

const config = {
  hookHandlers,
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
  gameState: object,
  missions: IAssessmentOverview[] | undefined
) {
  await fetchGameData(userStory, gameState, missions);
  const xmlFileName: string = getMissionPointer(missions);
  initStage(div, canvas, { ...config, playerName: username });
  loadStory(xmlFileName);
}

export default startGame;
