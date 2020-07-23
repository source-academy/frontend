import { screenCenter, screenSize } from '../commons/CommonConstants';
import { AssetKey } from '../commons/CommonTypes';
import { Layer } from '../layer/GameLayerTypes';
import { LocationId } from '../location/GameMapTypes';
import GameGlobalAPI from '../scenes/gameManager/GameGlobalAPI';
import { resizeOverflow } from '../utils/SpriteUtils';

/**
 * Manager for game's background.
 * Loads the background for a location on navigate and change_location action.
 */
export default class GameBackgroundManager {
  public observerId: string;

  constructor() {
    this.observerId = 'GameBackgroundManager';
  }

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

    const backgroundAsset = new Phaser.GameObjects.Image(
      GameGlobalAPI.getInstance().getGameManager(),
      screenCenter.x,
      screenCenter.y,
      assetKey
    );
    resizeOverflow(backgroundAsset, screenSize.x, screenSize.y);

    GameGlobalAPI.getInstance().addContainerToLayer(Layer.Background, backgroundAsset);
    GameGlobalAPI.getInstance().fadeInLayer(Layer.Background);
  }
}
