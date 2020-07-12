import { IGameUI } from '../../commons/CommonTypes';
import modeMoveConstants, { moveButtonStyle } from './GameModeMoveConstants';
import GameGlobalAPI from 'src/features/game/scenes/gameManager/GameGlobalAPI';
import { sleep } from '../../utils/GameUtils';
import { GameLocationAttr, LocationId } from '../../location/GameMapTypes';
import { screenSize, screenCenter } from '../../commons/CommonConstants';
import { entryTweenProps, exitTweenProps } from '../../effects/FlyEffect';
import { Layer } from '../../layer/GameLayerTypes';
import CommonBackButton from '../../commons/CommonBackButton';
import ImageAssets from '../../assets/ImageAssets';
import { createButton } from '../../utils/ButtonUtils';
import { fadeAndDestroy } from '../../effects/FadeEffect';
import { calcTableFormatPos } from '../../utils/StyleUtils';

class GameModeMove implements IGameUI {
  private uiContainer: Phaser.GameObjects.Container | undefined;

  private setPreview(sprite: Phaser.GameObjects.Sprite, assetKey: string) {
    sprite
      .setTexture(assetKey)
      .setDisplaySize(modeMoveConstants.previewWidth, modeMoveConstants.previewHeight)
      .setPosition(modeMoveConstants.previewXPos, modeMoveConstants.previewYPos);
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
    );
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
      0,
      0,
      gameManager.soundManager
    );
    moveMenuContainer.add(backButton);

    // Initial setting
    this.setPreview(previewFill, ImageAssets.defaultLocationImg.key);

    return moveMenuContainer;
  }

  private getMoveButtons(navigations: LocationId[], previewSprite: Phaser.GameObjects.Sprite) {
    const previewLoc = (assetKey: string) => this.setPreview(previewSprite, assetKey);
    const previewDefault = () => this.setPreview(previewSprite, ImageAssets.defaultLocationImg.key);

    return navigations.map(nav => {
      const location = GameGlobalAPI.getInstance().getLocationAtId(nav);
      if (!location) throw new Error(`${nav} does not exist`);

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

    gameManager.tweens.add({
      targets: this.uiContainer,
      ...entryTweenProps
    });
  }

  public async deactivateUI(): Promise<void> {
    const gameManager = GameGlobalAPI.getInstance().getGameManager();

    if (this.uiContainer) {
      this.uiContainer.setPosition(this.uiContainer.x, 0);

      gameManager.tweens.add({
        targets: this.uiContainer,
        ...exitTweenProps
      });

      await sleep(500);
      fadeAndDestroy(gameManager, this.uiContainer);
    }
  }
}

export default GameModeMove;
