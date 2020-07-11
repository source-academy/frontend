import { ItemId, GameSprite } from '../commons/CommonTypes';
import { PopUpPosition } from './GamePopUpTypes';
import { Layer } from '../layer/GameLayerTypes';
import GameGlobalAPI from '../scenes/gameManager/GameGlobalAPI';
import { sleep } from '../utils/GameUtils';
import popUpConstants from './GamePopUpConstants';
import { resizeUnderflow } from '../utils/SpriteUtils';
import { Constants } from '../commons/CommonConstants';
import ImageAssets from '../assets/ImageAssets';

class GamePopUpManager {
  private currPopUp: Map<PopUpPosition, Phaser.GameObjects.Container>;
  private popUpFrame: GameSprite;

  constructor() {
    this.currPopUp = new Map<PopUpPosition, Phaser.GameObjects.Container>();
    this.popUpFrame = {
      assetKey: ImageAssets.popUpFrame.key,
      assetXPos: popUpConstants.rect.x[PopUpPosition.Middle],
      assetYPos: popUpConstants.rect.y
    };
  }

  public displayPopUp(itemId: ItemId, position: PopUpPosition, duration = Constants.popupDuration) {
    // Destroy previous pop up if any
    this.destroyPopUp(position);

    const gameManager = GameGlobalAPI.getInstance().getGameManager();
    const container = new Phaser.GameObjects.Container(gameManager, 0, 0);

    // Frame
    const popUpFrameImg = new Phaser.GameObjects.Image(
      gameManager,
      popUpConstants.rect.x[position],
      this.popUpFrame.assetYPos,
      this.popUpFrame.assetKey
    );

    // Get assetKey
    const assetKey = this.getAssetKey(itemId);
    if (!assetKey) return;

    const popUpImage = new Phaser.GameObjects.Image(
      gameManager,
      popUpConstants.rect.x[position] + popUpConstants.imgXOffset,
      this.popUpFrame.assetYPos + popUpConstants.imgYOffset,
      assetKey
    );
    resizeUnderflow(popUpImage, popUpConstants.rect.width, popUpConstants.rect.height);

    container.add([popUpFrameImg, popUpImage]);
    this.currPopUp.set(position, container);
    GameGlobalAPI.getInstance().addContainerToLayer(Layer.PopUp, container);

    // TODO: Animate

    container.setActive(true);
    container.setVisible(true);

    setTimeout(() => this.destroyPopUp(position), duration);
  }

  public destroyAllPopUps() {
    this.currPopUp.forEach((popUp, position, map) => {
      this.destroyPopUp(position);
    });
  }

  public async destroyPopUp(position: PopUpPosition) {
    const atPosContainer = this.currPopUp.get(position);
    if (!atPosContainer) return;

    // TODO: Animate out

    await sleep(200);
    atPosContainer.setVisible(false);
    atPosContainer.setActive(false);
    atPosContainer.destroy();

    this.currPopUp.delete(position);
  }

  private getAssetKey(itemId: ItemId) {
    const objectPropMap = GameGlobalAPI.getInstance()
      .getGameManager()
      .getCurrentCheckpoint()
      .map.getObjects();
    const objProp = objectPropMap.get(itemId);
    if (objProp) {
      return objProp.assetKey;
    }
    return undefined;
  }
}

export default GamePopUpManager;
