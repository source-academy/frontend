import { screenCenter, screenSize } from '../commons/CommonConstants';
import { AssetKey, AssetTypes, PictureAsset } from '../commons/CommonTypes';
import { Layer } from '../layer/GameLayerTypes';
import { LocationId } from '../location/GameMapTypes';
import GameGlobalAPI from '../scenes/gameManager/GameGlobalAPI';
import { mandatory } from '../utils/GameUtils';
import { resizeOverflow } from '../utils/SpriteUtils';
// import { GameInputManager } from '..\input\GameInputManager.ts'

/**
 * Manager for game's background.
 * Loads the background for a location on navigate and change_background action.
 */
export default class GameBackgroundManager {
  private backgroundPicture?: PictureAsset;
  private backgroundAsset?: Phaser.GameObjects.Image | Phaser.GameObjects.Sprite;

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
    this.backgroundPicture = GameGlobalAPI.getInstance().getGameMap().getMapAssets().get(assetKey);

    switch (this.backgroundPicture?.assetType) {
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
    console.log(assetKey);
    this.startAnimation(assetKey, 0, 20);
  }

  public startAnimation(assetKey: AssetKey, startFrame: number, frameRate: number) {
    const game = GameGlobalAPI.getInstance().getGameManager();
    //const assetKey = GameGlobalAPI.getInstance().getLocationAtId(locationId).assetKey;
    this.backgroundPicture = GameGlobalAPI.getInstance().getGameMap().getMapAssets().get(assetKey);
    console.log(this.backgroundPicture);
    if (this.backgroundPicture?.assetType === AssetTypes.Sprite) {
      console.log('here');
      GameGlobalAPI.getInstance().clearSeveralLayers([Layer.Background]);
      this.backgroundAsset = new Phaser.GameObjects.Sprite(
        game,
        screenCenter.x,
        screenCenter.y,
        assetKey
      );

      if (this.backgroundAsset instanceof Phaser.GameObjects.Sprite) {
        const config = {
          key: assetKey,
          frames: game.anims.generateFrameNumbers(assetKey, {
            start: startFrame,
            end: this.backgroundPicture?.assetConfig.endFrame,
            first: 0
          }),
          frameRate: frameRate,
          repeat: -1
        };

        GameGlobalAPI.getInstance().addToLayer(Layer.Background, this.backgroundAsset);
        GameGlobalAPI.getInstance().fadeInLayer(Layer.Background);

        game.anims.create(config);
        this.backgroundAsset.play(assetKey);
      }
    }
  }

  public stopAnimation() {
    if (this.backgroundAsset instanceof Phaser.GameObjects.Sprite) {
      if (this.backgroundAsset.anims.isPlaying) {
        this.backgroundAsset.anims.stop();
      }
    }
  }

  // public isBackgroundAnimas = () => this.backgroundAsset instanceof Phaser.GameObjects.Sprite;
  // public isPlaying = () => this.backgroundAsset.
  public getBackgroundAsset = () => mandatory(this.backgroundAsset);
}
