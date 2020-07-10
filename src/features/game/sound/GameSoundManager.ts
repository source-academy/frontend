import { AssetKey, AssetPath } from '../commons/CommonTypes';
import { SourceAcademyGame } from 'src/pages/academy/game/subcomponents/sourceAcademyGame';
import { sleep, toS3Path } from '../utils/GameUtils';
import { musicFadeOutTween, bgMusicFadeDuration } from './GameSoundTypes';
import { UserSaveState } from '../save/GameSaveTypes';
import { SoundAsset, AssetMap } from '../assets/AssetsTypes';

class GameSoundManager {
  private baseSoundManager: Phaser.Sound.BaseSoundManager | undefined;
  private scene: Phaser.Scene | undefined;
  private parentGame: SourceAcademyGame | undefined;

  public initialise(scene: Phaser.Scene, parentGame: SourceAcademyGame) {
    this.scene = scene;
    this.parentGame = parentGame;
    this.baseSoundManager = this.parentGame.sound;
    this.baseSoundManager.pauseOnBlur = true;
  }

  public applyUserSettings(userSaveState: UserSaveState) {
    this.setGlobalVolume(userSaveState.settings.volume);
  }

  public renderBackgroundMusic(bgmKey: AssetKey) {
    this.stopCurrBgMusic();
    this.playBgMusic(bgmKey);
  }

  public clearSoundAssets() {
    this.getParentGame().clearSoundAssetMap();
  }

  public loadSounds(soundAssets: SoundAsset[]) {
    soundAssets.forEach(asset => {
      this.getParentGame().addSoundAsset(asset);
      this.loadSound(asset.key, toS3Path(asset.path));
    });
  }

  public loadSoundAssetMap(assetMap: AssetMap<SoundAsset>) {
    Object.entries(assetMap).forEach(asset => {
      this.getParentGame().addSoundAsset(asset[1]);
      this.loadSound(asset[1].key, toS3Path(asset[1].path));
    });
  }

  private loadSound(assetKey: AssetKey, assetPath: AssetPath) {
    if (this.scene) {
      this.scene.load.audio(assetKey, assetPath);
    }
  }

  public playSound(soundKey: AssetKey) {
    if (this.scene) {
      const soundAsset = this.getParentGame().getSoundAsset(soundKey);
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

    const soundAsset = this.getParentGame().getSoundAsset(soundKey);

    if (soundAsset) {
      this.getBaseSoundManager().play(soundAsset.key, { ...soundAsset.config, volume });
      this.getParentGame().setCurrBgMusicKey(soundAsset.key);
    }
  }

  public async stopCurrBgMusic(fadeDuration: number = bgMusicFadeDuration) {
    const currBgMusicKey = this.getParentGame().getCurrBgMusicKey();
    this.getParentGame().setCurrBgMusicKey(undefined);
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
