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
let fetched = false;
let studentData = undefined,
    handleSaveData = undefined,
    studentStory = undefined;

export function fetchGameData(userStory, gameState, callback) {
  // fetch only needs to be called once; if there are additional calls somehow then ignore them
  if(fetched) {
    callback();
    return;
  }
  fetched = true;
  studentStory = userStory.story;
  studentData = gameState;
  fetchGlobalMissionPointer(callback);
}

// overrides
let studentDataOverride = undefined,
    currentDateOverride = undefined,
    studentStoryOverride = undefined;

// override student game data
export function overrideGameState(data) {
  if (data) {
    studentDataOverride = data.gameState;
    studentStoryOverride = data.story;
    currentDateOverride = data.currentDate;
  } else {
    studentStoryOverride = studentDataOverride = missionPointerOverride = currentDateOverride = undefined;
  }
}

export function setSaveHandler(saveData) {
  handleSaveData = saveData;
}

export function getStudentData() {
  // formerly create-initializer/loadFromServer
  if(studentDataOverride) return studentDataOverride;
  return studentData;
}

export function saveStudentData(data) {
  console.log('saving student data');
  if (handleSaveData !== undefined) {
    handleSaveData(data)
  }
}

export function saveCollectible(collectible) {
  studentData.collectibles[collectible] = 'completed';
  saveStudentData(studentData);
}

export function hasCollectible(collectible) {
  return studentData && 
    studentData.collectibles[collectible] && 
    studentData.collectibles[collectible] === 'completed';
}

export function saveQuest(questId) {
  studentData.completed_quests.push(questId);
  saveStudentData(studentData);
}

export function hasCompletedQuest(questId) {
  return studentData && studentData.completed_quests.includes(questId);
}

function getStudentStory() {
  if(studentStoryOverride) return studentStoryOverride;
  return studentStory;
}

let stories = [];

function fetchGlobalMissionPointer(callback) {
  const makeAjax = isTest => $.ajax({
    type: 'GET',
    url: (isTest ? storyXMLPathTest : storyXMLPathLive) + 'master.xml',
    dataType: 'xml',
    success: xml => {
      stories = Array.from(xml.children[0].children);
      stories = stories.sort((a, b) => parseInt(a.getAttribute("key")) - parseInt(b.getAttribute("key")));
      const now = currentDateOverride ? currentDateOverride : new Date();
      const openStory = story => new Date(story.getAttribute("startDate")) < now && now < new Date(story.getAttribute("endDate"));
      stories = stories.filter(openStory);
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
  let missionPointer = stories.find(story => story.getAttribute("id") === getStudentStory());
  const newest = parseInt(stories[stories.length-1].getAttribute("key")); // the newest mission to open
  const oldest = parseInt(stories[0].getAttribute("key")); // the oldest mission to open
  missionPointer = Math.min(missionPointer, newest);
  missionPointer = Math.max(missionPointer, oldest);
  const storyToLoad = stories.filter(story => story.getAttribute("key") == missionPointer)[0];
  console.log("Now loading story " + storyToLoad.getAttribute("id")); // debug statement
  return storyToLoad.getAttribute("id");
}