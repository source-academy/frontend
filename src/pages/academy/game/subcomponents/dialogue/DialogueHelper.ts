import { Constants as c, Keys as k } from '../utils/constants';
import { SpeakerDetail } from './DialogueTypes';

/* Parsing dialogue */
export const strip = (str: string) => str.slice(1, str.length - 1);
export const isPartLabel = (line: string) => new RegExp(/\[part[0-9]+\]/).test(line);
export const isGotoLabel = (line: string) => new RegExp(/\[Goto part[0-9]+\]/).test(line);
export const getPartToJump = (line: string) => line.match(/\[Goto (part[0-9]+)\]/)![1];
export const isSpeaker = (line: string) => line && line[0] === '$';

/* Speaker details */
export const avatarKey = (speaker: string, expression: string) => `${speaker}-${expression}`;
export const avatarAssetPath = (speaker: string, expression: string) => {
  if (speaker === k.you) {
    return `${c.assetsFolder}/avatars/beat/beat.happy.png`;
  }
  return `${c.assetsFolder}/avatars/${speaker}/${speaker}.${expression || 'normal'}.png`;
};
export const getSpeakerDetails = (line: string): SpeakerDetail => {
  const [speaker, expression] = line.slice(1).split(', ');
  return [speaker, expression];
};
export const caps = (word: string) => word.charAt(0).toUpperCase() + word.slice(1);
