import { AssetKey, ItemId } from '../commons/CommonsTypes';
import { CharacterPosition, characterPositionMap } from './GameCharacterConstants';

export type SpeakerDetail = {
  speakerId: ItemId;
  expression: string;
  speakerPosition: CharacterPosition;
};

export type Character = {
  id: ItemId;
  name: string;
  expressions: Map<string, AssetKey>;
  defaultExpression: string;
  defaultPosition: CharacterPosition;
  actions?: string[];
};

export function createSpeaker(speakerId: string, expression: string, position: string) {
  return {
    speakerId,
    expression,
    speakerPosition: characterPositionMap[position]
  };
}
