import { AssetKey, AssetPath, SoundAsset } from '../commons/CommonsTypes';
import game from 'src/pages/academy/game/subcomponents/phaserGame';
import { sleep } from '../utils/GameUtils';
import { musicFadeOutTween, bgMusicFadeDuration } from './GameSoundTypes';

class GameSoundManager {
  private soundAssets: Map<AssetKey, SoundAsset>;
  private baseSoundManager: Phaser.Sound.BaseSoundManager;
  private scene: Phaser.Scene | undefined;

  constructor() {
    this.soundAssets = new Map<AssetKey, SoundAsset>();
    this.baseSoundManager = game.sound;
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
}

export default GameSoundManager;
