import { screenCenter, screenSize } from '../commons/CommonConstants';
import { LocationId } from '../location/GameMapTypes';
import { AssetKey } from '../commons/CommonsTypes';
import GameActionManager from '../action/GameActionManager';
import { Layer } from '../layer/GameLayerTypes';

export default class GameBackgroundManager {
  public observerId: string;

  constructor() {
    this.observerId = 'GameBackgroundManager';
  }

  public renderBackgroundLayerContainer(locationId: LocationId) {
    const assetKey = GameActionManager.getInstance().getLocationAtId(locationId).assetKey;
    this.renderBackgroundImage(assetKey);
  }
  private renderBackgroundImage(assetKey: AssetKey) {
    const gameManager = GameActionManager.getInstance().getGameManager();

    const backgroundAsset = new Phaser.GameObjects.Image(
      gameManager,
      screenCenter.x,
      screenCenter.y,
      assetKey
    ).setDisplaySize(screenSize.x, screenSize.y);
    GameActionManager.getInstance().addContainerToLayer(Layer.Background, backgroundAsset);
  }
}
