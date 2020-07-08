import { SoundAsset } from './CommonTypes';
import { GameSoundType } from '../sound/GameSoundTypes';

/////////////////
//     SFX     //
/////////////////

export const buttonHoverSound: SoundAsset = {
  key: 'card',
  path: '/ui/card.mp3',
  config: { volume: 0.1 },
  soundType: GameSoundType.SFX
};

/////////////////
//     BGM     //
/////////////////

export const galacticHarmonyBgMusic: SoundAsset = {
  key: 'galactic-harmony',
  path: '/ui/GalacticHarmony.mp3',
  config: { volume: 0.5, loop: true },
  soundType: GameSoundType.BGM
};

export const heavyHitterBgMusic: SoundAsset = {
  key: 'heavy-hitter',
  path: '/ui/HeavyHitter.mp3',
  config: { volume: 0.5, loop: true },
  soundType: GameSoundType.BGM
};

const commonSoundAssets = [buttonHoverSound];

export default commonSoundAssets;
