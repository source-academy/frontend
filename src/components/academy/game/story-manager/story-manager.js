import * as PIXI from 'pixi.js'
import { isStudent } from '../backend/user.js';

var Constants = require('../constants/constants.js');
var QuestManager = require('../quest-manager/quest-manager.js');
var LocationManager = require('../location-manager/location-manager.js');
var SaveManager = require('../save-manager/save-manager.js');
var BlackOverlay = require('../black-overlay/black-overlay.js');
var SoundManager = require('../sound-manager/sound-manager.js');

var loadedStories = {};

var loadingOverlay;
var loadingText;

export function init() {
  loadingOverlay = new PIXI.Container();
  let blackOverlay = new PIXI.Graphics();
  blackOverlay.beginFill(0, 1);
  blackOverlay.drawRect(0, 0, Constants.screenWidth, Constants.screenHeight);
  blackOverlay.endFill();
  blackOverlay.hitArea = new PIXI.Rectangle(
    0,
    0,
    Constants.screenWidth,
    Constants.screenHeight
  );
  blackOverlay.interactive = true;
  blackOverlay.alpha = 0.8;
  loadingOverlay.addChild(blackOverlay);
  loadingText = new PIXI.Text('Loading...', {
    fontFamily: 'Arial',
    fontSize: 2 * Constants.fontSize,
    fill: 'white'
  });
  loadingText.anchor.set(0.5, 0.5);
  loadingText.position.set(
    Constants.screenWidth / 2,
    Constants.screenHeight / 2
  );
  loadingOverlay.addChild(loadingText);
  loadingOverlay.visible = false;

  return loadingOverlay;
};

export function getLoadedStory(storyId) {
  return loadedStories[storyId];
}

export function unlockFirstQuest(storyId, callback) {
  var story = loadedStories[storyId];
  if (!story) {
    return;
  }
  callback = callback || Constants.nullFunction;
  SaveManager.unmarkPending();
  var child = story.children[0];
  if (child && child.tagName == 'QUEST') {
    QuestManager.unlockQuest(storyId, child.id, callback);
  } else if (
    child.nextElementSibling &&
    child.nextElementSibling.tagName == 'QUEST'
  ) {
    QuestManager.unlockQuest(storyId, child.nextElementSibling.id, callback);
  } else {
    callback();
  }
}

export function loadStory(storyXML, callback, startLocation) {
  if (loadedStories[storyXML]) {
    return;
  }
  loadStoryXML([storyXML], true, function() {
    if (startLocation) {
      LocationManager.changeStartLocation(startLocation);
    }
    unlockFirstQuest(storyXML, LocationManager.verifyGotoStart(callback));
  });
}

export function loadStoryWithoutFirstQuest(storyXML, callback, startLocation) {
  if (loadedStories[storyXML]) {
    return;
  }
  loadStoryXML([storyXML], true, function() {
    if (startLocation) {
      LocationManager.changeStartLocation(startLocation);
    }
    LocationManager.verifyGotoStart(callback)();
  });
}

function processStory(story) {
  if (loadedStories[story.id]) {
    return;
  }
  loadedStories[story.id] = story;
  // process quests
  QuestManager.loadQuests(story);
}

