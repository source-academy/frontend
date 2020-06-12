import { Constants } from '../commons/CommonConstants';
import { SpeakerDetail } from '../dialogue/DialogueTypes';

/* Parsing dialogue */
export const isPartLabel = (line: string) => new RegExp(/\[part[0-9]+\]/).test(line);
export const isGotoLabel = (line: string) => new RegExp(/\[Goto part[0-9]+\]/).test(line);
export const getPartToJump = (line: string) => line.match(/\[Goto (part[0-9]+)\]/)![1];
export const isSpeaker = (line: string) => line && line[0] === '$';

/* Speaker details */
export const avatarKey = (speaker: string, expression: string) => `${speaker}-${expression}`;
export const avatarAssetPath = (speaker: string, expression: string) => {
  if (speaker === 'you') {
    return `${Constants.assetsFolder}/avatars/beat/beat.happy.png`;
  }
  return `${Constants.assetsFolder}/avatars/${speaker}/${speaker}.${expression || 'normal'}.png`;
};
export const getSpeakerDetails = (line: string): SpeakerDetail => {
  const [speaker, expression] = line.slice(1).split(', ');
  return [speaker, expression];
};
export const caps = (word: string) => word.charAt(0).toUpperCase() + word.slice(1);

/* Error handling */
export const showDialogueError = (partNum: string, lineNum: number) => {
  throw new Error(`Cannot find ${partNum} line: ${lineNum} in dialogue`);
};
