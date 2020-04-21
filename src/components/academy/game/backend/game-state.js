import { storyXMLPathTest, storyXMLPathLive, SAVE_DATA_KEY, LOCATION_KEY } from '../constants/constants'
import { isStudent } from './user';

var SaveManager = require('../save-manager/save-manager.js');

/**
 * Handles data regarding the game state. 
 * - The student's list of completed quests and collectibles
 * - The student's current story mission
 * - The global list of missions that are open
 * - The action to save user state to server.
 */
let handleSaveData = undefined;

//everything is going to be stored in session storage since we discovered game-state dosent persist over pages
const OVERRIDE_KEY = "source_academy_override",
OVERRIDE_DATES_KEY = "source_academy_override_dates",
OVERRIDE_PUBLISH_KEY = "source_academy_override_publish",
SESSION_DATA_KEY = "source_academy_session_data";

let sessionData = undefined;

export function fetchGameData(story, gameStates, missions, callback) {
  // fetch only needs to be called once; if there are additional calls somehow then ignore them
  // only for students
  if(!hasBeenFetched() && isStudent()) {
    let data = {
      "story":story, "gameStates":gameStates, "currentDate":Date()
    }
    setSessionData(data);
  } else if (isStudent()) {
    callback(getSessionData().story.story);
    return;
  } 
  if (!isStudent()) {
    // resets current progress for testers
    SaveManager.resetLocalSaveData();
  }
  printSessionData();
  missions = organiseMissions(missions);
  getMissionPointer(missions, callback);
}

function printSessionData() {
  console.log("SessionData = " + (sessionStorage.getItem(SESSION_DATA_KEY)));
}

function setSessionData(sessionData) {
  sessionStorage.setItem(SESSION_DATA_KEY, JSON.stringify(sessionData));
}

function getSessionData() {
  return JSON.parse(sessionStorage.getItem(SESSION_DATA_KEY));
}

function hasBeenFetched() {
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
    sessionStorage.setItem(OVERRIDE_KEY, "true");
    if (data.overridePublish) {
      sessionStorage.setItem(OVERRIDE_PUBLISH_KEY, "will override published");
    }
    if (data.overrideDates) {
      sessionStorage.setItem(OVERRIDE_DATES_KEY, "will override dates");
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
    handleSaveData(data)
    setSessionData(data);
  }
}

export function saveCollectible(collectible) {
  const sessionData = getSessionData();
  data.gameStates.collectibles[collectible] = 'completed';
  saveUserData(sessionData);
}

export function hasCollectible(collectible) {
  return hasBeenFetched() && 
    getSessionData().gameStates.collectibles[collectible]  === 'completed';
}

export function saveQuest(questId) {
  const sessionData = getSessionData();
  sessionData.gameStates.completed_quests.push(questId);
  saveUserData(sessionData);
}

export function hasCompletedQuest(questId) {
  return hasBeenFetched() && 
    getSessionData().gameStates.completed_quests.includes(questId);
}


function getStudentStory() {
  //tries to retrieve local version of story
  //if unable to find, use backend's version.
  if (SaveManager.hasLocalSave()) {
    let actionSequence = SaveManager.getLocalSaveData().actionSequence;
    let story = actionSequence[actionSequence.length - 1].storyID;
    return story;
  } else {
    return hasBeenFetched()
      ? getSessionData().story.story
      : undefined;
  }
}

function organiseMissions(missions) {
  function compareMissions(x, y) {
    //compares with opening dates first and if equal, compare closing dates.
    //sort by earliest date
    const openX = new Date(x.openAt).getTime();
    const openY = new Date(y.openAt).getTime();
    const closeX = new Date(x.closeAt).getTime();
    const closeY = new Date(y.closeAt).getTime();
    return openX === openY
      ? Math.sign(closeX - closeY)
      : Math.sign(openX - openY);
  }
  function isWithinDates(mission, date) {
    return new Date(mission.openAt) <= now && 
        now <= new Date(mission.closeAt);
  }
  let predicate;
  const now = new Date(getSessionData().currentDate);
  
  if (isStudent()) {
    predicate = (mission) =>
      mission.isPublished && isWithinDates(mission, now);
  } else {
    // resets current progress
    SaveManager.resetLocalSaveData();
    //testers will play unpublished missions too and can go out of bounds unless
    //they state that they don't want to in the json file, using the override keys
    predicate = (mission)  => {
      let toPass = true;
      if (!sessionStorage.getItem(OVERRIDE_DATES_KEY)) {
        toPass = isWithinDates(mission, now);
      } 
      if (!sessionStorage.getItem(OVERRIDE_PUBLISH_KEY)) {
        toPass = toPass && mission.isPublished;
      }
      return toPass;
    }
  }
  missions = missions.filter(predicate);
  missions = missions.sort(compareMissions);
  return missions;
}

/**
 * Obtain the story mission to load. This will usually be the student's current mission pointer.
 * However, in the event the student's current mission pointer falls outside the bounds of the
 * global list of open missions, then the corresponding upper (or lower) bound will be used.
 */
function getMissionPointer(missions, callback) {
  //finds the mission id's mission pointer
  let studentStory = getStudentStory();
  const isStoryEmpty = story => story === undefined || story.length === 0;
  let missionPointer = isStoryEmpty(studentStory) 
    ? missions[0]
    : missions.find(mission => mission.story === studentStory);
  //if mission pointer is in localStorage and can't find any proper story.
  if (missionPointer === undefined && SaveManager.hasLocalSave()) {
    localStorage.removeItem(SAVE_DATA_KEY);
    studentStory = getStudentStory();
    missionPointer = isStoryEmpty(studentStory) 
      ? missions[0]
      : missions.find(mission => mission.story === studentStory);
  }
  if (missionPointer === undefined) {
    missionPointer = missions[0];
  }
  console.log("Now loading story " + missionPointer.story); // debug statement
  callback(missionPointer.story);
}