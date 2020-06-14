import { CharacterPosition } from '../character/GameCharacterConstants';

const characterPositionMap = {
  left: CharacterPosition.Left,
  middle: CharacterPosition.Middle,
  right: CharacterPosition.Right
};

export function createSpeaker(speakerId: string, expression: string, position: string) {
  return {
    speakerId,
    expression,
    speakerPosition: characterPositionMap[position]
  };
}

/* Error handling */
export const showDialogueError = (partNum: string, lineNum: number) => {
  throw new Error(`Cannot find ${partNum} line: ${lineNum} in dialogue`);
};
