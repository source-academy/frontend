import ImageAssets from '../assets/ImageAssets';
import SoundAssets from '../assets/SoundAssets';
import { Constants } from '../commons/CommonConstants';
import { GamePosition, GameSize, ItemId } from '../commons/CommonTypes';
import { scrollEntry, scrollExit } from '../effects/ScrollEffect';
import { Layer } from '../layer/GameLayerTypes';
import GameGlobalAPI from '../scenes/gameManager/GameGlobalAPI';
import { sleep } from '../utils/GameUtils';
import { resizeUnderflow } from '../utils/SpriteUtils';
import PopUpConstants from './GamePopUpConstants';

/**
 * Manager in charge of keeping track of the the popups in
 * a game
 */
class GamePopUpManager {
  private currPopUp: Map<GamePosition, Phaser.GameObjects.Container>;

  constructor() {
    this.currPopUp = new Map<GamePosition, Phaser.GameObjects.Container>();
  }

  /**
   * Display a popup image on the screen.
   * The image is based the given ID, while its position
   * is based on the given position.
   *
   * @param itemId item ID to be shown on the pop up
   * @param position position of the pop up
   * @param duration duration in which the pop up to be shown. Afterwards, the popup will
   *                 be destroyed.
   * @param size size of the popup, defaulted to medium.
   */
  public async displayPopUp(
    itemId: ItemId,
    position: GamePosition,
    duration = Constants.popUpDuration,
    size: GameSize = GameSize.Medium
  ) {
    // Destroy previous pop up if any
    this.destroyPopUp(position);

    const gameManager = GameGlobalAPI.getInstance().getGameManager();
    const container = new Phaser.GameObjects.Container(gameManager, 0, 0);

    // Frame
    const popUpFrameImg = new Phaser.GameObjects.Image(
      gameManager,
      PopUpConstants.rect.x[position],
      PopUpConstants.rect.y[size],
      ImageAssets.popUpFrame.key
    ).setScale(PopUpConstants.rect.scale[size]);

    // Get assetKey
    const assetKey = this.getAssetKey(itemId);
    if (!assetKey) return;

    // Set up images
    const popUpImage = new Phaser.GameObjects.Image(
      gameManager,
      PopUpConstants.rect.x[position] + PopUpConstants.image.xOffset,
      PopUpConstants.rect.y[size] + PopUpConstants.image.yOffset,
      assetKey
    );
    const newWidth = PopUpConstants.rect.width * PopUpConstants.rect.scale[size];
    const newHeight = PopUpConstants.rect.height * PopUpConstants.rect.scale[size];
    resizeUnderflow(popUpImage, newWidth, newHeight);

    container.add([popUpFrameImg, popUpImage]);
    this.currPopUp.set(position, container);
    GameGlobalAPI.getInstance().addToLayer(Layer.PopUp, container);
    GameGlobalAPI.getInstance().playSound(SoundAssets.popUpEnter.key);

    container.setActive(true);
    container.setVisible(true);
    container.setScale(1.0, 0);

    gameManager.tweens.add(scrollEntry([container], PopUpConstants.tweenDuration));
    await sleep(PopUpConstants.tweenDuration);

    setTimeout(() => this.destroyPopUp(position), duration);
  }

  /**
   * Destroy all active pop ups at all positions.
   */
  public destroyAllPopUps() {
    this.currPopUp.forEach((popUp, position, map) => {
      this.destroyPopUp(position);
    });
  }

  /**
   * Destroy a pop up at the given position, if any.
   *
   * @param position position of thhe pop up to be destroyed
   */
  public async destroyPopUp(position: GamePosition) {
    const atPosContainer = this.currPopUp.get(position);
    if (!atPosContainer) return;

    GameGlobalAPI.getInstance()
      .getGameManager()
      .tweens.add(scrollExit([atPosContainer], PopUpConstants.tweenDuration));
    await sleep(PopUpConstants.tweenDuration);

    atPosContainer.setVisible(false);
    atPosContainer.setActive(false);
    atPosContainer.destroy();

    this.currPopUp.delete(position);
    GameGlobalAPI.getInstance().playSound(SoundAssets.popUpExit.key);
  }

  /**
   * Get the asset key of the item ID.
   *
   * @param itemId item ID
   */
  private getAssetKey(itemId: ItemId) {
    const objectPropMap = GameGlobalAPI.getInstance().getGameMap().getObjectPropMap();
    const objProp = objectPropMap.get(itemId);
    if (objProp) {
      return objProp.assetKey;
    }
    return undefined;
  }
}

export default GamePopUpManager;
