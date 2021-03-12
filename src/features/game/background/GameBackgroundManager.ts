import { AssetType, ImageAsset } from '../assets/AssetsTypes';
import { screenCenter, screenSize } from '../commons/CommonConstants';
import { AssetKey } from '../commons/CommonTypes';
import { Layer } from '../layer/GameLayerTypes';
import { LocationId } from '../location/GameMapTypes';
import GameGlobalAPI from '../scenes/gameManager/GameGlobalAPI';
import { resizeOverflow } from '../utils/SpriteUtils';
// import { GameInputManager } from '..\input\GameInputManager.ts'

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
    this.currentBackground = GameGlobalAPI.getInstance().getGameMap().getMapAssets().get(assetKey);
    let asset: Phaser.GameObjects.Image | Phaser.GameObjects.Sprite;

    switch (this.currentBackground?.type) {
      case AssetType.Sprite:
        const animationManager = GameGlobalAPI.getInstance().getGameManager().getAnimationManager();
        animationManager.startAnimation(this.currentBackground, 0, 20);
        asset = animationManager.getAnimation(this.currentBackground);
        break;
      default:
        asset = new Phaser.GameObjects.Image(
          GameGlobalAPI.getInstance().getGameManager(),
          screenCenter.x,
          screenCenter.y,
          assetKey
        );
        resizeOverflow(asset, screenSize.x, screenSize.y);
        break;
    }

    GameGlobalAPI.getInstance().addToLayer(Layer.Background, asset);
    GameGlobalAPI.getInstance().fadeInLayer(Layer.Background);
  }

  public getLocationAssetKey = (locId: LocationId) => {
    return GameGlobalAPI.getInstance().getGameMap().getLocationAtId(locId).assetKey;
  };
}
