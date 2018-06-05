import { history } from '../../utils/history'

export default function (StoryXMLPlayer, story, username, attemptedAll) {
  function saveToServer() { }

  function loadFromServer() { }

  var hookHandlers = {
    startMission: function (number) {
      document.getElementById('attempt').click()
    },
    openTemplate: function (name) {
      switch (name) {
        case 'textbook':
          return window.open('https://www.comp.nus.edu.sg/~cs1101s/sicp/', '_blank');
        case 'announcements':
          return history.push('/device/announcements');
        case 'lesson_plan':
          return history.push('/device/missions');
        case 'students':
          return history.push('/device/profile');
        case 'materials':
          return history.push('/device/materials');
        case 'IDE':
          return history.push('/playground');
        case 'path':
          return history.push('/device/paths');
        default:
          return history.push('/device/announcements');
      }
    },
    pickUpCollectible: function () { },
    playSound: function (name) {
      var sound = new Audio(ASSETS_HOST + 'sounds/' + name + '.mp3');
      if (sound) {
        sound.play();
      }
    }
  };

  function openWristDevice() {
    history.push('/device/announements')
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
    var willPlayOpening = !attemptedAll;
    var savedLocation;
    if (typeof Storage !== 'undefined') {
      // Code for localStorage/sessionStorage.
      savedLocation = localStorage.cs1101s_source_academy_location;
    }
    if (story === 'contest-3.3') {
      alert('Next contest: 3D Rune')
    } else if (story === 'mission-1') {
      StoryXMLPlayer.loadStory('spaceship', function () {
        StoryXMLPlayer.loadStory('mission-1', function () { })
      })
    } else if (willPlayOpening) {
      StoryXMLPlayer.loadStory(story, function () { }, savedLocation);
    } else {
      StoryXMLPlayer.loadStoryWithoutFirstQuest(story, function () { }, savedLocation)
    }
  }

  return initialize;
};
