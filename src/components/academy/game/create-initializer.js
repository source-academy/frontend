import { LINKS } from '../../../utils/constants'
import { history } from '../../../utils/history'

export default function (StoryXMLPlayer, story, username, attemptedAll) {
  function saveToServer() { }

  function loadFromServer() { }

  var hookHandlers = {
    startMission: function (number) {
      console.log('startMission: ' + number)
      const assessmentType = story.split('-')[0] + 's'
      return history.push('/academy/' + assessmentType)
      // TODO: Reimplement redirection to actual assessment rather than the
      //       listing, after story.xml files have been changed. Currently, the
      //       story xml number points to the mission number, but the
      //       assessment id we obtain and therefore organise our assessments
      //       by refers to the database table ID
      // return history.push('/academy/' + assessmentType + '/' + number)
    },
    openTemplate: function (name) {
      switch (name) {
        case 'textbook':
          return window.open(LINKS.TEXTBOOK, '_blank');
        case 'announcements':
          return window.open(LINKS.LUMINUS);
        case 'lesson_plan':
          return history.push('/academy/missions');
        case 'students':
          return history.push(LINKS.PIAZZA);
        case 'materials':
          return window.open(LINKS.LUMINUS);
        case 'IDE':
          return history.push('/playground');
        case 'path':
          return history.push('/academy/paths');
        default:
          return window.open(LINKS.LUMINUS);
      }
    },
    pickUpCollectible: function (collectible) {
      if (typeof Storage !== 'undefined') {
        localStorage.setItem(collectible, 'collected');
      }
    },
    playSound: function (name) {
      var sound = new Audio(ASSETS_HOST + 'sounds/' + name + '.mp3');
      if (sound) {
        sound.play();
      }
    }
  };

  function openWristDevice() {
    window.open(LINKS.LUMINUS);
  }

  function startGame(div, canvas, saveData) {
    saveData = saveData || loadFromServer();
    StoryXMLPlayer.init(div, canvas, {
      saveData: saveData,
      hookHandlers: hookHandlers,
      saveFunc: saveToServer,
      wristDeviceFunc: openWristDevice,
      playerName: username,
      playerImageCanvas: $('<canvas />'),
      changeLocationHook: function (newLocation) {
        if (typeof Storage !== 'undefined') {
          // Code for localStorage/sessionStorage.
          localStorage.cs1101s_source_academy_location = newLocation;
        }
      }
    });
  }

  function initialize(div, canvas) {
    startGame(div, canvas);

    let storyId;
    let loadFromLocal;

    storyId = prompt("Please enter storyID here or leave blank for system default story:");
    if (storyId === null || !storyId.replace(/\s/g, '').length) {
      //storyId is null or only contains whitespace
      storyId = story;
      loadFromLocal = false;
    } else {
      loadFromLocal = confirm("Do you want to load " + storyId + ".story.xml from your local device?");
    }

    if (loadFromLocal) {
      alert("Please ensure that storyxml_server is serving on localhost port 8088.");
    } else {
      alert("Downloading " + storyId + ".story.xml from Bitbucket repository...");
    }
    StoryXMLPlayer.loadStory(storyId, loadFromLocal, function () { });
  }

  return initialize;
};
