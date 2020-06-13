import { Constants } from '../commons/CommonConstants';

/* Speaker details */
export const avatarKey = (speaker: string, expression: string) => `${speaker}-${expression}`;
export const avatarAssetPath = (speaker: string, expression: string) => {
  if (speaker === 'you') {
    return `${Constants.assetsFolder}/avatars/beat/beat.happy.png`;
  }
  return `${Constants.assetsFolder}/avatars/${speaker}/${speaker}.${expression || 'normal'}.png`;
};
