import { AssetKey, AssetPath } from 'src/features/game/commons/CommonTypes';

export const loadImage = (scene: Phaser.Scene, assetKey: AssetKey, assetPath: AssetPath) =>
  new Promise<AssetKey>(resolve => {
    if (scene.textures.get(assetKey).key !== '__MISSING') {
      resolve(assetKey);
    } else {
      scene.load.image(assetKey, assetPath);
      scene.load.once('filecomplete', resolve);
      scene.load.start();
    }
  });

export const loadText = (scene: Phaser.Scene, assetKey: AssetKey, assetPath: AssetPath) =>
  new Promise<AssetKey>(resolve => {
    if (scene.cache.text.exists(assetKey)) {
      resolve(assetKey);
    } else {
      scene.load.text(assetKey, assetPath);
      scene.load.once('filecomplete', resolve);
      scene.load.start();
    }
  });

export const loadSound = (scene: Phaser.Scene, assetKey: AssetKey, assetPath: AssetPath) =>
  new Promise<AssetKey>(resolve => {
    if (scene.sound.get(assetKey) !== null) {
      resolve(assetKey);
    } else {
      scene.load.audio(assetKey, assetPath);
      scene.load.once('filecomplete', resolve);
      scene.load.start();
    }
  });
