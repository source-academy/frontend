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
  currBgMusicKey?: AssetKey;
  soundAssetMap: Map<AssetKey, SoundAsset>;

  constructor() {
    this.soundAssetMap = new Map<AssetKey, SoundAsset>();
  }

  public applyUserSettings(userSaveState: UserSaveState) {
    this.setGlobalVolume(userSaveState.settings.volume);
  }

  public renderBackgroundMusic(bgmKey: AssetKey) {
    this.stopCurrBgMusic();
    this.playBgMusic(bgmKey);
  }

  public setCurrBgMusicKey(key: AssetKey | undefined) {
    this.currBgMusicKey = key;
  }

  public getCurrBgMusicKey() {
    return this.currBgMusicKey;
  }

  public addSoundAsset(soundAsset: SoundAsset) {
    this.soundAssetMap.set(soundAsset.key, soundAsset);
  }

  public clearSoundAssetMap() {
    this.soundAssetMap.clear();
  }

  public getSoundAsset(key: AssetKey) {
    return this.soundAssetMap.get(key);
  }

  public loadSounds(soundAssets: SoundAsset[]) {
    soundAssets.forEach(asset => {
      this.addSoundAsset(asset);
      this.loadSound(asset.key, toS3Path(asset.path));
    });
  }

  public loadSoundAssetMap(assetMap: AssetMap<SoundAsset>) {
    Object.values(assetMap).forEach(asset => {
      this.addSoundAsset(asset);
      this.loadSound(asset.key, toS3Path(asset.path));
    });
  }

  private loadSound(assetKey: AssetKey, assetPath: AssetPath) {
    this.getCurrentScene().load.audio(assetKey, assetPath);
  }

  public playSound(soundKey: AssetKey) {
    const soundAsset = this.getSoundAsset(soundKey);
    if (soundAsset) {
      soundAsset.config.volume = this.getBaseSoundManager().volume;
      this.getBaseSoundManager().play(soundAsset.key, { ...soundAsset.config });
    }
  }

  public playBgMusic(soundKey: AssetKey, volume = 1.5) {
    // If same music is already playing, skip
    const currBgMusicKey = this.getCurrBgMusicKey();
    if (currBgMusicKey && currBgMusicKey === soundKey) {
      return;
    }

    const soundAsset = this.getSoundAsset(soundKey);

    if (soundAsset) {
      this.getBaseSoundManager().play(soundAsset.key, { ...soundAsset.config, volume });
      this.setCurrBgMusicKey(soundAsset.key);
    }
  }

  public async stopCurrBgMusic(fadeDuration: number = bgMusicFadeDuration) {
    const currBgMusicKey = this.getCurrBgMusicKey();
    this.setCurrBgMusicKey(undefined);
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
    const currBgMusicKey = this.getCurrBgMusicKey();
    if (this.getCurrentScene() && currBgMusicKey) {
      const currBgMusic = this.getBaseSoundManager().get(currBgMusicKey);
      if (currBgMusic.isPlaying) currBgMusic.pause();
    }
  }

  public continueCurrBgMusic() {
    const currBgMusicKey = this.getCurrBgMusicKey();
    if (this.getCurrentScene() && currBgMusicKey) {
      const currBgMusic = this.getBaseSoundManager().get(currBgMusicKey);
      if (currBgMusic.isPaused) currBgMusic.play();
    }
  }

  public setGlobalVolume(volume: number) {
    this.getBaseSoundManager().volume = volume;
  }

  public getBaseSoundManager = () => mandatory(SourceAcademyGame.getInstance().sound);
  public getCurrentScene = () => mandatory(SourceAcademyGame.getInstance().getCurrentSceneRef());
}

export default GameSoundManager;
