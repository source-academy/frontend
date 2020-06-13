import { AssetKey, ItemId } from '../commons/CommonsTypes';
import { CharacterPosition } from './CharacterConstants';

export type Character = {
  name: string;
  expressions: Map<string, AssetKey>;
  defaultExpression: string;
  defaultPosition: CharacterPosition;
  actions?: string[];
};

export const emptyCharacterMap = new Map<ItemId, Character>();
