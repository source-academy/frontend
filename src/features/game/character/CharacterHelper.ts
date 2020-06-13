import { Constants } from '../commons/CommonConstants';
import { SpeakerDetail } from '../dialogue/DialogueTypes';

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
