import { GameCheckpoint } from '../chapter/GameChapterTypes';
import GameMap from '../location/GameMap';
import {
  crashSiteImg,
  classRoomImg,
  emergencyImg,
  hallwayImg,
  studentRoomImg
} from '../location/GameMapConstants';
import { GameMode } from '../mode/GameModeTypes';
import { GameLocation, GameLocationAttr } from '../location/GameMapTypes';
import { AssetKey, ImageAsset } from '../commons/CommonsTypes';
import GameObjective from '../objective/GameObjective';
import { Character, CharacterPosition } from '../character/GameCharacterTypes';
import { Constants, screenSize } from '../commons/CommonConstants';
import { BBoxProperty } from '../boundingBoxes/GameBoundingBoxTypes';
import { ObjectProperty } from '../objects/GameObjectTypes';
import { GameActionType, GameAction } from '../action/GameActionTypes';
import { GameStateStorage } from '../state/GameStateTypes';
import { PartName, DialogueLine, Dialogue } from '../dialogue/GameDialogueTypes';

const LocationSelectMap = new GameMap();

const gameLocations: GameLocation[] = [
  {
    id: 'crashsite',
    name: 'Crash Site',
    modes: [GameMode.Talk, GameMode.Move],
    assetKey: crashSiteImg.key
  },
  {
    id: 'classroom',
    name: 'Class Room',
    modes: [GameMode.Explore, GameMode.Talk, GameMode.Move],
    assetKey: classRoomImg.key
  },
  {
    id: 'emergency',
    name: 'Emergency',
    modes: [GameMode.Talk, GameMode.Move],
    assetKey: emergencyImg.key
  },
  {
    id: 'hallway',
    name: 'Hallway',
    modes: [GameMode.Move],
    assetKey: hallwayImg.key
  },
  {
    id: 'room',
    name: 'Student Room',
    modes: [GameMode.Explore, GameMode.Move, GameMode.Talk],
    assetKey: studentRoomImg.key
  }
];

const locationImages: ImageAsset[] = [
  crashSiteImg,
  classRoomImg,
  emergencyImg,
  hallwayImg,
  studentRoomImg
];
gameLocations.forEach(location => LocationSelectMap.addLocation(location.id, location));

const bboxStudentRoom: BBoxProperty = {
  x: 300,
  y: 300,
  width: 200,
  height: 200,
  interactionId: 'bboxStudentClassRoom',
  isInteractive: true
};

const bboxClassRoom: BBoxProperty = {
  x: 960,
  y: 540,
  width: 200,
  height: 100,
  interactionId: 'bboxClassRoom',
  isInteractive: true
};

const doorObjProp: ObjectProperty = {
  assetKey: 'door',
  x: screenSize.x / 2,
  y: screenSize.y / 2,
  isInteractive: true,
  interactionId: 'doorStudentRoom'
};

// Register mapping and assets
locationImages.forEach(asset => LocationSelectMap.addMapAsset(asset.key, asset.path));

// Register navigation
LocationSelectMap.setNavigationFrom('classroom', ['crashsite', 'hallway']);
LocationSelectMap.setNavigationFrom('crashsite', ['classroom']);
LocationSelectMap.setNavigationFrom('hallway', ['classroom', 'room', 'emergency']);
LocationSelectMap.setNavigationFrom('room', ['hallway']);
LocationSelectMap.setNavigationFrom('emergency', ['hallway']);

// Add bounding boxes
LocationSelectMap.addItemToMap(
  GameLocationAttr.boundingBoxes,
  bboxStudentRoom.interactionId,
  bboxStudentRoom
);
LocationSelectMap.addItemToMap(
  GameLocationAttr.boundingBoxes,
  bboxClassRoom.interactionId,
  bboxClassRoom
);

// Add object
LocationSelectMap.addItemToMap(GameLocationAttr.objects, doorObjProp.interactionId, doorObjProp);

// Set object
LocationSelectMap.setItemAt('room', GameLocationAttr.objects, doorObjProp.interactionId);

// Set explore bounding boxes
LocationSelectMap.setItemAt('room', GameLocationAttr.boundingBoxes, bboxStudentRoom.interactionId);
LocationSelectMap.setItemAt(
  'classroom',
  GameLocationAttr.boundingBoxes,
  bboxClassRoom.interactionId
);

// Set talk topics
LocationSelectMap.setItemAt('room', GameLocationAttr.talkTopics, 'dialogue1');
LocationSelectMap.setItemAt('crashsite', GameLocationAttr.talkTopics, 'dialogue2');
LocationSelectMap.setItemAt('classroom', GameLocationAttr.talkTopics, 'dialogue1');
LocationSelectMap.setItemAt('emergency', GameLocationAttr.talkTopics, 'dialogue2');
LocationSelectMap.setItemAt('emergency', GameLocationAttr.talkTopics, 'dialogue1');

