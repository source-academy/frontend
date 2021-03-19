import { AnimType, AssetType, ImageAsset } from '../assets/AssetsTypes';
import { AssetKey } from '../commons/CommonTypes';
import { GameItemType } from '../location/GameMapTypes';
import GameGlobalAPI from '../scenes/gameManager/GameGlobalAPI';
import { mandatory } from '../utils/GameUtils';

/**
 *
 */
export default class GameAnimationManager {
  private animationInstanceMap = new Map<AssetKey, Phaser.GameObjects.Sprite>();
  private game = GameGlobalAPI.getInstance().getGameManager();

  /**
   *
   * @param image
   * @param startFrame
   * @param frameRate
   */
  public initiateAnimation(image: ImageAsset, startFrame: number, frameRate: number) {
    const img = GameGlobalAPI.getInstance().getGameMap().getMapAssets().get(image.path);
    if (img && img.config) {
      img.config.start = startFrame;
      img.config.frameRate = frameRate;
    }

    switch (img?.config?.animType) {
      case AnimType.Object:
        const loc = GameGlobalAPI.getInstance().getCurrLocId();
        GameGlobalAPI.getInstance().addItem(GameItemType.objects, loc, image.key);
        break;
      case AnimType.Background:
        GameGlobalAPI.getInstance()
          .getGameManager()
          .getBackgroundManager()
          .renderBackgroundLayerContainer(image.path);
        break;
      default:
        break;
    }
  }

  /**
   *
   * @param image
   * @param startFrame
   * @param frameRate
   */
  public startAnimation(image: ImageAsset, startFrame: number, frameRate: number) {
    // check for animation
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
    sprite.play(image.path);
  }

  /**
   *
   * @param image
   */
  public stopAnimation(image: ImageAsset) {
    const sprite = this.animationInstanceMap.get(image.key);
    if (image.type === AssetType.Sprite && sprite !== undefined && sprite.anims !== undefined) {
      sprite.anims.stop();
    }
  }

  public createImageAsset(
    assetKey: AssetKey,
    image?: ImageAsset
  ): Phaser.GameObjects.Image | Phaser.GameObjects.Sprite {
    switch (image?.type) {
      case AssetType.Sprite:
        this.startAnimation(image, image.config?.start || 0, image.config?.frameRate || 20);
        return this.getAnimation(image);
        break;
      default:
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
   *
   * @param image
   */
  public removeAnimation(image: ImageAsset) {
    const anim = this.animationInstanceMap.get(image.key);
    if (anim !== undefined) {
      this.game.anims.remove(image.path);
      anim.destroy();
      this.animationInstanceMap.delete(image.key);
    }
  }

  /**
   *
   * @param image
   * @returns
   */
  public getAnimation(image: ImageAsset): Phaser.GameObjects.Sprite {
    return mandatory(this.animationInstanceMap.get(image.key), `Image: ${image.path} not found`);
  }
}
