import { screenCenter, screenSize, Constants } from '../commons/CommonConstants';
import { LocationId } from '../location/GameMapTypes';
import { AssetKey } from '../commons/CommonsTypes';
import GameActionManager from '../action/GameActionManager';
import { Layer } from '../layer/GameLayerTypes';
import { fadeIn, whiteScreen, fadeOut } from '../effects/FadeEffect';

export default class GameBackgroundManager {
  public observerId: string;

  constructor() {
    this.observerId = 'GameBackgroundManager';
  }

  public renderBackgroundLayerContainer(locationId: LocationId) {
    const assetKey = GameActionManager.getInstance().getLocationAtId(locationId).assetKey;

    this.renderBackgroundImage(assetKey);
  }

  public flashBackgroundImage(
    assetKey: AssetKey,
    duration = 2000,
    fadeDuration: number = Constants.fadeDuration
  ) {
    const gameManager = GameActionManager.getInstance().getGameManager();
    const whiteScreenBg = whiteScreen(gameManager).setAlpha(0);
    const momentaryBg = new Phaser.GameObjects.Image(
      gameManager,
      screenCenter.x,
      screenCenter.y,
      assetKey
    )
      .setDisplaySize(screenSize.x, screenSize.y)
      .setAlpha(0);

    GameActionManager.getInstance().addContainerToLayer(Layer.Background, momentaryBg);
    GameActionManager.getInstance().addContainerToLayer(Layer.Background, whiteScreenBg);

    // Fade in-out logic
    gameManager.add.tween(fadeIn([momentaryBg], fadeDuration));
    gameManager.add.tween(fadeIn([whiteScreenBg], fadeDuration));
    setTimeout(() => gameManager.add.tween(fadeOut([whiteScreenBg], fadeDuration)), fadeDuration);
    setTimeout(
      () => gameManager.add.tween(fadeIn([whiteScreenBg], fadeDuration)),
      fadeDuration * 2 + duration
    );
    setTimeout(
      () => gameManager.add.tween(fadeOut([whiteScreenBg], fadeDuration)),
      fadeDuration * 3 + duration
    );

    // Clean up
    setTimeout(() => {
      momentaryBg.destroy();
      whiteScreenBg.destroy();
    }, fadeDuration * 4 + duration);
  }

  private renderBackgroundImage(assetKey: AssetKey) {
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
