import { AssetMap, SoundAsset } from './AssetsTypes';
import { GameSoundType } from '../sound/GameSoundTypes';

const SoundAssets: AssetMap<SoundAsset> = {
  // SFX
  buttonHoverSound: {
    key: 'btn-hover',
    path: '/sfx/buttonHover.mp3',
    config: { volume: 0.3 },
    soundType: GameSoundType.SFX
  },
  buttonClickSound: {
    key: 'btn-click',
    path: '/sfx/buttonClick.mp3',
    config: { volume: 0.3 },
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
