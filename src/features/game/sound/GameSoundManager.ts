import { AssetKey, AssetPath, SoundAsset } from '../commons/CommonsTypes';
import phaserGame from 'src/pages/academy/game/subcomponents/phaserGame';
import { sleep } from '../utils/GameUtils';
import { musicFadeOutTween, bgMusicFadeDuration } from './GameSoundTypes';

class GameSoundManager {
  private soundAssets: Map<AssetKey, SoundAsset>;
  private soundManager: Phaser.Sound.BaseSoundManager;
  private currBgMusicKey: AssetKey | undefined;
  private currBgMusic: Phaser.Sound.BaseSound | undefined;
  private scene: Phaser.Scene | undefined;

  constructor() {
    this.soundAssets = new Map<AssetKey, SoundAsset>();
    this.soundManager = phaserGame.sound;
    this.currBgMusicKey = undefined;
    this.currBgMusic = undefined;
    this.scene = undefined;
  }

  public initialise(scene: Phaser.Scene) {
    this.scene = scene;
    this.clearSoundAssets();
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

  public loadSound(assetKey: AssetKey, assetPath: AssetPath) {
    if (this.scene) {
      this.scene.load.audio(assetKey, assetPath);
    }
  }

  public playSound(soundKey: AssetKey) {
    if (this.scene) {
      const soundAsset = this.soundAssets.get(soundKey);
      if (soundAsset) {
        this.soundManager.play(soundAsset.key, soundAsset.config);
      }
    }
  }

  public playBgMusic(soundKey: AssetKey) {
    this.stopCurrBgMusic();
    this.currBgMusic = this.soundManager.add(soundKey, { loop: true });
    this.currBgMusicKey = soundKey;
  }

  public async stopCurrBgMusic(fadeDuration: number = bgMusicFadeDuration) {
    if (this.scene && this.currBgMusicKey && this.currBgMusic) {
      this.scene.tweens.add({
        targets: this.currBgMusic,
        ...musicFadeOutTween,
        duration: fadeDuration
      });
    }

    await sleep(fadeDuration);

    if (this.currBgMusicKey) {
      this.soundManager.stopByKey(this.currBgMusicKey);
      this.currBgMusicKey = undefined;
      this.currBgMusic = undefined;
    }
  }
}

export default GameSoundManager;
