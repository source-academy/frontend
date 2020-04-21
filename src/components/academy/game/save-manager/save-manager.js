import {saveStudentData} from '../backend/game-state';
import {saveDataKey} from "../constants/constants";

var LocationManager = require('../location-manager/location-manager.js');
var QuestManager = require('../quest-manager/quest-manager.js');
var StoryManager = require('../story-manager/story-manager.js');
var MapManager = require('../map-manager/map-manager.js');
var QuestManager = require('../quest-manager/quest-manager.js');
var ObjectManager = require('../object-manager/object-manager.js');
var Utils = require('../utils/utils.js');

var actionSequence = [];

// finds existing save data, which consists of action sequence and starting location
export function init() {
  let saveData = localStorage.getItem(saveDataKey);
  if (saveData) {
    saveData = JSON.parse(saveData);
    actionSequence = saveData.actionSequence;
    var storyXMLs = [];
    for (var i = 0; i < actionSequence.length; i++) {
      if (actionSequence[i].type == 'loadStory') {
        storyXMLs.push(actionSequence[i].storyId);
      }
    }

    //callback wasn't being used, but was required in location manager
    // Made it an empty function
    let callback = () => {};

    StoryManager.loadStoryXML(storyXMLs, false, function() {
      LocationManager.changeStartLocation(saveData.startLocation);
      if (hasPending()) {
        var secondLast = actionSequence[actionSequence.length - 2];
        if (secondLast.type == 'loadStory') {
          StoryManager.unlockFirstQuest(
            secondLast.storyId,
            LocationManager.verifyGotoStart(callback)
          );
        } else if (secondLast.type == 'unlockQuest') {
          QuestManager.playOpening(
            secondLast.storyId,
            secondLast.questId,
            LocationManager.verifyGotoStart(callback)
          );
        } else {
          unmarkPending();
          LocationManager.verifyGotoStart(callback)();
          console.error('something wrong with pending');
        }
      } else {
        LocationManager.verifyGotoStart(callback)();
      }
    });
  }
};

// pending means a story is loaded but the opening quest is not unlocked yet
// or a quest is unlocked but the opening sequence hasn't been played
function markPending() {
  actionSequence.push({ type: 'pending' });
}

export function unmarkPending() {
  var last = actionSequence.pop();
  if (last.type !== 'pending') {
    console.error('The pending logic is wrong');
  }
  saveGame();
}

export function hasPending() {
  return actionSequence[actionSequence.length - 1].type === 'pending';
}

export function removeActions(filters, willUpdate) {
  var properties = Object.keys(filters);
  var newActionSequence = [];
  for (var i = 0; i < actionSequence.length; i++) {
    var willCopy = false;
    for (var j = 0; j < properties.length; j++) {
      var property = properties[j];
      if (actionSequence[i][property] != filters[property]) {
        willCopy = true;
        break;
      }
    }
    if (willCopy) {
      newActionSequence.push(actionSequence[i]);
    }
  }
  actionSequence = newActionSequence;
  if (willUpdate) {
    updateGameMap();
  }
  saveGame();
}

export function saveUnlockQuest(storyId, questId) {
  actionSequence.push({
    type: 'unlockQuest',
    storyId: storyId,
    questId: questId
  });
  markPending();
  saveGame();
}

export function saveLoadStories(stories) {
  stories.forEach(function(storyId) {
    actionSequence.push({ type: 'loadStory', storyId: storyId });
  });
  markPending();
  saveGame();
}

// saves actionsequence and start location into local storage
function saveGame() {
  localStorage.setItem(saveDataKey,
    JSON.stringify({
      actionSequence: actionSequence,
      startLocation: LocationManager.getStartLocation()
    })
  );
}

export function updateGameMap() {
  // a rather expensive operation
  // using naive solution
  MapManager.clearMap();
  for (var i = 0; i < actionSequence.length; i++) {
    var action = actionSequence[i];
    if (action.type == 'loadStory') {
      var story = StoryManager.getLoadedStory(action.storyId);
      if (!story) {
        console.error('story ' + action.storyId + ' is not loaded yet');
        return;
      }
      if (story.children[0] && story.children[0].tagName == 'MAP') {
        MapManager.processMap(story.children[0]);
      }
    } else if (action.type == 'unlockQuest') {
      QuestManager.activateQuest(action.storyId, action.questId);
    } else if (action.type == 'seeDisplayOnceSequence') {
      MapManager.getGameLocation(action.locationName).sequence = null;
    } else if (action.type == 'clickTempObject') {
      ObjectManager.removeTempObject(action.storyId, action.objectId);
    }
  }
}

export function saveSeeDisplayOnceSeq(node, locName) {
  if (node.tagName != 'SEQUENCE') {
    return;
  }
  var storyAncestor = Utils.getStoryAncestor(node);
  var action = {
    type: 'seeDisplayOnceSequence',
    locationName: locName,
    storyId: storyAncestor.id
  };
  var quest = node.parentNode.parentNode.parentNode;
  if (quest.tagName == 'QUEST') {
    action.questId = quest.id;
  }
  actionSequence.push(action);
  saveGame();
}

export function saveClickTempObject(node, storyId) {
  if (node.tagName != 'TEMP_OBJECT') {
    return;
  }
  var action = { type: 'clickTempObject', storyId: storyId, objectId: node.id };
  if (node.parentElement.parentElement.parentElement.tagName == 'QUEST') {
    action.questId = node.parentElement.parentElement.parentElement.id;
  }
  actionSequence.push(action);
  saveGame();
}
