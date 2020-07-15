import { GameLocation } from './GameMapTypes';

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
