import { GameMode } from '../mode/GameModeTypes';
import { ItemId, AssetKey } from '../commons/CommonsTypes';
import { IGameActionable } from '../action/GameActionTypes';

export type LocationId = string;

export type GameLocation = IGameActionable & {
  id: LocationId;
  name: string;
  assetKey: string;
  modes?: GameMode[];
  navigation?: LocationId[];
  talkTopics?: ItemId[];
  objects?: ItemId[];
  boundingBoxes?: ItemId[];
  bgmKey?: AssetKey;
  collectibles?: ItemId[];
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
