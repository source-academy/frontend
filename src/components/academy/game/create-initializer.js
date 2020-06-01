import {LINKS} from '../../../utils/constants'
import {history} from '../../../utils/history'
import {soundPath, LOCATION_KEY} from './constants/constants'
import {fetchGameData, getMissionPointer, getStudentData, saveCollectible, saveQuest} from './backend/game-state'

export default function (StoryXMLPlayer, username, userStory, gameState, missions) {

    var hookHandlers = {
        startMission: function () {
            return history.push('/academy/missions');
        },
        startQuest: function () {
            return history.push('/academy/quests');
        },
        openTemplate: function (name) {
            switch (name) {
                case 'textbook':
                    return window.open(LINKS.TEXTBOOK, '_blank');
                case 'announcements':
                    return window.open(LINKS.LUMINUS);
                case 'assessments':
                    return history.push('/academy/missions');
                case 'forum':
                    return window.open(LINKS.PIAZZA);
                case 'materials':
                    return history.push('/material');
                case 'IDE':
                    return history.push('/playground');
                case 'path':
                    return history.push('/academy/paths');
                case 'sourcecast':
                    return history.push('/sourcecast');
                case 'about':
                    return history.push('/contributors');
                default:
                    return window.open(LINKS.LUMINUS);
            }
        },
        pickUpCollectible: saveCollectible,
        playSound: function (name) {
            var sound = new Audio(soundPath + name + '.mp3');
            if (sound) {
                sound.play();
            }
        },
        saveCompletedQuest: saveQuest
    };

    function openWristDevice() {
        window.open(LINKS.LUMINUS);
    }

    function startGame(div, canvas) {
        StoryXMLPlayer.init(div, canvas, {
            hookHandlers: hookHandlers,
            wristDeviceFunc: openWristDevice,
            playerName: username,
            playerImageCanvas: $('<canvas />'),
            changeLocationHook: function (newLocation) {
                if (typeof Storage !== 'undefined') {
                    // Code for localStorage/sessionStorage.
                    localStorage.setItem(LOCATION_KEY, newLocation);
                }
            }
        });
    }

    function initialize(story, div, canvas) {
        startGame(div, canvas);
        StoryXMLPlayer.loadStory(story, function () {});
    }

    return (div, canvas) => fetchGameData(userStory, gameState, missions, (story) => initialize(story, div, canvas));
};
