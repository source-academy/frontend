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
import { ImageAsset, AssetKey } from '../commons/CommonsTypes';
import GameObjective from '../objective/GameObjective';
import { dialogue1, dialogue2 } from './Factory';
import { Character } from '../character/GameCharacterTypes';
import { Constants, screenSize } from '../commons/CommonConstants';
import { CharacterPosition } from '../character/GameCharacterConstants';
import { BBoxProperty } from '../boundingBoxes/GameBoundingBoxTypes';
import { ObjectProperty } from '../objects/GameObjectTypes';

const LocationSelectMap = new GameMap();

// Sample Map, arbritary set up
const locationImages: ImageAsset[] = [
  crashSiteImg,
  classRoomImg,
  emergencyImg,
  hallwayImg,
  studentRoomImg
];

const locationNames: string[] = [
  'Crash Site',
  'Class Room',
  'Emergency',
  'Hallway',
  'Student Room'
];

const locationModes: GameMode[][] = [
  [GameMode.Talk, GameMode.Move],
  [GameMode.Explore, GameMode.Talk, GameMode.Move],
  [GameMode.Talk, GameMode.Move],
  [GameMode.Move],
  [GameMode.Explore, GameMode.Move, GameMode.Talk]
];

const locations: GameLocation[] = new Array<GameLocation>();
for (let i = 0; i < locationImages.length; i++) {
  locations.push({
    name: locationNames[i],
    assetKey: locationImages[i].key,
    modes: locationModes[i]
  });
}

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
locations.forEach(location => LocationSelectMap.addLocation(location.name, location));
locationImages.forEach(asset => LocationSelectMap.addMapAsset(asset.key, asset.path));

// Register navigation
LocationSelectMap.setNavigationFrom('Class Room', ['Crash Site', 'Hallway']);
LocationSelectMap.setNavigationFrom('Crash Site', ['Class Room']);
LocationSelectMap.setNavigationFrom('Hallway', ['Class Room', 'Student Room', 'Emergency']);
LocationSelectMap.setNavigationFrom('Student Room', ['Hallway']);
LocationSelectMap.setNavigationFrom('Emergency', ['Hallway']);

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
LocationSelectMap.setItemAt('Student Room', GameItemTypeDetails.Object, doorObjProp.interactionId);

// Set explore bounding boxes
LocationSelectMap.setItemAt(
  'Student Room',
  GameItemTypeDetails.BBox,
  bboxStudentRoom.interactionId
);
LocationSelectMap.setItemAt('Class Room', GameItemTypeDetails.BBox, bboxClassRoom.interactionId);

// Set talk topics
LocationSelectMap.setItemAt('Student Room', GameItemTypeDetails.Dialogue, 'dialogue1');
LocationSelectMap.setItemAt('Crash Site', GameItemTypeDetails.Dialogue, 'dialogue2');
LocationSelectMap.setItemAt('Class Room', GameItemTypeDetails.Dialogue, 'dialogue1');
LocationSelectMap.setItemAt('Emergency', GameItemTypeDetails.Dialogue, 'dialogue2');
LocationSelectMap.setItemAt('Emergency', GameItemTypeDetails.Dialogue, 'dialogue1');

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
LocationSelectMap.setItemAt('Emergency', GameItemTypeDetails.Character, beat.id);
LocationSelectMap.setItemAt('Student Room', GameItemTypeDetails.Character, scottie.id);

// Set Objectives
const objectives = new GameObjective();
objectives.addObjectives(['Visit Hallway', 'Talk At Classroom']);

const LocationSelectChapter: GameChapter = {
  map: LocationSelectMap,
  startingLoc: 'Student Room',
  objectives: objectives
};

export default LocationSelectChapter;
