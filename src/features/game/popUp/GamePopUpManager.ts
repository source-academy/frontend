import ImageAssets from '../assets/ImageAssets';
import SoundAssets from '../assets/SoundAssets';
import { Constants } from '../commons/CommonConstants';
import { GamePosition, ItemId } from '../commons/CommonTypes';
import { scrollEntry, scrollExit } from '../effects/ScrollEffect';
import { Layer } from '../layer/GameLayerTypes';
import GameGlobalAPI from '../scenes/gameManager/GameGlobalAPI';
import { sleep } from '../utils/GameUtils';
import { resizeUnderflow } from '../utils/SpriteUtils';
import popUpConstants from './GamePopUpConstants';

class GamePopUpManager {
  private currPopUp: Map<GamePosition, Phaser.GameObjects.Container>;

  constructor() {
    this.currPopUp = new Map<GamePosition, Phaser.GameObjects.Container>();
  }

  public async displayPopUp(
    itemId: ItemId,
    position: GamePosition,
    duration = Constants.popupDuration
  ) {
    // Destroy previous pop up if any
    this.destroyPopUp(position);

    const gameManager = GameGlobalAPI.getInstance().getGameManager();
    const container = new Phaser.GameObjects.Container(gameManager, 0, 0);

    // Frame
    const popUpFrameImg = new Phaser.GameObjects.Image(
      gameManager,
      popUpConstants.rect.x[position],
      popUpConstants.rect.y,
      ImageAssets.popUpFrame.key
    );

    // Get assetKey
    const assetKey = this.getAssetKey(itemId);
    if (!assetKey) return;

    const popUpImage = new Phaser.GameObjects.Image(
      gameManager,
      popUpConstants.rect.x[position] + popUpConstants.imgXOffset,
      popUpConstants.rect.y + popUpConstants.imgYOffset,
      assetKey
    );
    resizeUnderflow(popUpImage, popUpConstants.rect.width, popUpConstants.rect.height);

    container.add([popUpFrameImg, popUpImage]);
    this.currPopUp.set(position, container);
    GameGlobalAPI.getInstance().addContainerToLayer(Layer.PopUp, container);
    GameGlobalAPI.getInstance().playSound(SoundAssets.popUpEnter.key);

    container.setActive(true);
    container.setVisible(true);
    container.setScale(1.0, 0);

    gameManager.tweens.add(scrollEntry([container], popUpConstants.tweenDuration));
    await sleep(popUpConstants.tweenDuration);

    setTimeout(() => this.destroyPopUp(position), duration);
  }

  public destroyAllPopUps() {
    this.currPopUp.forEach((popUp, position, map) => {
      this.destroyPopUp(position);
    });
  }

  public async destroyPopUp(position: GamePosition) {
    const atPosContainer = this.currPopUp.get(position);
    if (!atPosContainer) return;

    GameGlobalAPI.getInstance()
      .getGameManager()
      .tweens.add(scrollExit([atPosContainer], popUpConstants.tweenDuration));
    await sleep(popUpConstants.tweenDuration);

    atPosContainer.setVisible(false);
    atPosContainer.setActive(false);
    atPosContainer.destroy();

    this.currPopUp.delete(position);
    GameGlobalAPI.getInstance().playSound(SoundAssets.popUpExit.key);
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
