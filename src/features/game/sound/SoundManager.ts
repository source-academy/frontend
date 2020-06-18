import { AssetKey } from '../commons/CommonsTypes';
import commonSoundAssets from '../commons/CommonSoundAssets';

class SoundManager {
  private soundMap: Map<AssetKey, Phaser.Sound.BaseSound>;
  private isMute: boolean;
  private bgMusic: Phaser.Sound.BaseSound | undefined;

  constructor() {
    this.soundMap = new Map<AssetKey, Phaser.Sound.BaseSound>();
    this.isMute = false;
  }

  initialise(scene: Phaser.Scene, bgMusicAsset?: string) {
    commonSoundAssets.forEach(asset => {
      this.soundMap.set(asset.key, scene.sound.add(asset.key));
    });

    // if (bgMusicAsset) {
    //   this.bgMusic = scene.sound.add(bgMusicAsset);
    // }
  }

  playSound(assetKey: string) {
    if (this.soundMap.get(assetKey) && !this.isMute) {
      this.soundMap.get(assetKey)!.play();
    }
  }

  getBgMusic() {
    if (!this.bgMusic) {
      throw new Error('Error: cannot find bg music');
    }
    return this.bgMusic;
  }

  playBgMusic() {
    this.getBgMusic().play({ loop: true });
  }
}

export default SoundManager;
