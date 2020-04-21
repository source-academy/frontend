import { storyXMLPathTest, storyXMLPathLive } from '../constants/constants'
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
const OVERRIDE_KEY = "key for SA2021 overridden",
SESSION_DATA_KEY = "key for SA2021 sessionData";

export function fetchGameData(story, gameStates, callback) {
  console.log("fetch game data");
  console.log(story);
  console.log(gameStates);
  console.log(callback);
  // fetch only needs to be called once; if there are additional calls somehow then ignore them
  // if(hasBeenFetched()) {
  //   callback();
  //   return;
  // }
  console.log("storing into session storage");
  let data = {
    "story":story, "gameStates":gameStates, "currentDate":Date()
  }
  sessionStorage.setItem(SESSION_DATA_KEY, JSON.stringify(data));
  console.log(sessionStorage.getItem(SESSION_DATA_KEY));
  fetchGlobalMissionPointer(callback);
}

function printSessionData() {
  console.log("SessionData = " + (sessionStorage.getItem(SESSION_DATA_KEY)));
}

function setSessionData(data) {
  sessionStorage.setItem(SESSION_DATA_KEY, JSON.stringify(data));
}

function getSessionData() {
  return JSON.parse(sessionStorage.getItem(SESSION_DATA_KEY));
}

function hasBeenFetched() {
  return sessionStorage.hasOwnProperty(SESSION_DATA_KEY);
}

// override student session data
export function overrideSessionData(data) {
  setSessionData(data);
  if (data) {
    sessionStorage.setItem(OVERRIDE_KEY, "true");
  } else {
    sessionStorage.removeItem(OVERRIDE_KEY);
  }
  printSessionData();
}

export function setSaveHandler(saveData) {
  handleSaveData = saveData;
}

export function saveUserData(data) {
  console.log('saving student data');
  if (data && handleSaveData !== undefined) {
    handleSaveData(data)
    setSessionData(data);
  }
}

export function saveCollectible(collectible) {
  const data = getSessionData();
  data.gameStates.collectibles[collectible] = 'completed';
  saveUserData(data);
}

export function hasCollectible(collectible) {
  return hasBeenFetched() && 
    getSessionData().gameStates.collectibles[collectible]  === 'completed';
}

export function saveQuest(questId) {
  const data = getSessionData();
  data.gameStates.completed_quests.push(questId);
  saveUserData(data);
}

export function hasCompletedQuest(questId) {
  return hasBeenFetched() && 
    getSessionData().gameStates.completed_quests.includes(questId);
}

function getStudentStory() {
  return hasBeenFetched() && 
    getSessionData().story.story;
}

let stories = [];

function fetchGlobalMissionPointer(callback) {
  const makeAjax = isTest => $.ajax({
    type: 'GET',
    url: (isTest ? storyXMLPathTest : storyXMLPathLive) + 'master.xml',
    dataType: 'xml',
    success: xml => {
      console.log(xml.children[0].children);
      stories = Array.from(xml.children[0].children);
      stories = stories.sort((a, b) => parseInt(a.getAttribute("key")) - parseInt(b.getAttribute("key")));
      const now = new Date(getSessionData().currentDate);
      const openStory = story => new Date(story.getAttribute("startDate")) < now && now < new Date(story.getAttribute("endDate"));
      stories = stories.filter(openStory);
      console.log(stories);
      callback();
    },
    error: isTest
      ? () => {
          console.log('Cannot find master story list on test');
          console.log('Trying on live...');
          makeAjax(false);
        }
      : () => {
          console.error('Cannot find master story list');
        }
  });
  makeAjax(!isStudent());
}

/**
 * Obtain the story mission to load. This will usually be the student's current mission pointer.
 * However, in the event the student's current mission pointer falls outside the bounds of the
 * global list of open missions, then the corresponding upper (or lower) bound will be used.
 */
export function getMissionPointer() {
  //finds the mission id's mission pointer
  const studentStory = getStudentStory();
  console.log("students story " + studentStory);
  let missionPointer = stories.find(story => !studentStory || story.getAttribute("id") === studentStory).getKey();
  const newest = parseInt(stories[stories.length-1].getAttribute("key")); // the newest mission to open
  const oldest = parseInt(stories[0].getAttribute("key")); // the oldest mission to open
  missionPointer = Math.min(missionPointer, newest);
  missionPointer = Math.max(missionPointer, oldest);
  const storyToLoad = stories.filter(story => story.getAttribute("id") == missionPointer)[0];
  console.log("Now loading story " + storyToLoad.getAttribute("id")); // debug statement
  return storyToLoad.getAttribute("id");
}