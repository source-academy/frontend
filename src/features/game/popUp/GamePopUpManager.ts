import { ItemId, GameSprite } from '../commons/CommonsTypes';
import { PopUpPosition } from './GamePopUpTypes';
import { Layer } from '../layer/GameLayerTypes';
import GameActionManager from '../action/GameActionManager';
import { sleep } from '../utils/GameUtils';
import { popUpFrame } from '../commons/CommonAssets';
import { popUpRect, popUpImgXOffset, popUpImgYOffset } from './GamePopUpConstants';
import { resize } from '../utils/SpriteUtils';
import { Constants } from '../commons/CommonConstants';

class GamePopUpManager {
  private currPopUp: Map<PopUpPosition, Phaser.GameObjects.Container>;
  private popUpFrame: GameSprite;

  constructor() {
    this.currPopUp = new Map<PopUpPosition, Phaser.GameObjects.Container>();
    this.popUpFrame = {
      assetKey: popUpFrame.key,
      assetXPos: popUpRect.x[PopUpPosition.Middle],
      assetYPos: popUpRect.y
    };
  }

  public displayPopUp(itemId: ItemId, position: PopUpPosition, duration = Constants.popupDuration) {
    // Destroy previous pop up if any
    this.destroyPopUp(position);

    const gameManager = GameActionManager.getInstance().getGameManager();
    const container = new Phaser.GameObjects.Container(gameManager, 0, 0);

    // Frame
    const popUpFrameImg = new Phaser.GameObjects.Image(
      gameManager,
      popUpRect.x[position],
      this.popUpFrame.assetYPos,
      this.popUpFrame.assetKey
    );

    // Get assetKey
    const assetKey = this.getAssetKey(itemId);
    if (!assetKey) return;

    const popUpImage = new Phaser.GameObjects.Image(
      gameManager,
      popUpRect.x[position] + popUpImgXOffset,
      this.popUpFrame.assetYPos + popUpImgYOffset,
      assetKey
    );

    const resizedImage = popUpImage;
    if (popUpImage.displayWidth > popUpImage.displayHeight) {
      resize(popUpImage, popUpRect.width);
    } else {
      resize(popUpImage, 0, popUpRect.height);
    }

    container.add([popUpFrameImg, resizedImage]);
    this.currPopUp.set(position, container);
    GameActionManager.getInstance().addContainerToLayer(Layer.PopUp, container);

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
    const objectPropMap = GameActionManager.getInstance()
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
