import { GameChapter } from '../chapter/GameChapterTypes';
import GameMap from '../location/GameMap';
import {
  crashSiteImg,
  classRoomImg,
  emergencyImg,
  hallwayImg,
  studentRoomImg,
  GameItemTypeDetails
} from '../location/GameMapConstants';
import { GameMode } from '../mode/GameModeTypes';
import { GameLocation } from '../location/GameMapTypes';
import { AssetKey, ImageAsset } from '../commons/CommonsTypes';
import GameObjective from '../objective/GameObjective';
import { dialogue1, dialogue2 } from './Factory';
import { Character } from '../character/GameCharacterTypes';
import { Constants, screenSize } from '../commons/CommonConstants';
import { CharacterPosition } from '../character/GameCharacterConstants';
import { BBoxProperty } from '../boundingBoxes/GameBoundingBoxTypes';
import { ObjectProperty } from '../objects/GameObjectTypes';

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
LocationSelectMap.setNavigationFrom('hallway', ['classRoom', 'room', 'emergency']);
LocationSelectMap.setNavigationFrom('room', ['hallway']);
LocationSelectMap.setNavigationFrom('emergency', ['hallway']);

// Add dialogues
LocationSelectMap.addItemToMap(GameItemTypeDetails.Dialogue, 'dialogue1', dialogue1);
LocationSelectMap.addItemToMap(GameItemTypeDetails.Dialogue, 'dialogue2', dialogue2);

// Add bounding boxes
LocationSelectMap.addItemToMap(
  GameItemTypeDetails.BBox,
  bboxStudentRoom.interactionId,
  bboxStudentRoom
);
LocationSelectMap.addItemToMap(
  GameItemTypeDetails.BBox,
  bboxClassRoom.interactionId,
  bboxClassRoom
);

// Add object
LocationSelectMap.addItemToMap(GameItemTypeDetails.Object, doorObjProp.interactionId, doorObjProp);

// Set object
LocationSelectMap.setItemAt('room', GameItemTypeDetails.Object, doorObjProp.interactionId);

// Set explore bounding boxes
LocationSelectMap.setItemAt('room', GameItemTypeDetails.BBox, bboxStudentRoom.interactionId);
LocationSelectMap.setItemAt('classroom', GameItemTypeDetails.BBox, bboxClassRoom.interactionId);

// Set talk topics
LocationSelectMap.setItemAt('room', GameItemTypeDetails.Dialogue, 'dialogue1');
LocationSelectMap.setItemAt('crashsite', GameItemTypeDetails.Dialogue, 'dialogue2');
LocationSelectMap.setItemAt('classroom', GameItemTypeDetails.Dialogue, 'dialogue1');
LocationSelectMap.setItemAt('emergency', GameItemTypeDetails.Dialogue, 'dialogue2');
LocationSelectMap.setItemAt('emergency', GameItemTypeDetails.Dialogue, 'dialogue1');

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

LocationSelectMap.addItemToMap(GameItemTypeDetails.Character, beat.id, beat);
LocationSelectMap.addItemToMap(GameItemTypeDetails.Character, scottie.id, scottie);

// Set characters
LocationSelectMap.setItemAt('emergency', GameItemTypeDetails.Character, beat.id);
LocationSelectMap.setItemAt('room', GameItemTypeDetails.Character, scottie.id);

// Set Objectives
const objectives = new GameObjective();
objectives.addObjectives(['Visit Hallway', 'Talk At Classroom']);

const LocationSelectChapter: GameChapter = {
  map: LocationSelectMap,
  startingLoc: 'room',
  objectives: objectives
};

export default LocationSelectChapter;
