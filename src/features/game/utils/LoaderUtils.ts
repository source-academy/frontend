import { AssetKey, AssetPath } from 'src/features/game/commons/CommonTypes';

/**
 * The functions below loads assets, and and only resolves
 * once the assets are loaded.
 * If the assets have already been loaded previously,
 * then the promise is resolved instantly.
 *
 * To use these functions, call the line "await loadImage(...)"
 * inside an async function
 */

/**
 * Waits for an image (with assetkey, assetpath) to load in scene
 *
 * @param scene scene where to load this asset
 * @param assetKey the key to be used
 * @param assetPath the path to the file
 * @returns {Promise} promise that resolves when image is loaded.
 */
export const loadImage = (scene: Phaser.Scene, assetKey: AssetKey, assetPath: AssetPath) =>
  new Promise<AssetKey>(resolve => {
    if (scene.textures.get(assetKey).key !== '__MISSING') {
      resolve(assetKey);
    } else {
      scene.load.image(assetKey, assetPath);
      scene.load.once(`filecomplete-image-${assetKey}`, resolve);
      scene.load.once(`loaderror`, resolve);
      scene.load.start();
    }
  });

/**
 * Waits for a text (with assetkey, assetpath) to load in scene
 *
 * @param scene scene where to load this asset
 * @param assetKey the key to be used
 * @param assetPath the path to the file
 * @returns {Promise} promise that resolves when text is loaded.
 */
export const loadText = (scene: Phaser.Scene, assetKey: AssetKey, assetPath: AssetPath) =>
  new Promise<AssetKey>(resolve => {
    if (scene.cache.text.exists(assetKey)) {
      resolve(assetKey);
    } else {
      scene.load.text(assetKey, assetPath);
      scene.load.once(`filecomplete-text-${assetKey}`, resolve);
      scene.load.start();
    }
  });

/**
 * Waits for a sound (with assetkey, assetpath) to load in scene
 *
 * @param scene scene where to load this asset
 * @param assetKey the key to be used
 * @param assetPath the path to the file
 * @returns {Promise} promise that resolves when sound is loaded.
 */
export const loadSound = (scene: Phaser.Scene, assetKey: AssetKey, assetPath: AssetPath) =>
  new Promise<AssetKey>(resolve => {
    if (scene.sound.get(assetKey) !== null) {
      resolve(assetKey);
    } else {
      scene.load.audio(assetKey, assetPath).on('filecomplete', resolve);
      scene.load.start();
    }
  });

/**
 * Waits for an spritesheet (with assetkey, assetpath, and config) to load in scene
 *
 * @param scene scene where to load this asset
 * @param assetKey the key to be used
 * @param assetPath the path to the file
 * @param config spritesheet config
 * @returns {Promise} promise that resolves when spritesheet is loaded.
 */
export const loadSpritesheet = (
  scene: Phaser.Scene,
  assetKey: AssetKey,
  assetPath: AssetPath,
  config: any
) =>
  new Promise<AssetKey>(resolve => {
    if (scene.textures.get(assetKey).key !== '__MISSING') {
      resolve(assetKey);
    } else {
      scene.load.spritesheet(assetKey, assetPath, config);
      scene.load.once(`filecomplete-spritesheet-${assetKey}`, resolve);
      scene.load.once(`loaderror`, resolve);
      scene.load.start();
    }
  });
