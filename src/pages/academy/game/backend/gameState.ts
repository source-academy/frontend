import { IAssessmentOverview } from 'src/components/assessment/assessmentShape';
import { GameState, Story } from 'src/reducers/states';
import { GameSessionData } from '../gameTypes';
import { getMissionPointer } from './missionPointer';
import { isStudent } from './user';

const SaveManager = require('../saveManager/saveManager.js');

/**
 * Handles data regarding the game state.
 * - The student's list of completed quests and collectibles
 * - The student's current story mission
 * - The global list of missions that are open
 * - The action to save user state to server.
 */
let handleSaveData: (data: GameSessionData) => void;

// everything is going to be stored in session storage since we discovered game-state dosent persist over pages

export const SESSION_DATA_KEY = 'source_academy_session_data';

export async function fetchGameData(
  story: Story | undefined,
  gameStates: GameState,
  missions: IAssessmentOverview[] | undefined
) {
  // fetch only needs to be called once; if there are additional calls somehow then ignore them
  // only for students
  if (hasBeenFetched() && isStudent()) {
    return getSessionData().story.story;
  }
  const data = {
    story,
    gameStates,
    currentDate: Date()
  };
  if (!getSessionData()) {
    setSessionData(data);
  }

  if (!isStudent()) {
    // resets current progress (local storage) for testers
    SaveManager.resetLocalSaveData();
  }
  return getMissionPointer(missions);
}

export function setSessionData(sessionData: GameSessionData) {
  sessionStorage.setItem(SESSION_DATA_KEY, JSON.stringify(sessionData));
}

function getSessionData() {
  const sessionData = sessionStorage.getItem(SESSION_DATA_KEY);
  if (sessionData) {
    return JSON.parse(sessionData);
  } else {
    return null;
  }
}

export function hasBeenFetched() {
  return sessionStorage.hasOwnProperty(SESSION_DATA_KEY);
}

export function setSaveHandler(saveData: any) {
  handleSaveData = saveData;
}

export function saveUserData(data: any) {
  if (data && handleSaveData !== undefined) {
    handleSaveData(data);
    setSessionData(data);
  }
}

export function saveCollectible(collectible: string) {
  const sessionData = getSessionData();
  // data.gameStates.collectibles[collectible] = 'completed';
  saveUserData(sessionData);
}

export function hasCollectible(collectible: string) {
  return hasBeenFetched() && getSessionData().gameStates.collectibles[collectible] === 'completed';
}

export function saveQuest(questId: string) {
  const sessionData = getSessionData();
  sessionData.gameStates.completed_quests.push(questId);
  saveUserData(sessionData);
}

export function hasCompletedQuest(questId: string) {
  return hasBeenFetched() && getSessionData().gameStates.completed_quests.includes(questId);
}
