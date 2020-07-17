import SourceAcademyGame from 'src/pages/academy/game/subcomponents/sourceAcademyGame';

import { AssetMap, SoundAsset } from '../assets/AssetsTypes';
import { AssetKey, AssetPath } from '../commons/CommonTypes';
import { UserSaveState } from '../save/GameSaveTypes';
import { mandatory, sleep, toS3Path } from '../utils/GameUtils';
import { bgMusicFadeDuration, musicFadeOutTween } from './GameSoundTypes';

/**
 * This class manages the sounds for the entire game
 * It proxies the game's sound manager
 */
class GameSoundManager {
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
    Object.values(assetMap).forEach(asset => {
      this.getParentGame().addSoundAsset(asset);
      this.loadSound(asset.key, toS3Path(asset.path));
    });
  }

  private loadSound(assetKey: AssetKey, assetPath: AssetPath) {
    this.getCurrentScene().load.audio(assetKey, assetPath);
  }

  public playSound(soundKey: AssetKey) {
    const soundAsset = this.getParentGame().getSoundAsset(soundKey);
    if (soundAsset) {
      soundAsset.config.volume = this.getBaseSoundManager().volume;
      this.getBaseSoundManager().play(soundAsset.key, { ...soundAsset.config });
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
    if (this.getCurrentScene() && currBgMusicKey) {
      // Fade out current music
      const currBgMusic = this.getBaseSoundManager().get(currBgMusicKey);
      this.getCurrentScene().tweens.add({
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
    if (this.getCurrentScene() && currBgMusicKey) {
      const currBgMusic = this.getBaseSoundManager().get(currBgMusicKey);
      if (currBgMusic.isPlaying) currBgMusic.pause();
    }
  }

  public continueCurrBgMusic() {
    const currBgMusicKey = this.getParentGame().getCurrBgMusicKey();
    if (this.getCurrentScene() && currBgMusicKey) {
      const currBgMusic = this.getBaseSoundManager().get(currBgMusicKey);
      if (currBgMusic.isPaused) currBgMusic.play();
    }
  }

  public setGlobalVolume(volume: number) {
    this.getBaseSoundManager().volume = volume;
  }

  public getBaseSoundManager = () => mandatory(SourceAcademyGame.getInstance().sound);
  public getParentGame = () => mandatory(SourceAcademyGame.getInstance());
  public getCurrentScene = () => mandatory(SourceAcademyGame.getInstance().getCurrentSceneRef());
}

export default GameSoundManager;
