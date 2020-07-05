import { ImageAsset } from '../commons/CommonsTypes';
import { GameLocation } from './GameMapTypes';

export const emptySet = new Set([]);

export const crashSiteImg: ImageAsset = {
  key: 'crash-site',
  path:
    'https://s3-ap-southeast-1.amazonaws.com/source-academy-assets/locations/crashSite/normal.png'
};

export const classRoomImg: ImageAsset = {
  key: 'class-room',
  path:
    'https://s3-ap-southeast-1.amazonaws.com/source-academy-assets/locations/classroom/classOn.png'
};

export const emergencyImg: ImageAsset = {
  key: 'emergency',
  path:
    'https://s3-ap-southeast-1.amazonaws.com/source-academy-assets/locations/classroom/emergency.png'
};

export const hallwayImg: ImageAsset = {
  key: 'hallway',
  path: 'https://s3-ap-southeast-1.amazonaws.com/source-academy-assets/locations/hallway/normal.png'
};

export const studentRoomImg: ImageAsset = {
  key: 'student-room',
  path:
    'https://s3-ap-southeast-1.amazonaws.com/source-academy-assets/locations/yourRoom-dim/normal.png'
};

export function createEmptyLocation(): GameLocation {
  return {
    id: '',
    name: '',
    assetKey: '',
    modes: new Set([]),
    navigation: new Set([]),
    talkTopics: new Set([]),
    objects: new Set([]),
    boundingBoxes: new Set([]),
    bgmKey: '',
    characters: new Set([])
  };
}
