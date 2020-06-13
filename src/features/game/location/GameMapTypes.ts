import { GameMode } from '../mode/GameModeTypes';
import { ItemId } from '../commons/CommonsTypes';

export type GameItemType<T> = {
  listName: string;
  emptyMap: Map<ItemId, T>;
};

export type LocationId = string;

export type GameLocation = {
  name: string;
  assetKey: string;
  modes?: GameMode[];
  navigation?: LocationId[];
  talkTopics?: ItemId[];
  objects?: ItemId[];
  boundingBoxes?: ItemId[];
};

export enum GameLocationAttr {
  navigation = 'navigation',
  talkTopics = 'talkTopics',
  objects = 'objects',
  boundingBoxes = 'boundingBoxes'
}
