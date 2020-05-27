import { isStudent } from './user';
import {
  OVERRIDE_DATES_KEY,
  OVERRIDE_PUBLISH_KEY,
  SESSION_DATA_KEY,
  hasBeenFetched
} from './gameState';
import SaveManager from '../saveManager/saveManager.js';

function getSessionData() {
  return JSON.parse(sessionStorage.getItem(SESSION_DATA_KEY));
}

function organiseMissions(missions) {
  function compareMissions(x, y) {
    //compares with opening dates first and if equal, compare closing dates.
    //sort by earliest date
    const openX = new Date(x.openAt).getTime();
    const openY = new Date(y.openAt).getTime();
    const closeX = new Date(x.closeAt).getTime();
    const closeY = new Date(y.closeAt).getTime();
    return openX === openY ? Math.sign(closeX - closeY) : Math.sign(openX - openY);
  }
  function isWithinDates(mission) {
    return new Date(mission.openAt) <= now && now <= new Date(mission.closeAt);
  }
  let predicate;
  const now = new Date(getSessionData().currentDate);
  if (isStudent()) {
    predicate = mission => mission.isPublished && isWithinDates(mission, now);
  } else {
    // resets current progress
    SaveManager.resetLocalSaveData();
    //testers will play unpublished missions too and can go out of bounds unless
    //they state that they don't want to in the json file, using the override keys
    predicate = mission => {
      let toPass = true;
      if (!sessionStorage.getItem(OVERRIDE_DATES_KEY)) {
        toPass = isWithinDates(mission, now);
      }
      if (!sessionStorage.getItem(OVERRIDE_PUBLISH_KEY)) {
        toPass = toPass && mission.isPublished;
      }
      return toPass;
    };
  }
  const sorted_missions = missions.sort(compareMissions);
  const remaining_missions = sorted_missions.filter(predicate);
  //if no more remaining missions, use the last remaining mission.
  return remaining_missions.length > 0
    ? remaining_missions
    : [sorted_missions[sorted_missions.length - 1]];
}

/**
 * Obtain the story mission to load. This will usually be the student's current mission pointer.
 * However, in the event the student's current mission pointer falls outside the bounds of the
 * global list of open missions, then the corresponding upper (or lower) bound will be used.
 */
export function getMissionPointer(missions) {
  // in the scenario with no missions
  if (missions == undefined) {
    return;
  }
  const sortedMissions = organiseMissions(missions);
  //finds the mission id's mission pointer
  let studentStory = getStudentStory();
  const isStoryEmpty = story => story === undefined || story.length === 0;
  let missionPointer = isStoryEmpty(studentStory)
    ? sortedMissions[0]
    : sortedMissions.find(mission => mission.story === studentStory);
  //if mission pointer is in localStorage and can't find any proper story.
  if (missionPointer === undefined && SaveManager.hasLocalSave()) {
    localStorage.removeItem(Constants.SAVE_DATA_KEY);
    studentStory = getStudentStory();
    missionPointer = isStoryEmpty(studentStory)
      ? sortedMissions[0]
      : sortedMissions.find(mission => mission.story === studentStory);
  }
  if (missionPointer === undefined) {
    missionPointer = sortedMissions[0];
  }
  return missionPointer && missionPointer.story;
}

function getStudentStory() {
  //tries to retrieve local version of story
  //if unable to find, use backend's version.
  //this is to prevent any jumps in story after student completes a mission
  if (SaveManager.hasLocalSave()) {
    let actionSequence = SaveManager.getLocalSaveData().actionSequence;
    let story = actionSequence[actionSequence.length - 1].storyID;
    return story;
  } else {
    return hasBeenFetched() ? getSessionData().story.story : undefined;
  }
}
