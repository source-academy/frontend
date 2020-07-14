import { GameSoundType } from '../sound/GameSoundTypes';
import { AssetMap, SoundAsset } from './AssetsTypes';

const SoundAssets: AssetMap<SoundAsset> = {
  // SFX
  buttonHover: {
    key: 'btn-hover',
    path: '/sfx/buttonHover.mp3',
    config: { volume: 0.5 },
    soundType: GameSoundType.SFX
  },
  buttonClick: {
    key: 'btn-click',
    path: '/sfx/buttonClick.mp3',
    config: { volume: 0.5 },
    soundType: GameSoundType.SFX
  },

  // BGM
  galacticHarmony: {
    key: 'galactic-harmony',
    path: '/bgm/GalacticHarmony.mp3',
    config: { volume: 0.5, loop: true },
    soundType: GameSoundType.BGM
  }
};

export default SoundAssets;
