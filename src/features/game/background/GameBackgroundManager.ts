import { screenCenter, screenSize, Constants } from '../commons/CommonConstants';
import { LocationId } from '../location/GameMapTypes';
import { AssetKey } from '../commons/CommonTypes';
import GameActionManager from '../action/GameActionManager';
import { Layer } from '../layer/GameLayerTypes';
import { fadeIn } from '../effects/FadeEffect';

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
    GameActionManager.getInstance().clearSeveralLayers([Layer.Background]);
    const gameManager = GameActionManager.getInstance().getGameManager();

    const backgroundAsset = new Phaser.GameObjects.Image(
      gameManager,
      screenCenter.x,
      screenCenter.y,
      assetKey
    )
      .setDisplaySize(screenSize.x, screenSize.y)
      .setAlpha(0);

    gameManager.add.tween(fadeIn([backgroundAsset], Constants.fadeDuration));
    GameActionManager.getInstance().addContainerToLayer(Layer.Background, backgroundAsset);
  }
}