export function loadStoryXML(storyXMLs, willSave, callback) {
  callback = callback || Constants.nullFunction;
  loadingOverlay.visible = true;
  var downloaded = {};
  var downloadRequestSent = {};
  var willBeDownloaded = storyXMLs.slice();
  var storyDependencies = {};
  // download all needed XML files
  function download(i, storyXMLs, callback) {
    if (i >= storyXMLs.length) {
      return;
    }
    // check whether this story has been downloaded or will be downloaded
    var curId = storyXMLs[i];
    if (loadedStories[curId] || downloadRequestSent[curId]) {
      download(i + 1, storyXMLs, callback);
      // } else if (loadingStories.indexOf(curId) !== -1) {
      //     throw new Error("Circular dependencies");
    } else {
      // download the story
      downloadRequestSent[curId] = true;
      const makeAjax = isTest => $.ajax({
        type: 'GET',
        url: (isTest ? Constants.storyXMLPathTest : Constants.storyXMLPathLive)
          + curId + '.story.xml',
        dataType: 'xml',
        success: function(xml) {
          var story = xml.children[0];
          downloaded[curId] = story;
          // check and load dependencies
          var dependencies = story.getAttribute('dependencies');
          var notDownloading = [];
          if (dependencies) {
            storyDependencies[curId] = dependencies.split(' ');
            notDownloading = storyDependencies[curId].filter(function(id) {
              return !loadedStories[id] && willBeDownloaded.indexOf(id) === -1;
            });
          } else {
            storyDependencies[curId] = [];
          }
          willBeDownloaded = willBeDownloaded.concat(notDownloading);
          if (notDownloading.length > 0) {
            download(0, notDownloading, callback);
          } else {
            // figure out whether all files have been downloaded
            var allRequestSent = willBeDownloaded.reduce(function(prev, cur) {
              return prev && downloadRequestSent[cur];
            }, true);
            if (
              allRequestSent &&
              Object.keys(downloaded).length == willBeDownloaded.length
            ) {
              callback();
            }
          }
        },
        error: isTest
          ? () => {
              console.log('Cannot find story ' + curId + ' on test');
              console.log('Trying on live...');
              makeAjax(false);
            }
          : () => {
            loadingOverlay.visible = false;
            console.error('Cannot find story ' + curId);
          }
      });
      makeAjax(!isStudent());
      download(i + 1, storyXMLs, callback);
    }
  }
  download(0, storyXMLs, function() {
    // figure out load order of dependencies
    var sorted = [];
    var visited = {};
    var visiting = {};
    function dfs(storyId) {
      if (visiting[storyId]) {
        throw new Error('Circular dependencies');
      } else if (!(loadedStories[storyId] || visited[storyId])) {
        visiting[storyId] = true;
        storyDependencies[storyId].forEach(dfs);
        visited[storyId] = true;
        visiting[storyId] = false;
        sorted.push(storyId);
      }
    }
    var index = 0;
    while (index < willBeDownloaded.length) {
      dfs(willBeDownloaded[index]);
      while (willBeDownloaded[index] && visited[willBeDownloaded[index]]) {
        index++;
      }
    }
    // load quests and assets
    var assetsToLoadTable = {};
    PIXI.loader.reset();
    sorted.forEach(function(storyId) {
      processStory(downloaded[storyId]);
      markAssetsToLoad(downloaded[storyId], assetsToLoadTable);
      SoundManager.markSoundsToLoad(downloaded[storyId]);
    });
    preloadAssets(assetsToLoadTable, function() {
      SoundManager.preloadSounds();
      if (willSave) {
        SaveManager.saveLoadStories(sorted);
      }
      SaveManager.updateGameMap();
      loadingOverlay.visible = false;
      callback();
    });
  });
}

export function closeStory(storyId, callback) {
  if (!loadedStories[storyId]) {
    return;
  }
  callback = callback || Constants.nullFunction;
  BlackOverlay.blackScreen(function() {
    loadedStories[storyId] = null;
    QuestManager.unloadQuests(storyId);
    SaveManager.removeActions({ storyId: storyId }, true);
    LocationManager.verifyCurCamLocation();
    LocationManager.goBackToCurCamLocation(callback);
  });
}

function preloadAssets(assetsToLoadTable, callback) {
  var assets = Object.keys(assetsToLoadTable);

  if (assets.length == 0) {
    callback();
  } else {
    for (var i = 0; i < assets.length; i++) {
      PIXI.loader.add(assets[i], assets[i]);
    }

    PIXI.loader.load(callback);
  }
}

function markAssetsToLoad(story, assetsToLoadTable) {
  var node;
  var resName;
  var i;
  var nodes = story.getElementsByTagName('LOCATION');
  for (i = 0; i < nodes.length; i++) {
    node = nodes[i];
    var name = node.getAttribute('name');
    var skin = node.getAttribute('skin') || 'normal';
    resName = Constants.locationPath + name + '/' + skin + '.png';
    if (!PIXI.utils.TextureCache[resName]) {
      assetsToLoadTable[resName] = true;
    }
  }
  nodes = story.getElementsByTagName('OBJECT');
  for (i = 0; i < nodes.length; i++) {
    node = nodes[i];
    var name = node.getAttribute('name');
    var skin = node.getAttribute('skin') || 'normal';
    resName = Constants.objectPath + name + '/' + skin + '.png';
    if (!PIXI.utils.TextureCache[resName]) {
      assetsToLoadTable[resName] = true;
    }
  }
  nodes = story.getElementsByTagName('TEMP_OBJECT');
  // same as normal object
  for (i = 0; i < nodes.length; i++) {
    node = nodes[i];
    var name = node.getAttribute('name');
    var skin = node.getAttribute('skin') || 'normal';
    resName = Constants.objectPath + name + '/' + skin + '.png';
    if (!PIXI.utils.TextureCache[resName]) {
      assetsToLoadTable[resName] = true;
    }
  }
  nodes = story.getElementsByTagName('IMAGE');
  for (i = 0; i < nodes.length; i++) {
    node = nodes[i];
    resName = Constants.imgPath + node.textContent;
    if (!PIXI.utils.TextureCache[resName]) {
      assetsToLoadTable[resName] = true;
    }
  }
  nodes = story.getElementsByTagName('SPEECH');
  for (i = 0; i < nodes.length; i++) {
    node = nodes[i];
    var speaker = node.getAttribute('speaker');
    var audience = node.getAttribute('audience');
    resName = Constants.avatarPath + speaker + '/sprites.json';
    if (speaker != 'you' && !PIXI.utils.TextureCache[resName]) {
      assetsToLoadTable[resName] = true;
    }
    if (audience && audience != 'you') {
      resName = Constants.avatarPath + audience + '/sprites.json';
      if (!PIXI.utils.TextureCache[resName]) {
        assetsToLoadTable[resName] = true;
      }
    }
  }
}
