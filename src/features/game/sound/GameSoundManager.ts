import { AssetMap, SoundAsset } from '../assets/AssetsTypes';
import { Constants } from '../commons/CommonConstants';
import { AssetKey, AssetPath } from '../commons/CommonTypes';
import { SettingsJson } from '../save/GameSaveTypes';
import SourceAcademyGame from '../SourceAcademyGame';
import { mandatory, toS3Path } from '../utils/GameUtils';
import { bgMusicFadeDuration, musicFadeOutTween } from './GameSoundTypes';

/**
 * This class manages the sounds for the entire game
 * It proxies the game's sound manager
 */
class GameSoundManager {
  private soundAssetMap: Map<AssetKey, SoundAsset>;
  private bgmVol: number;
  private sfxVol: number;

  private currBgMusicKey: AssetKey;
  private currBgMusic: Phaser.Sound.HTML5AudioSound | undefined;

  constructor() {
    (this.getBaseSoundManager() as Phaser.Sound.HTML5AudioSoundManager).unlock();
    this.soundAssetMap = new Map<AssetKey, SoundAsset>();
    this.bgmVol = 1;
    this.sfxVol = 1;
    this.currBgMusicKey = Constants.nullInteractionId;
  }

  public applyUserSettings(settings: SettingsJson) {
    this.bgmVol = settings.bgmVolume !== undefined ? settings.bgmVolume : 1;
    this.sfxVol = settings.sfxVolume !== undefined ? settings.sfxVolume : 1;

    // Modify currently playing BGM, if any
    if (this.currBgMusic && this.currBgMusic.isPlaying) {
      const soundAsset = mandatory(this.getSoundAsset(this.currBgMusicKey));
      const bgmVol = soundAsset.config.volume !== undefined ? soundAsset.config.volume : 1;
      this.currBgMusic.setVolume(bgmVol * this.bgmVol);
    }
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
  public playBgMusic(soundKey: AssetKey, fadeDuration?: number) {
    // Game is no longer mounted, do not play the music
    if (!SourceAcademyGame.getInstance().isMounted) {
      return;
    }

    // If same music is already playing, skip
    if (this.currBgMusicKey === soundKey) {
      return;
    }

    // Requested soundKey is empty, stop current BGM
    if (soundKey === Constants.nullInteractionId && this.currBgMusic) {
      this.fadeOutAndDestroyMusic(this.currBgMusic, fadeDuration);
      this.currBgMusic = undefined;
      this.currBgMusicKey = soundKey;
      return;
    }

    // Stop previous BgMusic
    if (this.currBgMusic) this.fadeOutAndDestroyMusic(this.currBgMusic);

    // Update BGM and key
    const soundAsset = mandatory(this.getSoundAsset(soundKey));
    const bgmVol = soundAsset.config.volume !== undefined ? soundAsset.config.volume : 1;
    this.currBgMusic = this.getBaseSoundManager().add(soundAsset.key, {
      ...soundAsset.config,
      volume: bgmVol * this.bgmVol
    }) as Phaser.Sound.HTML5AudioSound;
    this.currBgMusicKey = soundAsset.key;

    // Finally, play it
    this.currBgMusic.play();
  }

  private fadeOutAndDestroyMusic(
    sound: Phaser.Sound.BaseSound,
    fadeDuration: number = bgMusicFadeDuration
  ) {
    this.getCurrentScene().tweens.add({
      targets: sound,
      ...musicFadeOutTween,
      duration: fadeDuration
    });

    setTimeout(() => sound.destroy(), fadeDuration * 2);
  }

  public stopAllSound() {
    this.getBaseSoundManager().stopAll();
  }

  public pauseCurrBgMusic() {
    if (this.getCurrentScene() && this.currBgMusic && this.currBgMusic.isPlaying) {
      this.currBgMusic.pause();
    }
  }

  public continueCurrBgMusic() {
    if (this.getCurrentScene() && this.currBgMusic && this.currBgMusic.isPaused) {
      this.currBgMusic.play();
    }
  }

  public getBaseSoundManager = () => mandatory(SourceAcademyGame.getInstance().sound);
  public getCurrentScene = () => mandatory(SourceAcademyGame.getInstance().getCurrentSceneRef());
}

export default GameSoundManager;
