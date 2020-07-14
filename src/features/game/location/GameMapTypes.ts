import { IGameActionable } from '../action/GameActionTypes';
import { AssetKey, ItemId } from '../commons/CommonTypes';
import { GameMode } from '../mode/GameModeTypes';

export type LocationId = string;

export type GameLocation = IGameActionable & {
  id: LocationId;
  name: string;
  assetKey: string;
  modes: Set<GameMode>;
  navigation: Set<LocationId>;
  talkTopics: Set<ItemId>;
  objects: Set<ItemId>;
  boundingBoxes: Set<ItemId>;
  bgmKey: AssetKey;
  characters: Set<ItemId>;
};

export enum GameLocationAttr {
  navigation = 'navigation',
  talkTopics = 'talkTopics',
  objects = 'objects',
  boundingBoxes = 'boundingBoxes',
  characters = 'characters',
  actions = 'actions',
  bgmKey = 'bgmKey',
  collectibles = 'collectibles'
}
