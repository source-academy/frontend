import { Constants, screenCenter, screenSize } from '../commons/CommonConstants';
import { AssetKey } from '../commons/CommonTypes';
import { fadeIn } from '../effects/FadeEffect';
import { Layer } from '../layer/GameLayerTypes';
import { LocationId } from '../location/GameMapTypes';
import GameGlobalAPI from '../scenes/gameManager/GameGlobalAPI';

export default class GameBackgroundManager {
  public observerId: string;

  constructor() {
    this.observerId = 'GameBackgroundManager';
  }

  public renderBackgroundLayerContainer(locationId: LocationId) {
    const assetKey = GameGlobalAPI.getInstance().getLocationAtId(locationId).assetKey;

    this.renderBackgroundImage(assetKey);
  }

  private renderBackgroundImage(assetKey: AssetKey) {
    GameGlobalAPI.getInstance().clearSeveralLayers([Layer.Background]);
    const gameManager = GameGlobalAPI.getInstance().getGameManager();

    const backgroundAsset = new Phaser.GameObjects.Image(
      gameManager,
      screenCenter.x,
      screenCenter.y,
      assetKey
    )
      .setDisplaySize(screenSize.x, screenSize.y)
      .setAlpha(0);

    gameManager.add.tween(fadeIn([backgroundAsset], Constants.fadeDuration));
    GameGlobalAPI.getInstance().addContainerToLayer(Layer.Background, backgroundAsset);
  }
}
