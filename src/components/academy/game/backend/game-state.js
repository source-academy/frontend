import {storyXMLPath} from '../constants/constants'

/**
 * Handles data regarding the game state. 
 * - The student's list of completed quests
 * - The student's current story mission
 * - The global list of missions that are open
 */

let fetched = false;
export function fetchGameData(callback) {
  // fetch only needs to be called once; if there are additional calls somehow then ignore them
  if(fetched) {
    callback();
    return;
  }
  fetched = true;
  const toFetch = [
    fetchCompletedQuests,
    fetchStudentMissionPointer,
    fetchGlobalMissionPointer
  ];
  let remaining = toFetch.length;
  // does nothing until the last fetch is completed
  const innerCallback = () => (--remaining === 0) ? callback() : undefined;
  toFetch.map(x => x(innerCallback));
}

function fetchCompletedQuests(callback) {
  // placeholder
  callback();
}

export function getCompletedQuests() {
  // placeholder
  return null;
}

function fetchStudentMissionPointer(callback) {
  // placeholder
  callback();
}

function getStudentMissionPointer() {
  // placeholder
  return 10;
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
      loadingOverlay.visible = false;
      console.error('Cannot find master story list');
    }
  }).then(() => {
    const now = new Date();
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