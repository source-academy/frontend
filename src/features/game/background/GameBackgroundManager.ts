import { ImageAsset } from '../assets/AssetsTypes';
import { screenSize } from '../commons/CommonConstants';
import { AssetKey } from '../commons/CommonTypes';
import { Layer } from '../layer/GameLayerTypes';
import { LocationId } from '../location/GameMapTypes';
import GameGlobalAPI from '../scenes/gameManager/GameGlobalAPI';
import { resizeOverflow } from '../utils/SpriteUtils';

/**
 * Manager for game's background.
 * Loads the background for a location on navigate and change_background action.
 */
export default class GameBackgroundManager {
  private currentBackground?: ImageAsset;
  /**
   * Render the background with the asset attached to the location ID.
   *
   * @param locationId id of the location
   */
  public renderBackgroundLayerContainer(locationId: LocationId) {
    const assetKey = GameGlobalAPI.getInstance().getLocationAtId(locationId).assetKey;

    this.renderBackgroundImage(assetKey);
  }

  /**
   * Render the background with the image associated with the asset key.
   * The image will be resized (overflow) to fit the screen.
   *
   * @param assetKey key of the image
   */
  private renderBackgroundImage(assetKey: AssetKey) {
    GameGlobalAPI.getInstance().clearSeveralLayers([Layer.Background]);
    this.currentBackground = GameGlobalAPI.getInstance().getAssetByKey(assetKey);
    const animationManager = GameGlobalAPI.getInstance().getGameManager().getAnimationManager();
    let asset: Phaser.GameObjects.Image | Phaser.GameObjects.Sprite | undefined;

    if (this.currentBackground) {
      asset = animationManager.createImage(this.currentBackground, assetKey);
      animationManager.startAnimation(this.currentBackground);

      resizeOverflow(asset, screenSize.x, screenSize.y);
      GameGlobalAPI.getInstance().addToLayer(Layer.Background, asset);
      GameGlobalAPI.getInstance().fadeInLayer(Layer.Background);
    }
  }
}
