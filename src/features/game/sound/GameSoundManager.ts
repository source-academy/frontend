import { AssetKey, AssetPath, SoundAsset } from '../commons/CommonsTypes';
import game from 'src/pages/academy/game/subcomponents/phaserGame';
import { sleep } from '../utils/GameUtils';
import { musicFadeOutTween, bgMusicFadeDuration } from './GameSoundTypes';
import { LocationId } from '../location/GameMapTypes';
import GameActionManager from '../action/GameActionManager';

class GameSoundManager {
  private soundAssets: Map<AssetKey, SoundAsset>;
  private baseSoundManager: Phaser.Sound.BaseSoundManager;
  private scene: Phaser.Scene | undefined;

  constructor() {
    this.soundAssets = new Map<AssetKey, SoundAsset>();
    this.baseSoundManager = game.sound;
    this.scene = undefined;
    this.baseSoundManager.pauseOnBlur = true;
  }

  public initialise(scene: Phaser.Scene) {
    this.scene = scene;
  }

  public renderBackgroundMusic(locationId: LocationId) {
    console.log('Rendering BGM');
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
    const currBgMusicKey = game.getCurrBgMusicKey();
    if (currBgMusicKey && currBgMusicKey === soundKey) {
      return;
    }

    this.stopCurrBgMusic();

    const soundAsset = this.soundAssets.get(soundKey);
    if (soundAsset) {
      this.baseSoundManager.play(soundAsset.key, soundAsset.config);
      game.setCurrBgMusicKey(soundAsset.key);
    }
  }

  public async stopCurrBgMusic(fadeDuration: number = bgMusicFadeDuration) {
    console.log('Stopping BG music');
    const currBgMusicKey = game.getCurrBgMusicKey();
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
      game.setCurrBgMusicKey(undefined);
    }
  }

  public async stopAllSound() {
    this.baseSoundManager.stopAll();
  }

  public pauseCurrBgMusic() {
    const currBgMusicKey = game.getCurrBgMusicKey();
    if (this.scene && currBgMusicKey) {
      const currBgMusic = this.baseSoundManager.get(currBgMusicKey);
      if (currBgMusic.isPlaying) currBgMusic.pause();
    }
  }

  public continueCurrBgMusic() {
    const currBgMusicKey = game.getCurrBgMusicKey();
    if (this.scene && currBgMusicKey) {
      const currBgMusic = this.baseSoundManager.get(currBgMusicKey);
      if (currBgMusic.isPaused) currBgMusic.play();
    }
  }
}

export default GameSoundManager;
