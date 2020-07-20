import { AssetMap, SoundAsset } from '../assets/AssetsTypes';
import { Constants } from '../commons/CommonConstants';
import { AssetKey, AssetPath } from '../commons/CommonTypes';
import { SettingsJson } from '../save/GameSaveTypes';
import SourceAcademyGame from '../SourceAcademyGame';
import { mandatory, sleep, toS3Path } from '../utils/GameUtils';
import StringUtils from '../utils/StringUtils';
import { bgMusicFadeDuration, musicFadeOutTween } from './GameSoundTypes';

/**
 * This class manages the sounds for the entire game
 * It proxies the game's sound manager
 */
class GameSoundManager {
  private currBgMusicKey: AssetKey;
  private soundAssetMap: Map<AssetKey, SoundAsset>;
  private bgmVol: number;
  private sfxVol: number;

  constructor() {
    this.soundAssetMap = new Map<AssetKey, SoundAsset>();
    this.currBgMusicKey = Constants.nullInteractionId;
    this.bgmVol = 1;
    this.sfxVol = 1;
  }

  public applyUserSettings(settings: SettingsJson) {
    this.bgmVol = settings.bgmVolume !== undefined ? settings.bgmVolume : 1;
    this.sfxVol = settings.sfxVolume !== undefined ? settings.sfxVolume : 1;

    // Modify currently playing BGM, if any
    if (this.isNonEmptyBGMKey()) {
      const bgm = this.getBaseSoundManager().get(
        this.currBgMusicKey
      ) as Phaser.Sound.HTML5AudioSound;
      if (bgm.isPlaying) {
        const soundAsset = mandatory(this.getSoundAsset(this.currBgMusicKey));
        const bgmVol = soundAsset.config.volume !== undefined ? soundAsset.config.volume : 1;
        bgm.setVolume(bgmVol * this.bgmVol);
      }
    }
  }

  private setCurrBgMusicKey(key: AssetKey) {
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
      const vol = soundAsset.config.volume !== undefined ? soundAsset.config.volume : 1;
      this.getBaseSoundManager().play(soundAsset.key, {
        ...soundAsset.config,
        volume: vol * this.sfxVol
      });
    }
  }

  /**
   * Play a background music. Only one background music is able
   * to be played at any one time; hence calling this method will
   * also stop the previous background music.
   *
   * If the provided soundKey is the same as the the currently
   * playing background music, it will be skipped (to avoid strange
   * stopping and playing of the same music).
   *
   * To play no music, the parameter can be set to empty string i.e. ''.
   *
   * NOTE:
   * Calling playBgMusic in rapid succession can lead
   * to race conditions and undefined behaviour. However, there should
   * not be a situation where you need to call playBgMusic in succession.
   *
   * @param soundKey key to the background music to be played.
   * @param fadeDuration duration to fade out previous background music
   */
  public async playBgMusic(soundKey: AssetKey, fadeDuration?: number) {
    if (soundKey === Constants.nullInteractionId) {
      await this.stopCurrBgMusic(fadeDuration);
      return;
    }

    // If same music is already playing, skip
    if (this.getCurrBgMusicKey() === soundKey) {
      return;
    }

    // We need to await to ensure this.currBgMusicKey has finished updating
    await this.stopCurrBgMusic(fadeDuration);

    const soundAsset = mandatory(this.getSoundAsset(soundKey));

    const bgmVol = soundAsset.config.volume !== undefined ? soundAsset.config.volume : 1;
    this.getBaseSoundManager().play(soundAsset.key, {
      ...soundAsset.config,
      volume: bgmVol * this.bgmVol
    });
    this.setCurrBgMusicKey(soundAsset.key);
  }

  /**
   * Stop the currently playing background music.
   *
   * NOTE:
   * This method is made private because calling it
   * back-to-back with playBgMusic causes race conditions.
   *
   * @param fadeDuration duration to fade out the background music
   */
  private async stopCurrBgMusic(fadeDuration: number = bgMusicFadeDuration) {
    if (this.getCurrentScene() && this.isNonEmptyBGMKey()) {
      const currBgMusic = this.getBaseSoundManager().get(this.getCurrBgMusicKey());
      if (currBgMusic.isPlaying) {
        // Fade out current music
        this.getCurrentScene().tweens.add({
          targets: currBgMusic,
          ...musicFadeOutTween,
          duration: fadeDuration
        });

        await sleep(fadeDuration);
        this.getBaseSoundManager().stopByKey(this.getCurrBgMusicKey());
        this.setCurrBgMusicKey(Constants.nullInteractionId);
      }
    }
  }

  public async stopAllSound() {
    this.getBaseSoundManager().stopAll();
  }

  public pauseCurrBgMusic() {
    if (this.getCurrentScene() && this.isNonEmptyBGMKey()) {
      const currBgMusic = this.getBaseSoundManager().get(this.getCurrBgMusicKey());
      if (currBgMusic.isPlaying) currBgMusic.pause();
    }
  }

  public continueCurrBgMusic() {
    if (this.getCurrentScene() && this.isNonEmptyBGMKey()) {
      const currBgMusic = this.getBaseSoundManager().get(this.getCurrBgMusicKey());
      if (currBgMusic.isPaused) currBgMusic.play();
    }
  }

  public getBaseSoundManager = () => mandatory(SourceAcademyGame.getInstance().sound);
  public getCurrentScene = () => mandatory(SourceAcademyGame.getInstance().getCurrentSceneRef());
  public isNonEmptyBGMKey = () => !StringUtils.isEmptyString(this.getCurrBgMusicKey());
}

export default GameSoundManager;
