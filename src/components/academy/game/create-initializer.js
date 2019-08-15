import {LINKS} from '../../../utils/constants'
import {history} from '../../../utils/history'

export default function (StoryXMLPlayer, story, username, attemptedAll) {
    function saveToServer() {
    }

    function loadFromServer() {
    }

    var hookHandlers = {
        startMission: function (number) {
            const assessmentType = story.split('-')[0] + 's';
            // return history.push('/academy/' + assessmentType)
            return history.push('/academy/' + assessmentType + '/' + number);
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
                    return history.push(LINKS.PIAZZA);
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
        },
        saveCompletedQuest: function (questId) {
            if (typeof Storage !== 'undefined') {
                localStorage.setItem(questId, 'completed');
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
        const now = new Date();
        const mission_1_deployDate = new Date("August 16, 2019 12:00:00");
        if (mission_1_deployDate <= now) {
            StoryXMLPlayer.loadStory('mission-1', function () {});
        } else {
            StoryXMLPlayer.loadStory('act-1', function () {});
        }
    }

    return initialize;
};
