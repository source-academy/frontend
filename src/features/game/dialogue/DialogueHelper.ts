import { SpeakerDetail } from '../commons/CommonsTypes';
import { CharacterPosition } from '../character/GameCharacterConstants';

const specialSpeakers = {
  narrator: 'narrator',
  you: 'you',
  none: 'none'
};

const characterPositionMap = {
  left: CharacterPosition.Left,
  middle: CharacterPosition.Middle,
  right: CharacterPosition.Right
};

/* Parsing dialogue */
export const isPartLabel = (line: string) => new RegExp(/\[part[0-9]+\]/).test(line);
export const isGotoLabel = (line: string) => new RegExp(/\[Goto part[0-9]+\]/).test(line);
export const getPartToJump = (line: string) => line.match(/\[Goto (part[0-9]+)\]/)![1];
export const isSpeaker = (line: string) => line && line[0] === '$';

export const getSpeakerDetails = (line: string): SpeakerDetail | null => {
  const [speaker, expression, position] = line.slice(1).split(', '); // remove the '$ sign
  const characterPosition = position ? characterPositionMap[position] : CharacterPosition.Middle;
  if (speaker === specialSpeakers.none) {
    return ['', '', CharacterPosition.Middle];
  }
  return [speaker, expression, characterPosition];
};

/* Error handling */
export const showDialogueError = (partNum: string, lineNum: number) => {
  throw new Error(`Cannot find ${partNum} line: ${lineNum} in dialogue`);
};
