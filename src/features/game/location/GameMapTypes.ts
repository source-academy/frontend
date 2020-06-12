import { DialogueId, BBoxId, ObjectId, ItemId } from '../commons/CommonsTypes';
import { GameMode } from '../mode/GameModeTypes';

export type GameItemType<T> = {
  listName: string;
  emptyMap: Map<ItemId, T>;
};

export type GameLocation = {
  name: string;
  assetKey: string;
  assetXPos: number;
  assetYPos: number;
  modes?: GameMode[];
  talkTopics?: DialogueId[];
  objects?: ObjectId[];
  boundingBoxes?: BBoxId[];
};
