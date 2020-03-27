import {storyXMLPath} from '../constants/constants'

/**
 * Handles data regarding the game state. 
 * - The student's list of completed quests and collectibles
 * - The student's current story mission
 * - The global list of missions that are open
 */
let fetched = false;
let studentMissionPointer = undefined,
    studentData = undefined;
export function fetchGameData(userStory, callback) {
  // fetch only needs to be called once; if there are additional calls somehow then ignore them
  if(fetched) {
    callback();
    return;
  }
  fetched = true;
  studentMissionPointer = userStory.story;
  // not implemented yet
  studentData = undefined; // userStory.data;
  fetchGlobalMissionPointer(callback);
}

// overrides
let studentDataOverride = undefined,
    missionPointerOverride = undefined,
    currentDateOverride = undefined;
// override student game data
export function overrideStudentData(data) { studentDataOverride = data; }
// override student's current mission
export function overrideMissionPointer(data) { missionPointerOverride = data; }
// override current date (to determine active missions)
export function overrideCurrentDate(data) { currentDateOverride = data; }

export function getStudentData() {
  // formerly create-initializer/loadFromServer
  if(studentDataOverride) return studentDataOverride;
  return studentData;
}

export function saveStudentData(json) {
  // formerly create-initializer/saveToServer
  return json;
}

export function saveCollectible(collectible) {
  // currently local but we should eventually migrate to backend
  if (typeof Storage !== 'undefined') {
    localStorage.setItem(collectible, 'collected');
  }
}

export function saveQuest(questId) {
  // currently local but we should eventually migrate to backend
  if (typeof Storage !== 'undefined') {
    localStorage.setItem(questId, 'completed');
  }
}

function getStudentMissionPointer() {
  // placeholder
  if(missionPointerOverride) return missionPointerOverride;
  return studentMissionPointer;
}

let stories = [];

function fetchGlobalMissionPointer(callback) {
  $.ajax({
    type: 'GET',
    url: storyXMLPath + 'master.xml',
    dataType: 'xml',
    success: xml => {
      stories = Array.from(xml.children[0].children);
      stories = stories.sort((a, b) => parseInt(a.getAttribute("key")) - parseInt(b.getAttribute("key")));
    },
    error: () => {
      console.error('Cannot find master story list');
    }
  }).then(() => {
    const now = currentDateOverride ? currentDateOverride : new Date();
    const openStory = story => new Date(story.getAttribute("startDate")) < now && now < new Date(story.getAttribute("endDate"));
    stories = stories.filter(openStory);
    callback();
  });
}

/**
 * Obtain the story mission to load. This will usually be the student's current mission pointer.
 * However, in the event the student's current mission pointer falls outside the bounds of the
 * global list of open missions, then the corresponding upper (or lower) bound will be used.
 */
export function getMissionPointer() {
  let student = getStudentMissionPointer();
  const newest = parseInt(stories[stories.length-1].getAttribute("key")); // the newest mission to open
  const oldest = parseInt(stories[0].getAttribute("key")); // the oldest mission to open
  student = Math.min(student, newest);
  student = Math.max(student, oldest);
  const storyToLoad = stories.filter(story => story.getAttribute("key") == student)[0];
  console.log("Now loading story " + storyToLoad.getAttribute("id")); // debug statement
  return storyToLoad.getAttribute("id");
}