import ImageAssets from '../../assets/ImageAssets';
import SoundAssets from '../../assets/SoundAssets';
import CommonBackButton from '../../commons/CommonBackButton';
import { screenCenter, screenSize } from '../../commons/CommonConstants';
import { IGameUI } from '../../commons/CommonTypes';
import { fadeAndDestroy } from '../../effects/FadeEffect';
import { entryTweenProps, exitTweenProps } from '../../effects/FlyEffect';
import { Layer } from '../../layer/GameLayerTypes';
import { GameLocationAttr, LocationId } from '../../location/GameMapTypes';
import GameGlobalAPI from '../../scenes/gameManager/GameGlobalAPI';
import { createButton } from '../../utils/ButtonUtils';
import { sleep } from '../../utils/GameUtils';
import { resizeOverflow } from '../../utils/SpriteUtils';
import { calcTableFormatPos } from '../../utils/StyleUtils';
import modeMoveConstants, { moveButtonStyle } from './GameModeMoveConstants';

/**
 * The class in charge of showing the "Move" UI
 * to show the images and titles of navigable
 * locations from one location
 */
class GameModeMove implements IGameUI {
  private uiContainer: Phaser.GameObjects.Container | undefined;
  private previewMask: Phaser.GameObjects.Graphics | undefined;

  private setPreview(sprite: Phaser.GameObjects.Sprite, assetKey: string) {
    sprite
      .setTexture(assetKey)
      .setPosition(modeMoveConstants.previewXPos, modeMoveConstants.previewYPos);
    resizeOverflow(sprite, modeMoveConstants.previewWidth, modeMoveConstants.previewHeight);
  }

  private getLatestNavigations() {
    return GameGlobalAPI.getInstance().getLocationAttr(
      GameLocationAttr.navigation,
      GameGlobalAPI.getInstance().getCurrLocId()
    );
  }

  private createUIContainer() {
    const gameManager = GameGlobalAPI.getInstance().getGameManager();
    const moveMenuContainer = new Phaser.GameObjects.Container(gameManager, 0, 0);

    // Preview
    const previewMask = new Phaser.GameObjects.Graphics(gameManager)
      .fillRect(
        modeMoveConstants.previewXPos - modeMoveConstants.previewWidth / 2,
        modeMoveConstants.previewYPos - modeMoveConstants.previewHeight / 2,
        modeMoveConstants.previewWidth,
        modeMoveConstants.previewHeight
      )
      .setAlpha(0);
    const previewFrame = new Phaser.GameObjects.Sprite(
      gameManager,
      modeMoveConstants.previewFrameXPos,
      screenCenter.y,
      ImageAssets.locationPreviewFrame.key
    );
    const previewFill = new Phaser.GameObjects.Sprite(
      gameManager,
      screenCenter.x,
      screenCenter.y,
      ImageAssets.locationPreviewFill.key
    ).setMask(previewMask.createGeometryMask());
    moveMenuContainer.add([previewFrame, previewFill]);

    const navigations = this.getLatestNavigations();
    const buttons = this.getMoveButtons(navigations, previewFill);
    const buttonPositions = calcTableFormatPos({
      numOfItems: buttons.length,
      numItemLimit: 1,
      maxYSpace: modeMoveConstants.buttonYSpace
    });

    moveMenuContainer.add(
      buttons.map((button, index) =>
        this.createMoveButton(
          button.text,
          buttonPositions[index][0] + modeMoveConstants.buttonXPosOffset,
          buttonPositions[index][1],
          button.callback,
          button.onHover,
          button.onOut
        )
      )
    );

    const backButton = new CommonBackButton(
      gameManager,
      () => {
        GameGlobalAPI.getInstance().popPhase();
        GameGlobalAPI.getInstance().fadeInLayer(Layer.Character, 300);
      },
      gameManager.soundManager
    );
    moveMenuContainer.add(backButton);

    // Initial setting
    this.setPreview(previewFill, ImageAssets.defaultLocationImg.key);

    // Keep reference to mask for tweening
    this.previewMask = previewMask;

    return moveMenuContainer;
  }

  private getMoveButtons(navigations: LocationId[], previewSprite: Phaser.GameObjects.Sprite) {
    const previewLoc = (assetKey: string) => this.setPreview(previewSprite, assetKey);
    const previewDefault = () => this.setPreview(previewSprite, ImageAssets.defaultLocationImg.key);

    return navigations.map(nav => {
      const location = GameGlobalAPI.getInstance().getLocationAtId(nav);
      return {
        text: location.name,
        callback: async () => {
          await GameGlobalAPI.getInstance().popPhase();
          await GameGlobalAPI.getInstance().changeLocationTo(nav);
        },
        onHover: () => previewLoc(location.assetKey),
        onOut: () => previewDefault()
      };
    });
  }

  private createMoveButton(
    text: string,
    xPos: number,
    yPos: number,
    callback: any,
    onHover: any,
    onOut: any
  ) {
    const gameManager = GameGlobalAPI.getInstance().getGameManager();
    return createButton(
      gameManager,
      {
        assetKey: ImageAssets.longButton.key,
        message: text,
        textConfig: { x: 0, y: 0, oriX: 0.4, oriY: 0.15 },
        bitMapTextStyle: moveButtonStyle,
        onUp: callback,
        onHover: onHover,
        onOut: onOut
      },
      gameManager.soundManager
    ).setPosition(xPos, yPos);
  }

  public async activateUI(): Promise<void> {
    const gameManager = GameGlobalAPI.getInstance().getGameManager();
    this.uiContainer = this.createUIContainer();
    GameGlobalAPI.getInstance().addContainerToLayer(Layer.UI, this.uiContainer);

    this.uiContainer.setPosition(this.uiContainer.x, -screenSize.y);
    this.previewMask!.setPosition(this.uiContainer.x, -screenSize.y);

    gameManager.tweens.add({
      targets: [this.uiContainer, this.previewMask],
      ...entryTweenProps
    });
    GameGlobalAPI.getInstance().playSound(SoundAssets.modeEnter.key);
  }

  public async deactivateUI(): Promise<void> {
    const gameManager = GameGlobalAPI.getInstance().getGameManager();

    if (this.uiContainer) {
      this.uiContainer.setPosition(this.uiContainer.x, 0);
      this.previewMask!.setPosition(this.uiContainer.x, 0);

      gameManager.tweens.add({
        targets: [this.uiContainer, this.previewMask],
        ...exitTweenProps
      });

      await sleep(500);
      fadeAndDestroy(gameManager, this.uiContainer);
      this.previewMask!.destroy();
    }
  }
}

export default GameModeMove;
