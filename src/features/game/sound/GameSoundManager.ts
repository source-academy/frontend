import { AssetKey, AssetPath, SoundAsset } from '../commons/CommonsTypes';
import {
  getSourceAcademyGame,
  SourceAcademyGame
} from 'src/pages/academy/game/subcomponents/sourceAcademyGame';
import { sleep } from '../utils/GameUtils';
import { musicFadeOutTween, bgMusicFadeDuration } from './GameSoundTypes';
import { LocationId } from '../location/GameMapTypes';
import GameActionManager from '../action/GameActionManager';
import { UserSaveState } from '../save/GameSaveTypes';

class GameSoundManager {
  private soundAssets: Map<AssetKey, SoundAsset>;
  private baseSoundManager: Phaser.Sound.BaseSoundManager;
  private scene: Phaser.Scene | undefined;
  private game: SourceAcademyGame;

  constructor() {
    this.game = getSourceAcademyGame();
    this.soundAssets = new Map<AssetKey, SoundAsset>();
    this.baseSoundManager = this.game.sound;
    this.scene = undefined;
    this.baseSoundManager.pauseOnBlur = true;
  }

  public initialise(scene: Phaser.Scene) {
    this.scene = scene;
  }

  public applyUserSettings(userSaveState: UserSaveState) {
    this.setGlobalVolume(userSaveState.settings.volume);
  }

  public renderBackgroundMusic(locationId: LocationId) {
    const bgmKey = GameActionManager.getInstance().getLocationAtId(locationId).bgmKey;
    if (bgmKey) {
      this.playBgMusic(bgmKey);
    } else {
      this.stopCurrBgMusic();
    }
  }

  public clearSoundAssets() {
    this.soundAssets.clear();
  }

  public loadSounds(soundAssets: SoundAsset[]) {
    soundAssets.forEach(asset => {
      this.soundAssets.set(asset.key, asset);
      this.loadSound(asset.key, asset.path);
    });
  }

  private loadSound(assetKey: AssetKey, assetPath: AssetPath) {
    if (this.scene) {
      this.scene.load.audio(assetKey, assetPath);
    }
  }

  public playSound(soundKey: AssetKey) {
    if (this.scene) {
      const soundAsset = this.soundAssets.get(soundKey);
      if (soundAsset) {
        this.baseSoundManager.play(soundAsset.key, soundAsset.config);
      }
    }
  }

  public playBgMusic(soundKey: AssetKey) {
    // If same music is already playing, skip
    const currBgMusicKey = this.game.getCurrBgMusicKey();
    if (currBgMusicKey && currBgMusicKey === soundKey) {
      return;
    }

    this.stopCurrBgMusic();

    const soundAsset = this.soundAssets.get(soundKey);
    if (soundAsset) {
      this.baseSoundManager.play(soundAsset.key, soundAsset.config);
      this.game.setCurrBgMusicKey(soundAsset.key);
    }
  }

  public async stopCurrBgMusic(fadeDuration: number = bgMusicFadeDuration) {
    const currBgMusicKey = this.game.getCurrBgMusicKey();
    if (this.scene && currBgMusicKey) {
      // Fade out current music
      const currBgMusic = this.baseSoundManager.get(currBgMusicKey);
      this.scene.tweens.add({
        targets: currBgMusic,
        ...musicFadeOutTween,
        duration: fadeDuration
      });

      await sleep(fadeDuration);
      this.baseSoundManager.stopByKey(currBgMusicKey);
      this.game.setCurrBgMusicKey(undefined);
    }
  }

  public async stopAllSound() {
    this.baseSoundManager.stopAll();
  }

  public pauseCurrBgMusic() {
    const currBgMusicKey = this.game.getCurrBgMusicKey();
    if (this.scene && currBgMusicKey) {
      const currBgMusic = this.baseSoundManager.get(currBgMusicKey);
      if (currBgMusic.isPlaying) currBgMusic.pause();
    }
  }

  public continueCurrBgMusic() {
    const currBgMusicKey = this.game.getCurrBgMusicKey();
    if (this.scene && currBgMusicKey) {
      const currBgMusic = this.baseSoundManager.get(currBgMusicKey);
      if (currBgMusic.isPaused) currBgMusic.play();
    }
  }

  public setGlobalVolume(volume: number) {
    this.baseSoundManager.volume = volume;
  }
}

export default GameSoundManager;
