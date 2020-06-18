import { GameMode } from '../mode/GameModeTypes';
import { ItemId, AssetKey } from '../commons/CommonsTypes';

export type LocationId = string;

export type GameLocation = {
  id: LocationId;
  name: string;
  assetKey: string;
  modes?: GameMode[];
  navigation?: LocationId[];
  talkTopics?: ItemId[];
  objects?: ItemId[];
  boundingBoxes?: ItemId[];
  bgmKey?: AssetKey;
};

export enum GameLocationAttr {
  navigation = 'navigation',
  talkTopics = 'talkTopics',
  objects = 'objects',
  boundingBoxes = 'boundingBoxes',
  characters = 'characters',
  actions = 'actions',
  bgmKey = 'bgmKey'
}
