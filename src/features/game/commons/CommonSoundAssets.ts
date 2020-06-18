import { SoundAsset } from './CommonsTypes';

export const buttonHoverSound: SoundAsset = {
  key: 'card',
  path: '../assets/card.mp3',
  config: { volume: 0.5 }
};

const commonSoundAssets = [buttonHoverSound];

export default commonSoundAssets;
