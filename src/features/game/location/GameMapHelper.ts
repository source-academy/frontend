import { GameLocation } from './GameMapTypes';

/**
 * Intialises an an empty location
 */
export function createEmptyLocation(): GameLocation {
  return {
    id: '',
    name: '',
    assetKey: '',
    previewKey: null,
    modes: new Set([]),
    navigation: new Set([]),
    talkTopics: new Set([]),
    objects: new Set([]),
    boundingBoxes: new Set([]),
    bgmKey: '',
    characters: new Set([])
  };
}
