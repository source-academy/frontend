import { AnimType, AssetType, ImageAsset } from '../assets/AssetsTypes';
import { AssetKey } from '../commons/CommonTypes';
import { GameItemType } from '../location/GameMapTypes';
import GameGlobalAPI from '../scenes/gameManager/GameGlobalAPI';
import { mandatory } from '../utils/GameUtils';

/**
 * Manager for game animations.
 * Creates Animation instances and stores them in the a
 */
export default class GameAnimationManager {
  private game = GameGlobalAPI.getInstance().getGameManager();
  private animationInstanceMap = new Map<AssetKey, Phaser.GameObjects.Sprite>();

  /**
   * Create an image (Phaser Image or Sprite).
   *
   * @param assetKey asset key of the image to
   * create
   * @param image image asset corresponding to
   * the image to create
   * @returns the instantiated image
   */
  public createImage(
    image: ImageAsset,
    assetKey: AssetKey
  ): Phaser.GameObjects.Image | Phaser.GameObjects.Sprite {
    switch (image.type) {
      case AssetType.Sprite:
        this.createAnimation(image, image.config?.start || 0, image.config?.frameRate || 20);
        return this.getAnimation(image);
        break;
      case AssetType.Image:
        return new Phaser.GameObjects.Image(
          this.game,
          image?.config?.centreX || 0,
          image?.config?.centreY || 0,
          assetKey
        );
        break;
    }
  }

  /**
   * Calls on the game manager for the given
   * animation type (Object or Background) to
   * add the given animation to the scene.
   *
   * @param image image corresponding to the
   * animation to display
   * @param startFrame the frame to start playing
   * the animation from
   * @param frameRate frame rate to play the animation
   * at
   */
  public displayAnimation(image: ImageAsset, startFrame: number, frameRate: number) {
    const img = GameGlobalAPI.getInstance().getAssetByKey(image.path);
    // Update image config
    if (img && img.config) {
      img.config.start = startFrame;
      img.config.frameRate = frameRate;
    }

    switch (img.config?.animType) {
      case AnimType.Object: {
        const currLoc = GameGlobalAPI.getInstance().getCurrLocId();
        GameGlobalAPI.getInstance().addItem(GameItemType.objects, currLoc, image.key);
        break;
      }
      case AnimType.Background:
        GameGlobalAPI.getInstance().renderBackgroundLayerContainer(image.key);
        break;
    }
  }

  /**
   * Create a new Sprite object and store a
   * reference to the instance.
   *
   * @param image image corresponding to a sprite
   * @param startFrame the frame to start playing
   * the animation from
   * @param frameRate frame rate to play the animation
   * at
   */
  private createAnimation(image: ImageAsset, startFrame: number, frameRate: number) {
    if (this.isSprite(image)) {
      this.removeAnimation(image);
      const sprite = new Phaser.GameObjects.Sprite(
        this.game,
        image.config?.centreX || 0,
        image.config?.centreY || 0,
        image.path
      );
      const config = {
        key: image.path,
        frames: this.game.anims.generateFrameNumbers(image.path, {
          start: startFrame,
          end: image.config?.endFrame || 0,
          first: 0
        }),
        frameRate: frameRate,
        repeat: -1
      };
      this.game.anims.create(config);
      this.animationInstanceMap.set(image.key, sprite);
    }
  }

  /**
   * Play an instantiated sprite.
   *
   * @param image image asset corresponding
   * to the sprite to play
   */
  public startAnimation(image: ImageAsset) {
    if (this.isSprite(image)) {
      const sprite = this.getAnimation(image);
      sprite.play(image.path, false);
      this.game.add.existing(sprite);
    }
  }

  /**
   * Stop playing an instantiated sprite.
   *
   * @param image image asset corresponding
   * to the sprite to stop playing
   */
  public stopAnimation(image: ImageAsset) {
    const sprite = this.animationInstanceMap.get(image.key);
    if (this.isSprite(image) && sprite && sprite.anims) {
      sprite.anims.stop();
    }
  }

  /**
   * Destroys and deletes sprite instance corresponding
   * to the the given image asset from the animation
   * instance map.
   *
   * @param image image asset corresponding to the Sprite
   * instance to be deleted
   */
  public removeAnimation(image: ImageAsset) {
    const anim = this.animationInstanceMap.get(image.key);
    if (anim) {
      this.game.anims.remove(image.path);
      anim.destroy();
      this.animationInstanceMap.delete(image.key);
    }
  }

  /**
   * Get the Phaser animation instance corresponding
   * to the given image asset.
   *
   * @param image image asset corresponding to the Sprite
   * instance to be retrieved
   * @returns Instantiated Phaser Sprite object corresponding
   * to given image
   */
  public getAnimation(image: ImageAsset): Phaser.GameObjects.Sprite {
    return mandatory(this.animationInstanceMap.get(image.key), `Image: ${image.path} not found`);
  }

  /**
   * Checks whether given image is a sprite
   *
   * @param image
   * @returns true iff image is a sprite
   */
  private isSprite = (image: ImageAsset) => image.type === AssetType.Sprite;
}
