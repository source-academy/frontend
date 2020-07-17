import { AssetMap, SoundAsset } from '../assets/AssetsTypes';
import { AssetKey, AssetPath } from '../commons/CommonTypes';
import { SettingsJson } from '../save/GameSaveTypes';
import SourceAcademyGame from '../SourceAcademyGame';
import { mandatory, sleep, toS3Path } from '../utils/GameUtils';
import { bgMusicFadeDuration, musicFadeOutTween } from './GameSoundTypes';

/**
 * This class manages the sounds for the entire game
 * It proxies the game's sound manager
 */
class GameSoundManager {
  private currBgMusicKey: AssetKey | undefined;
  private soundAssetMap: Map<AssetKey, SoundAsset>;
  private bgmVol: number;
  private sfxVol: number;

  constructor() {
    this.soundAssetMap = new Map<AssetKey, SoundAsset>();
    this.bgmVol = 1;
    this.sfxVol = 1;
  }

  public applyUserSettings(settings: SettingsJson) {
    this.bgmVol = settings.bgmVolume;
    this.sfxVol = settings.sfxVolume;

    // Modify currently playing BGM, if any
    if (this.currBgMusicKey) {
      const bgm = this.getBaseSoundManager().get(
        this.currBgMusicKey
      ) as Phaser.Sound.HTML5AudioSound;
      if (bgm.isPlaying) {
        const soundAsset = mandatory(this.getSoundAsset(this.currBgMusicKey));
        const bgmVol = soundAsset.config.volume || 1;
        bgm.setVolume(bgmVol * this.bgmVol);
      }
    }
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
      const vol = soundAsset.config.volume || 1;
      this.getBaseSoundManager().play(soundAsset.key, {
        ...soundAsset.config,
        volume: vol * this.sfxVol
      });
    }
  }

  public playBgMusic(soundKey: AssetKey) {
    // If same music is already playing, skip
    const currBgMusicKey = this.getCurrBgMusicKey();
    if (currBgMusicKey && currBgMusicKey === soundKey) {
      return;
    }

    this.stopCurrBgMusic();
    const soundAsset = mandatory(this.getSoundAsset(soundKey));

    const bgmVol = soundAsset.config.volume || 1;
    this.getBaseSoundManager().play(soundAsset.key, {
      ...soundAsset.config,
      volume: bgmVol * this.bgmVol
    });
    this.setCurrBgMusicKey(soundAsset.key);
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

  public getBaseSoundManager = () => mandatory(SourceAcademyGame.getInstance().sound);
  public getCurrentScene = () => mandatory(SourceAcademyGame.getInstance().getCurrentSceneRef());
}

export default GameSoundManager;
