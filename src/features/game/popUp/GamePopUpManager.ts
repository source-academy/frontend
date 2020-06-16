import { ItemId, GameSprite } from '../commons/CommonsTypes';
import { PopUpPosition } from './GamePopUpTypes';
import { Layer } from '../layer/GameLayerTypes';
import GameActionManager from '../action/GameActionManager';
import { sleep } from '../utils/GameUtils';
import { popUpFrame } from '../commons/CommonAssets';
import { popUpPos } from './GamePopUpConstants';

class GamePopUpManager {
  private currPopUp: Map<PopUpPosition, Phaser.GameObjects.Container>;
  private popUpFrame: GameSprite;

  constructor() {
    this.currPopUp = new Map<PopUpPosition, Phaser.GameObjects.Container>();
    this.popUpFrame = {
      assetKey: popUpFrame.key,
      assetXPos: popUpPos.x[PopUpPosition.Middle],
      assetYPos: popUpPos.y
    };
  }

  public displayPopUp(itemId: ItemId, position: PopUpPosition) {
    // Destroy previous pop up if any
    this.destroyPopUp(position);

    const gameManager = GameActionManager.getInstance().getGameManager();
    const container = new Phaser.GameObjects.Container(gameManager, 0, 0);

    // Frame
    const popUpFrameImg = new Phaser.GameObjects.Image(
      gameManager,
      popUpPos.x[position],
      this.popUpFrame.assetYPos,
      this.popUpFrame.assetKey
    );

    // Get assetKey
    const assetKey = this.getAssetKey(itemId);
    if (!assetKey) return;

    const popUpImage = new Phaser.GameObjects.Image(
      gameManager,
      popUpPos.x[position],
      this.popUpFrame.assetYPos,
      assetKey
    );

    container.add([popUpFrameImg, popUpImage]);
    this.currPopUp.set(position, container);
    GameActionManager.getInstance().addContainerToLayer(Layer.PopUp, container);

    // Animate
    
    container.setActive(true);
    container.setVisible(true);
  }

  public destroyAllPopUps() {
    this.currPopUp.forEach((popUp, position, map) => {
      this.destroyPopUp(position);
    });
  }

  public async destroyPopUp(position: PopUpPosition) {
    const atPosContainer = this.currPopUp.get(position);
    if (!atPosContainer) return;

    // Animate out

    await sleep(200);
    atPosContainer.setVisible(false);
    atPosContainer.setActive(false);
    atPosContainer.destroy();
  }

  private getAssetKey(itemId: ItemId) {
    const objectPropMap = GameActionManager.getInstance()
      .getGameManager()
      .currentChapter.map.getObjects();
    const objProp = objectPropMap.get(itemId);
    if (objProp) {
      return objProp.assetKey;
    }
    return undefined;
  }
}

export default GamePopUpManager;
