export default function (StoryXMLPlayer, story, username, attemptedAll) {
  function saveToServer() { }

  function loadFromServer() { }

  var hookHandlers = {
    startMission: function (number) {
      document.getElementById('attempt').click()
    },
    openTemplate: function (name) {
      var renamed = name;
      if (name === 'textbook') {
        window.open('https://www.comp.nus.edu.sg/~cs1101s/sicp/', '_blank');
        return;
      }
      if (!name) {
        renamed = '/inbox/feed';
      } else if (name === 'announcements') {
        renamed = '/inbox/announcements';
      } else if (name === 'lesson_plan') {
        renamed = '/journal';
      } else if (name === 'students') {
        renamed = '/status';
      } else if (name === 'materials') {
        renamed = '/materials';
      } else if (name === 'IDE') {
        renamed = '/playground';
      } else if (name === 'path') {
        renamed = '/journal?tab=Paths';
      }
      location.replace(renamed)
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
    window.location.replace('/inbox/feed');
  }

  function startGame(container, saveData) {
    saveData = saveData || loadFromServer();
    StoryXMLPlayer.init(container, {
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

  function initialize() {
    startGame($('#game-display'));
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
