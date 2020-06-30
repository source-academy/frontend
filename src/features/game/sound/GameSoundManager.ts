import { AssetKey, AssetPath, SoundAsset } from '../commons/CommonsTypes';
import { SourceAcademyGame } from 'src/pages/academy/game/subcomponents/sourceAcademyGame';
import { sleep } from '../utils/GameUtils';
import { musicFadeOutTween, bgMusicFadeDuration } from './GameSoundTypes';
import { LocationId } from '../location/GameMapTypes';
import GameActionManager from '../action/GameActionManager';
import { UserSaveState } from '../save/GameSaveTypes';

class GameSoundManager {
  private soundAssets: Map<AssetKey, SoundAsset>;
  private baseSoundManager: Phaser.Sound.BaseSoundManager | undefined;
  private scene: Phaser.Scene | undefined;
  private parentGame: SourceAcademyGame | undefined;

  constructor() {
    this.soundAssets = new Map<AssetKey, SoundAsset>();
  }

  public initialise(scene: Phaser.Scene, parentGame: SourceAcademyGame) {
    this.scene = scene;
    this.parentGame = parentGame;
    this.baseSoundManager = this.parentGame.sound;
    this.baseSoundManager.pauseOnBlur = true;
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
        this.getBaseSoundManager().play(soundAsset.key, soundAsset.config);
      }
    }
  }

  public playBgMusic(soundKey: AssetKey, volume = 1.5) {
    // If same music is already playing, skip
    const currBgMusicKey = this.getParentGame().getCurrBgMusicKey();
    if (currBgMusicKey && currBgMusicKey === soundKey) {
      return;
    }

    this.stopCurrBgMusic();

    const soundAsset = this.soundAssets.get(soundKey);
    if (soundAsset) {
      this.getBaseSoundManager().play(soundAsset.key, { ...soundAsset.config, volume });
      this.getParentGame().setCurrBgMusicKey(soundAsset.key);
    }
  }

  public async stopCurrBgMusic(fadeDuration: number = bgMusicFadeDuration) {
    const currBgMusicKey = this.getParentGame().getCurrBgMusicKey();
    if (this.scene && currBgMusicKey) {
      // Fade out current music
      const currBgMusic = this.getBaseSoundManager().get(currBgMusicKey);
      this.scene.tweens.add({
        targets: currBgMusic,
        ...musicFadeOutTween,
        duration: fadeDuration
      });

      await sleep(fadeDuration);
      this.getBaseSoundManager().stopByKey(currBgMusicKey);
      this.getParentGame().setCurrBgMusicKey(undefined);
    }
  }

  public async stopAllSound() {
    this.getBaseSoundManager().stopAll();
  }

  public pauseCurrBgMusic() {
    const currBgMusicKey = this.getParentGame().getCurrBgMusicKey();
    if (this.scene && currBgMusicKey) {
      const currBgMusic = this.getBaseSoundManager().get(currBgMusicKey);
      if (currBgMusic.isPlaying) currBgMusic.pause();
    }
  }

  public continueCurrBgMusic() {
    const currBgMusicKey = this.getParentGame().getCurrBgMusicKey();
    if (this.scene && currBgMusicKey) {
      const currBgMusic = this.getBaseSoundManager().get(currBgMusicKey);
      if (currBgMusic.isPaused) currBgMusic.play();
    }
  }

  public setGlobalVolume(volume: number) {
    this.getBaseSoundManager().volume = volume;
  }

  public getBaseSoundManager() {
    if (!this.baseSoundManager) {
      throw Error('No base sound manager');
    }
    return this.baseSoundManager;
  }

  public getParentGame() {
    if (!this.parentGame) {
      throw Error('No parent game');
    }
    return this.parentGame;
  }
}

export default GameSoundManager;
