import { screenCenter, screenSize } from '../commons/CommonConstants';
import { AssetKey, AssetTypes } from '../commons/CommonTypes';
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
  load: any;
  backgroundAsset?: Phaser.GameObjects.Image | Phaser.GameObjects.Sprite;

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
    const picture = GameGlobalAPI.getInstance().getGameMap().getMapAssets().get(assetKey);
    // this.backgroundAsset: Phaser.GameObjects.Image | Phaser.GameObjects.Sprite;

    switch (picture?.assetType) {
      case AssetTypes.Sprite:
        this.backgroundAsset = new Phaser.GameObjects.Sprite(
          GameGlobalAPI.getInstance().getGameManager(),
          screenCenter.x,
          screenCenter.y,
          assetKey
        );
        break;
      default:
        this.backgroundAsset = new Phaser.GameObjects.Image(
          GameGlobalAPI.getInstance().getGameManager(),
          screenCenter.x,
          screenCenter.y,
          assetKey
        );
        resizeOverflow(this.backgroundAsset, screenSize.x, screenSize.y);
        break;
    }

    GameGlobalAPI.getInstance().addToLayer(Layer.Background, this.backgroundAsset);
    GameGlobalAPI.getInstance().fadeInLayer(Layer.Background);
    const game = GameGlobalAPI.getInstance().getGameManager();

    if (this.backgroundAsset instanceof Phaser.GameObjects.Sprite) {
      const config = {
        key: assetKey,
        frames: game.anims.generateFrameNumbers(assetKey, {
          start: 0,
          end: picture?.assetConfig.endFrame,
          first: 0
        }),
        frameRate: 20,
        repeat: -1
      };

      game.anims.create(config);
      this.backgroundAsset.play(assetKey);
    }
  }

  // public isBackgroundAnimas = () => this.backgroundAsset instanceof Phaser.GameObjects.Sprite;
  // public isPlaying = () => this.backgroundAsset.
}
