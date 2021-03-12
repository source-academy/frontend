import { AssetType, ImageAsset } from '../assets/AssetsTypes';
import { AssetKey } from '../commons/CommonTypes';
import { GameItemType } from '../location/GameMapTypes';
import GameGlobalAPI from '../scenes/gameManager/GameGlobalAPI';
import { mandatory } from '../utils/GameUtils';
export default class GameAnimationManager {
  private animationInstanceMap = new Map<AssetKey, Phaser.GameObjects.Sprite>();
  private game = GameGlobalAPI.getInstance().getGameManager();

  public initiateAnimation(
    image: ImageAsset,
    startFrame: number,
    frameRate: number,
    assetCategory: string
  ) {
    const img = GameGlobalAPI.getInstance().getGameMap().getMapAssets().get(image.path);
    if (img && img.config) {
      img.config.start = startFrame;
      img.config.frameRate = frameRate;
    }

    if (assetCategory === 'Object') {
      const loc = GameGlobalAPI.getInstance().getCurrLocId();
      GameGlobalAPI.getInstance().addItem(GameItemType.objects, loc, image.key);
    } else if (assetCategory === 'Background') {
      GameGlobalAPI.getInstance()
        .getGameManager()
        .getBackgroundManager()
        .renderBackgroundLayerContainer(image.path);
    }
  }

  public startAnimation(image: ImageAsset, startFrame: number, frameRate: number) {
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

  public stopAnimation(image: ImageAsset) {
    const sprite = this.animationInstanceMap.get(image.key);
    if (image.type === AssetType.Sprite && sprite !== undefined && sprite.anims !== undefined) {
      console.log(sprite);
      console.log(sprite.anims);
      sprite.anims.stop();
    }
  }

  public getAnimation(image: ImageAsset): Phaser.GameObjects.Sprite {
    return mandatory(this.animationInstanceMap.get(image.key), `Image: ${image.path} not found`);
  }

  public removeAnimation(image: ImageAsset) {
    const anim = this.animationInstanceMap.get(image.key);
    if (anim !== undefined) {
      this.game.anims.remove(image.path);
      anim.destroy();
      this.animationInstanceMap.delete(image.key);
    }
  }
}
