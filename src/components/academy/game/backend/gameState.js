import Constants from '../constants/constants';

import { isStudent } from './user';
import { getMissionPointer } from './missionPointer';

var SaveManager = require('../saveManager/saveManager.js');

/**
 * Handles data regarding the game state.
 * - The student's list of completed quests and collectibles
 * - The student's current story mission
 * - The global list of missions that are open
 * - The action to save user state to server.
 */
let handleSaveData = undefined;

//everything is going to be stored in session storage since we discovered game-state dosent persist over pages
export const OVERRIDE_KEY = 'source_academy_override',
  OVERRIDE_DATES_KEY = 'source_academy_override_dates',
  OVERRIDE_PUBLISH_KEY = 'source_academy_override_publish',
  SESSION_DATA_KEY = 'source_academy_session_data';

let sessionData = undefined;

export async function fetchGameData(story, gameStates, missions) {
  // fetch only needs to be called once; if there are additional calls somehow then ignore them
  // only for students
  if (hasBeenFetched() && isStudent()) {
    return getSessionData().story.story;
  }
  const data = {
    story: story,
    gameStates: gameStates,
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

function printSessionData() {
  console.log('SessionData = ' + sessionStorage.getItem(SESSION_DATA_KEY));
}

function setSessionData(sessionData) {
  sessionStorage.setItem(SESSION_DATA_KEY, JSON.stringify(sessionData));
}

function getSessionData() {
  return JSON.parse(sessionStorage.getItem(SESSION_DATA_KEY));
}

export function hasBeenFetched() {
  return sessionStorage.hasOwnProperty(SESSION_DATA_KEY);
}

function removeSessionStorage() {
  sessionStorage.removeItem(SESSION_DATA_KEY);
  sessionStorage.removeItem(OVERRIDE_KEY);
  sessionStorage.removeItem(OVERRIDE_PUBLISH_KEY);
  sessionStorage.removeItem(OVERRIDE_DATES_KEY);
}

// override student session data
export function overrideSessionData(data) {
  if (data) {
    setSessionData(data.sessionData);
    sessionStorage.setItem(OVERRIDE_KEY, 'true');
    if (data.overridePublish) {
      sessionStorage.setItem(OVERRIDE_PUBLISH_KEY, 'will override published');
    }
    if (data.overrideDates) {
      sessionStorage.setItem(OVERRIDE_DATES_KEY, 'will override dates');
    }
  } else {
    removeSessionStorage();
  }
  printSessionData();
}

export function setSaveHandler(saveData) {
  handleSaveData = saveData;
}

export function saveUserData(data) {
  if (data && handleSaveData !== undefined) {
    handleSaveData(data);
    setSessionData(data);
  }
}

export function saveCollectible(collectible) {
  const sessionData = getSessionData();
  data.gameStates.collectibles[collectible] = 'completed';
  saveUserData(sessionData);
}

export function hasCollectible(collectible) {
  return hasBeenFetched() && getSessionData().gameStates.collectibles[collectible] === 'completed';
}

export function saveQuest(questId) {
  const sessionData = getSessionData();
  sessionData.gameStates.completed_quests.push(questId);
  saveUserData(sessionData);
}

export function hasCompletedQuest(questId) {
  return hasBeenFetched() && getSessionData().gameStates.completed_quests.includes(questId);
}
