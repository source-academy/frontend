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
  private currBgMusic: Phaser.Sound.WebAudioSound | undefined;

  constructor() {
    this.soundAssetMap = new Map<AssetKey, SoundAsset>();
    this.bgmVol = 1;
    this.sfxVol = 1;
    this.currBgMusicKey = Constants.nullInteractionId;
  }

  /**
   * Apply user settings to the sound manager;
   * namely the sfxVolume and bgmVolume.
   *
   * In the case the volumes are not defined, it will
   * be defaulted to 1 (max volume).
   *
   * @param settings user settings
   */
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

  /**
   * Store the sound asset within the sound manager.
   * Sound asset is stored as it is used when playing the
   * sound (to apply the sound config).
   *
   * @param soundAsset sound asset
   */
  private addSoundAsset(soundAsset: SoundAsset) {
    this.soundAssetMap.set(soundAsset.key, soundAsset);
  }

  /**
   * Return a sound asset based on its key.
   * If there is none, return undefined.
   *
   * @param key sound asset key
   */
  private getSoundAsset(key: AssetKey) {
    return this.soundAssetMap.get(key);
  }

  /**
   * Preload sound assets into the sound manager.
   *
   * @param soundAssets array of sound assets
   */
  public loadSounds(soundAssets: SoundAsset[]) {
    soundAssets.forEach(asset => {
      this.addSoundAsset(asset);
      this.loadSound(asset.key, toS3Path(asset.path, true));
    });
  }

  /**
   * Preload sound assets into the sound manager.
   *
   * @param assetMap AssetMap of sound assets
   */
  public loadSoundAssetMap(assetMap: AssetMap<SoundAsset>) {
    Object.values(assetMap).forEach(asset => {
      this.addSoundAsset(asset);
      this.loadSound(asset.key, toS3Path(asset.path, false));
    });
  }

  /**
   * Preload sound asset into the sound manager.
   *
   * @param assetKey key to be associated with the sound
   * @param assetPath path to the sound file
   */
  private loadSound(assetKey: AssetKey, assetPath: AssetPath) {
    this.getCurrentScene().load.audio(assetKey, assetPath);
  }

  /**
   * Play a sound, usually an SFX.
   * The sound will be added, played, and destroyed afterwards; hence
   * there is no need to keep any reference to it.
   *
   * Its volume will be multipled by the current user's SFX volume.
   *
   * @param soundKey key associated with the sound.
   */
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

    try {
      this.currBgMusic = this.getBaseSoundManager().add(soundAsset.key, {
        ...soundAsset.config,
        volume: bgmVol * this.bgmVol
      }) as Phaser.Sound.WebAudioSound;
      this.currBgMusicKey = soundAsset.key;

      // Finally, play it
      this.currBgMusic.play();
    } catch (err) {
      console.error(err);
    }
  }

  /**
   * Fade out a sound and destroy it.
   *
   * @param sound sound to be destroyed
   * @param fadeDuration duration of fade out
   */
  private fadeOutAndDestroyMusic(
    sound: Phaser.Sound.BaseSound,
    fadeDuration: number = bgMusicFadeDuration
  ) {
    this.getCurrentScene().tweens.add({
      targets: sound,
      ...musicFadeOutTween,
      duration: fadeDuration
    });

    // TODO: fix `TypeError: Cannot read property 'disconnect' of null` error
    // when user navigates away from game scene before fadeDuration * 2
    setTimeout(() => sound.destroy(), fadeDuration * 2);
  }

  /**
   * Stop all currently playing sounds.
   */
  public stopAllSound() {
    this.getBaseSoundManager().stopAll();
  }

  /**
   * Pause currently playing BGM music, if it is playing.
   */
  public pauseCurrBgMusic() {
    if (this.getCurrentScene() && this.currBgMusic && this.currBgMusic.isPlaying) {
      this.currBgMusic.pause();
    }
  }

  /**
   * Continue currently playing BGM music, if it is paused.
   */
  public continueCurrBgMusic() {
    if (this.getCurrentScene() && this.currBgMusic && this.currBgMusic.isPaused) {
      this.currBgMusic.play();
    }
  }

  /**
   * We do not use `this.game.sound` as it often
   * results in crash, due to audio not being present into audio cache.
   * i.e. calling `.add()` while the sound is not in cache.audio will
   * result in crash.
   *
   * From observation, the audio cache used by `this.game.sound`
   * and `this.scene.sound` can be different.
   *
   * From observation, `loadSound()` loads the audio into
   * `this.scene.sound.game.cache.audio`; and not into
   * `this.game.sound.game.cache.audio`.
   *
   * Hence, we use `this.getCurrentScene().sound.add` in order to refer
   * to the correct audio cache.
   *
   * NOTE: To check the audio cache, compare between:
   *  - this.game.sound.game.cache.audio
   *  - this.scene.sound.game.cache.audio
   */
  public getBaseSoundManager = () =>
    this.getCurrentScene().sound as Phaser.Sound.WebAudioSoundManager;
  public getCurrentScene = () => mandatory(SourceAcademyGame.getInstance().getCurrentSceneRef());
}

export default GameSoundManager;
