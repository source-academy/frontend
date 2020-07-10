import { AssetMap, SoundAsset } from './AssetsTypes';
import { GameSoundType } from '../sound/GameSoundTypes';

const SoundAssets: AssetMap<SoundAsset> = {
  // SFX
  buttonHoverSound: {
    key: 'card',
    path: '/ui/card.mp3',
    config: { volume: 0.1 },
    soundType: GameSoundType.SFX
  },

  // BGM
  galacticHarmony: {
    key: 'galactic-harmony',
    path: '/ui/GalacticHarmony.mp3',
    config: { volume: 0.5, loop: true },
    soundType: GameSoundType.BGM
  }
};

export default SoundAssets;
