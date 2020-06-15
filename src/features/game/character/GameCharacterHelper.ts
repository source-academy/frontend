import { Character } from './GameCharacterTypes';
import { ItemId } from '../commons/CommonsTypes';
import { characterPositionMap } from '../parser/DialogueParser';

export function createSpeaker(speakerId: string, expression: string, position: string) {
  return {
    speakerId,
    expression,
    speakerPosition: characterPositionMap[position]
  };
}

export const emptyCharacterMap = new Map<ItemId, Character>();
