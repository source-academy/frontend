import { GameSoundType } from '../sound/GameSoundTypes';
import { AssetMap, SoundAsset } from './AssetsTypes';

const SoundAssets: AssetMap<SoundAsset> = {
  // SFX
  buttonHover: {
    key: 'btn-hover',
    path: '/sfx/buttonHover.mp3',
    config: { volume: 0.1 },
    soundType: GameSoundType.SFX
  },
  buttonClick: {
    key: 'btn-click',
    path: '/sfx/buttonClick.mp3',
    config: { volume: 0.1 },
    soundType: GameSoundType.SFX
  },
  radioButtonClick: {
    key: 'radio-btn-click',
    path: '/sfx/radioButtonClick.mp3',
    config: { volume: 0.15 },
    soundType: GameSoundType.SFX
  },
  dialogueAdvance: {
    key: 'dialogue-advance',
    path: '/sfx/dialogueAdvance.mp3',
    config: { volume: 0.3 },
    soundType: GameSoundType.SFX
  },
  popUpEnter: {
    key: 'pop-up-enter',
    path: '/sfx/popUpEnter.mp3',
    config: { volume: 0.35 },
    soundType: GameSoundType.SFX
  },
  popUpExit: {
    key: 'pop-up-exit',
    path: '/sfx/popUpExit.mp3',
    config: { volume: 0.35 },
    soundType: GameSoundType.SFX
  },
  menuEnter: {
    key: 'menu-enter',
    path: '/sfx/menuEnter.mp3',
    config: { volume: 0.5 },
    soundType: GameSoundType.SFX
  },
  menuExit: {
    key: 'menu-exit',
    path: '/sfx/menuExit.mp3',
    config: { volume: 0.5 },
    soundType: GameSoundType.SFX
  },
  modeEnter: {
    key: 'mode-enter',
    path: '/sfx/modeEnter.mp3',
    config: { volume: 0.1 },
    soundType: GameSoundType.SFX
  },
  notifEnter: {
    key: 'notif-enter',
    path: '/sfx/notifEnter.mp3',
    config: { volume: 0.25 },
    soundType: GameSoundType.SFX
  },
  notifExit: {
    key: 'notif-exit',
    path: '/sfx/notifExit.mp3',
    config: { volume: 0.25 },
    soundType: GameSoundType.SFX
  },
  radioStatic: {
    key: 'radio-static',
    path: '/sfx/radioStatic.mp3',
    config: { volume: 0.1 },
    soundType: GameSoundType.SFX
  },

  // BGM
  galacticHarmony: {
    key: 'galactic-harmony',
    path: '/bgm/GalacticHarmony.mp3',
    config: { volume: 0.25, loop: true },
    soundType: GameSoundType.BGM
  }
};

export default SoundAssets;
