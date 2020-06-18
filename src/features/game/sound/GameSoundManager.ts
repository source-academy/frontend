import { AssetKey, AssetPath, SoundAsset } from '../commons/CommonsTypes';
import phaserGame from 'src/pages/academy/game/subcomponents/phaserGame';
import { sleep } from '../utils/GameUtils';
import { musicFadeOutTween, bgMusicFadeDuration } from './GameSoundTypes';

class GameSoundManager {
  private soundAssets: Map<AssetKey, SoundAsset>;
  private baseSoundManager: Phaser.Sound.BaseSoundManager;
  private currBgMusicKey: AssetKey | undefined;
  private currBgMusic: Phaser.Sound.BaseSound | undefined;
  private scene: Phaser.Scene | undefined;

  constructor() {
    this.soundAssets = new Map<AssetKey, SoundAsset>();
    this.baseSoundManager = phaserGame.sound;
    this.currBgMusicKey = undefined;
    this.currBgMusic = undefined;
    this.scene = undefined;
  }

  public initialise(scene: Phaser.Scene) {
    this.scene = scene;
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
    this.stopCurrBgMusic();
    const soundAsset = this.soundAssets.get(soundKey);
    if (soundAsset) {
      console.log("BGM Music is valid");
      this.currBgMusic = this.baseSoundManager.add(soundAsset.key, soundAsset.config);
      this.currBgMusic.play();
      this.currBgMusicKey = soundKey;
    }
  }

  public async stopCurrBgMusic(fadeDuration: number = bgMusicFadeDuration) {
    if (this.scene && this.currBgMusicKey && this.currBgMusic) {
      // If the reference to currentBgMusic survives (within the same scene)
      // we selectively fade out the background music

      this.scene.tweens.add({
        targets: this.currBgMusic,
        ...musicFadeOutTween,
        duration: fadeDuration
      });

      await sleep(fadeDuration);
    }

    if (this.currBgMusicKey) {
      this.baseSoundManager.stopByKey(this.currBgMusicKey);
      this.currBgMusicKey = undefined;
      this.currBgMusic = undefined;
    }
  }

  public async stopAllSound() {
    this.baseSoundManager.stopAll();
  }
}

export default GameSoundManager;
