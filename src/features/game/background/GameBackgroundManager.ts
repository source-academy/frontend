import { screenCenter, screenSize, Constants } from '../commons/CommonConstants';
import { LocationId } from '../location/GameMapTypes';
import { AssetKey } from '../commons/CommonsTypes';
import { Layer } from '../layer/GameLayerTypes';
import { fadeIn } from '../effects/FadeEffect';
import GameManager from '../scenes/gameManager/GameManager';

export default class GameBackgroundManager {
  public observerId: string;
  private gameManager: GameManager;

  constructor(gameManager: GameManager) {
    this.gameManager = gameManager;
    this.observerId = 'GameBackgroundManager';
  }

  public renderBackgroundLayerContainer(locationId: LocationId) {
    const assetKey = this.gameManager.currentCheckpoint.map.getLocationAtId(locationId).assetKey;
    this.renderBackgroundImage(assetKey);
  }

  private renderBackgroundImage(assetKey: AssetKey) {
    this.gameManager.getLayerManager().clearSeveralLayers([Layer.Background]);

    const backgroundAsset = new Phaser.GameObjects.Image(
      this.gameManager,
      screenCenter.x,
      screenCenter.y,
      assetKey
    )
      .setDisplaySize(screenSize.x, screenSize.y)
      .setAlpha(0);

    this.gameManager.add.tween(fadeIn([backgroundAsset], Constants.fadeDuration));
    this.gameManager.getLayerManager().addToLayer(Layer.Background, backgroundAsset);
  }
}
