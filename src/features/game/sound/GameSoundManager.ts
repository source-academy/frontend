import { AssetKey, AssetPath } from '../commons/CommonsTypes';
import phaserGame from 'src/pages/academy/game/subcomponents/phaserGame';
import { sleep } from '../utils/GameUtils';

class GameSoundManager {
  private soundManager: Phaser.Sound.BaseSoundManager;
  private currBgMusicKey: AssetKey | undefined;
  private currBgMusic: Phaser.Sound.BaseSound | undefined;
  private scene: Phaser.Scene | undefined;

  constructor() {
    this.soundManager = phaserGame.sound;
    this.currBgMusicKey = undefined;
    this.currBgMusic = undefined;
    this.scene = undefined;
  }

  public initialise(scene: Phaser.Scene) {
    this.scene = scene;
  }

  public loadSounds(soundMap: Map<AssetKey, AssetPath>) {
    soundMap.forEach((path, key, map) => this.loadSound(key, path));
  }

  public loadSound(assetKey: AssetKey, assetPath: AssetPath) {
    if (this.scene) {
      this.scene.load.audio(assetKey, assetPath);
    }
  }

  public playSound(soundKey: AssetKey) {
    if (this.scene) {
      this.soundManager.play(soundKey);
    }
  }

  public playBgMusic(soundKey: AssetKey) {
    this.stopCurrBgMusic();
    this.currBgMusic = this.soundManager.add(soundKey, { loop: true });
  }

  public async stopCurrBgMusic(fadeDuration: number = 1000) {
    if (this.scene && this.currBgMusic) {
      this.scene.tweens.add({
        targets: this.currBgMusic,
        volume: 0
      });
    }
    await sleep(fadeDuration);
    if (this.currBgMusicKey) {
      this.soundManager.stopByKey(this.currBgMusicKey);
    }
  }
}

export default GameSoundManager;
