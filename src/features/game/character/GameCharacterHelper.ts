import { Character } from './GameCharacterTypes';
import { ItemId } from '../commons/CommonsTypes';
import { textToPositionMap } from '../parser/DialogueParser';

export function createSpeaker(speakerId: string, expression: string, position: string) {
  return {
    speakerId,
    expression,
    speakerPosition: textToPositionMap[position]
  };
}

export const emptyCharacterMap = new Map<ItemId, Character>();
