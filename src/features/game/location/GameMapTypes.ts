import { IGameActionable } from '../action/GameActionTypes';
import { AssetKey, ItemId } from '../commons/CommonTypes';
import { GameMode } from '../mode/GameModeTypes';

/**
 * @typedef {string} LocationId - id that identifies a location
 */
export type LocationId = string;

/**
 * @typedef {LocationId | ItemId} AnyId - a general id type for a location or any object id
 */
export type AnyId = LocationId | ItemId;

/**
 * @typedef {GameLocation} - encapsulates data about a location in a GameMap
 * @prop {ItemId[]} actionIds - ids of all actions that play when that location is visited
 * @prop {LocationId} id - the id to indentify that location
 * @prop {string} name - the name of the location as shown in the Move Menu
 * @prop {AssetKey} assetKey - the asset key for the background image of the location
 * @prop {Set<GameMode>} modes - the game modes that are available in the location
 * @prop {Set<ItemId>} talkTopics - the dialogue id of topics that players can talk about in Talk menu of that location
 * @prop {Set<ItemId>} objects - the object id of objects rendered in the location
 * @prop {Set<ItemId>} boundingBoxes - the id of the bounding boxes (invisible rectangles) in that location
 * @prop {AssetKey} bgmKey - the asset key of background music being played in that location
 */
export type GameLocation = IGameActionable & {
  id: LocationId;
  name: string;
  assetKey: AssetKey;
  previewKey: AssetKey | null;
  modes: Set<GameMode>;
  navigation: Set<LocationId>;
  talkTopics: Set<ItemId>;
  objects: Set<ItemId>;
  boundingBoxes: Set<ItemId>;
  bgmKey: AssetKey;
  characters: Set<ItemId>;
};

export enum GameItemType {
  navigation = 'navigation',
  locations = 'locations',
  talkTopics = 'talkTopics',
  dialogues = 'dialogues',
  objects = 'objects',
  boundingBoxes = 'boundingBoxes',
  characters = 'characters',
  actions = 'actions',
  bgmKey = 'bgmKey',
  collectibles = 'collectibles',
  quizzes = 'quizzes'
}