//Preload assets
LocationSelectMap.addMapAsset('beathappy', Constants.assetsFolder + '/avatars/beat/beat.happy.png');
LocationSelectMap.addMapAsset('beatsad', Constants.assetsFolder + '/avatars/beat/beat.sad.png');
LocationSelectMap.addMapAsset(
  'scottsad',
  Constants.assetsFolder + '/avatars/scottie/scottie.sad.png'
);
LocationSelectMap.addMapAsset(
  'scotthappy',
  Constants.assetsFolder + '/avatars/scottie/scottie.happy.png'
);
LocationSelectMap.addMapAsset(
  doorObjProp.assetKey,
  Constants.assetsFolder + '/avatars/door/door.normal.png'
);

// Add characters
const beatExpressionMap = new Map<string, AssetKey>();
beatExpressionMap.set('sad', 'beatsad');
beatExpressionMap.set('happy', 'beathappy');
const beat: Character = {
  id: 'beat',
  name: 'Beat Ya',
  expressions: beatExpressionMap,
  defaultPosition: CharacterPosition.Right,
  defaultExpression: 'sad'
};

const scottExpressionMap = new Map<string, AssetKey>();
scottExpressionMap.set('sad', 'scottsad');
scottExpressionMap.set('happy', 'scotthappy');

const scottie: Character = {
  id: 'scottie',
  name: 'Scottie Boi',
  expressions: scottExpressionMap,
  defaultPosition: CharacterPosition.Middle,
  defaultExpression: 'happy'
};

LocationSelectMap.addItemToMap(GameLocationAttr.characters, beat.id, beat);
LocationSelectMap.addItemToMap(GameLocationAttr.characters, scottie.id, scottie);

// Set characters
LocationSelectMap.setItemAt('emergency', GameLocationAttr.characters, beat.id);
LocationSelectMap.setItemAt('room', GameLocationAttr.characters, scottie.id);

// Set Objectives
const objectives = new GameObjective();
objectives.addObjectives(['Visit Hallway', 'Talk At Classroom']);

const LocationSelectChapter: GameCheckpoint = {
  map: LocationSelectMap,
  startingLoc: 'room',
  objectives: objectives
};

// Create actions
const gameActions: GameAction[] = [
  {
    interactionId: 'cookieAction',
    actionType: GameActionType.Collectible,
    actionParams: { id: 'cookies' },
    isInteractive: false,
    actionConditions: [],
    repeatable: false
  },
  {
    interactionId: 'trophyAction',
    actionType: GameActionType.Collectible,
    actionParams: { id: 'cookies' },
    isInteractive: false,
    actionConditions: [],
    repeatable: false
  },
  {
    interactionId: 'awardHartinAction',
    actionType: GameActionType.Collectible,
    actionParams: { id: 'hartinPoster' },
    actionConditions: [
      {
        state: GameStateStorage.UserState,
        conditionParams: { listName: 'collectibles', id: 'trophy' }
      }
    ],
    isInteractive: false,
    repeatable: false
  },
  {
    interactionId: 'addCarpetAction',
    actionType: GameActionType.UpdateChecklist,
    actionParams: { id: 'carpet' },
    isInteractive: false,
    actionConditions: [],
    repeatable: false
  },
  {
    interactionId: 'changeLocationAction',
    actionType: GameActionType.LocationChange,
    actionParams: { id: 'Emergency' },
    isInteractive: false,
    actionConditions: [],
    repeatable: false
  }
];

// Add actions
gameActions.forEach(gameAction =>
  LocationSelectMap.addItemToMap(GameLocationAttr.actions, gameAction.interactionId, gameAction)
);

// Create Dialogues
const DialogueObject1 = new Map<PartName, DialogueLine[]>();
DialogueObject1.set('part1', [
  {
    line: "How's it going?",
    speakerDetail: {
      speakerId: 'beat',
      expression: 'happy',
      speakerPosition: CharacterPosition.Right
    },
    actionIds: [gameActions[0].interactionId]
  },
  {
    line: 'It is time for Kepler'
  },
  {
    line: 'You have just completed the Carpet checklist ',
    speakerDetail: null,
    actionIds: [gameActions[3].interactionId]
  },
  {
    line: 'How many years was it because it certainly feels like a thousand years'
  },
  {
    line: "Hi, I'm Scottie, the Scottish alien",
    speakerDetail: {
      speakerId: 'beat',
      expression: 'happy',
      speakerPosition: CharacterPosition.Right
    },
    goto: 'part2'
  }
]);

DialogueObject1.set('part2', [
  {
    line: 'Hi this is part2, are you still interested?'
  },
  {
    line: "The Earth that you've inhabited has been destroyed by a comet."
  },
  {
    line: "Here's a jar of cookies to help you feel better",
    actionIds: ['11']
  },
  {
    line: 'Let me lead you to the classroom',
    actionIds: [gameActions[4].interactionId]
  },
  {
    line: "Woops, I can't as we are in the middle of a dialogue"
  }
]);

export const dialogue1: Dialogue = {
  title: 'What happened?',
  content: DialogueObject1
};

export const dialogue2: Dialogue = {
  title: 'Are you sure?',
  content: DialogueObject1
};

// Add dialogues
LocationSelectMap.addItemToMap(GameLocationAttr.talkTopics, 'dialogue1', dialogue1);
LocationSelectMap.addItemToMap(GameLocationAttr.talkTopics, 'dialogue2', dialogue2);

export default LocationSelectChapter;
