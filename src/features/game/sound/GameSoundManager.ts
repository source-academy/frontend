import { AssetKey } from '../commons/CommonsTypes';
import commonSoundAssets from '../commons/CommonSoundAssets';

class SoundManager {
  private soundMap: Map<AssetKey, Phaser.Sound.BaseSound>;
  private isMute: boolean;

  constructor() {
    this.soundMap = new Map<AssetKey, Phaser.Sound.BaseSound>();
    this.isMute = false;
  }

  initialise(scene: Phaser.Scene) {
    commonSoundAssets.forEach(asset => {
      this.soundMap.set(asset.key, scene.sound.add(asset.key));
    });
  }

  playSound(assetKey: string) {
    if (this.soundMap.get(assetKey) && !this.isMute) {
      this.soundMap.get(assetKey)!.play();
    }
  }
}

export default SoundManager;
