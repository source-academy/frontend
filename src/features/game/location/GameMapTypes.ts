import { GameImage, screenSize, DialogueId, ObjectId, BBoxId } from '../commons/CommonsTypes';
import { GameMode } from '../mode/GameModeTypes';
import { ObjectProperty } from '../objects/ObjectsTypes';
import { BBoxProperty } from '../boundingBoxes/BoundingBoxTypes';

export type GameLocation = {
  name: string;
  assetKey: string;
  assetXPos: number;
  assetYPos: number;
  modes?: GameMode[];
  talkTopics?: DialogueId[];
  objects?: Map<ObjectId, ObjectProperty>;
  boundingBoxes?: Map<BBoxId, BBoxProperty>;
};

export const crashSiteImg: GameImage = {
  key: 'crash-site',
  path:
    'https://s3-ap-southeast-1.amazonaws.com/source-academy-assets/locations/crashSite/normal.png',
  xPos: screenSize.x / 2,
  yPos: screenSize.y / 2,
  imageWidth: screenSize.x,
  imageHeight: screenSize.y
};

export const classRoomImg: GameImage = {
  key: 'class-room',
  path:
    'https://s3-ap-southeast-1.amazonaws.com/source-academy-assets/locations/classroom/classOn.png',
  xPos: screenSize.x / 2,
  yPos: screenSize.y / 2,
  imageWidth: screenSize.x,
  imageHeight: screenSize.y
};

export const emergencyImg: GameImage = {
  key: 'emergency',
  path:
    'https://s3-ap-southeast-1.amazonaws.com/source-academy-assets/locations/classroom/emergency.png',
  xPos: screenSize.x / 2,
  yPos: screenSize.y / 2,
  imageWidth: screenSize.x,
  imageHeight: screenSize.y
};

export const hallwayImg: GameImage = {
  key: 'hallway',
  path:
    'https://s3-ap-southeast-1.amazonaws.com/source-academy-assets/locations/hallway/normal.png',
  xPos: screenSize.x / 2,
  yPos: screenSize.y / 2,
  imageWidth: screenSize.x,
  imageHeight: screenSize.y
};

export const studentRoomImg: GameImage = {
  key: 'student-room',
  path:
    'https://s3-ap-southeast-1.amazonaws.com/source-academy-assets/locations/yourRoom-dim/normal.png',
  xPos: screenSize.x / 2,
  yPos: screenSize.y / 2,
  imageWidth: screenSize.x,
  imageHeight: screenSize.y
};
