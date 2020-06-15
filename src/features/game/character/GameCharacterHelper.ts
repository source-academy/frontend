import { Character } from './GameCharacterTypes';
import { characterPositionMap } from './GameCharacterConstants';
import { ItemId } from '../commons/CommonsTypes';

export function createSpeaker(speakerId: string, expression: string, position: string) {
  return {
    speakerId,
    expression,
    speakerPosition: characterPositionMap[position]
  };
}

export const emptyCharacterMap = new Map<ItemId, Character>();
