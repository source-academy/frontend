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

  /**
   * Set the location preview sprite to the given asset key.
   *
   * @param sprite sprite for which its texture will be replaced with the new preview
   * @param assetKey asset key of the new preview
   */
  private setPreview(sprite: Phaser.GameObjects.Sprite, assetKey: string) {
    sprite
      .setTexture(assetKey)
      .setPosition(modeMoveConstants.previewXPos, modeMoveConstants.previewYPos);
    resizeOverflow(sprite, modeMoveConstants.previewWidth, modeMoveConstants.previewHeight);
  }

  /**
   * Fetches the navigations of the current location id.
   */
  private getLatestNavigations() {
    return GameGlobalAPI.getInstance().getLocationAttr(
      GameLocationAttr.navigation,
      GameGlobalAPI.getInstance().getCurrLocId()
    );
  }

  /**
   * Create the container that encapsulate the 'Move' mode UI,
   * i.e. the navigation, the back button, as well the preview of
   * the location.
   */
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

    // Add all navigation buttons
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

    const backButton = new CommonBackButton(gameManager, () => {
      GameGlobalAPI.getInstance().popPhase();
      GameGlobalAPI.getInstance().fadeInLayer(Layer.Character, 300);
    });
    moveMenuContainer.add(backButton);

    // Initial setting
    this.setPreview(previewFill, ImageAssets.defaultLocationImg.key);

    // Keep reference to mask for tweening
    this.previewMask = previewMask;

    return moveMenuContainer;
  }

  /**
   * Get the move buttons preset to be formatted later.
   * The preset includes the text to be displayed on the button and
   * its functionality (change location callback).
   *
   * @param navigations navigations from the current location
   * @param previewSprite the sprite in which to show the location preview, to be included
   *                      in the callback
   */
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

  /**
   * Format the button information to a UI container, complete with
   * styling and functionality.
   *
   * @param text text to be displayed on the button
   * @param xPos x position of the button
   * @param yPos y position of the button
   * @param callback callback to be executed on click
   * @param onHover callback to be executed on hover
   * @param onOut callback to be executed on out hover
   */
  private createMoveButton(
    text: string,
    xPos: number,
    yPos: number,
    callback: any,
    onHover: any,
    onOut: any
  ) {
    const gameManager = GameGlobalAPI.getInstance().getGameManager();
    return createButton(gameManager, {
      assetKey: ImageAssets.longButton.key,
      message: text,
      textConfig: { x: 0, y: 0, oriX: 0.4, oriY: 0.15 },
      bitMapTextStyle: moveButtonStyle,
      onUp: callback,
      onHover: onHover,
      onOut: onOut
    }).setPosition(xPos, yPos);
  }

  /**
   * Activate the 'Move' mode UI.
   *
   * Usually only called by the phase manager when 'Move' phase is
   * pushed.
   */
  public async activateUI(): Promise<void> {
    const gameManager = GameGlobalAPI.getInstance().getGameManager();
    this.uiContainer = this.createUIContainer();
    GameGlobalAPI.getInstance().addContainerToLayer(Layer.UI, this.uiContainer);
    GameGlobalAPI.getInstance().fadeOutLayer(Layer.Character, 300);

    this.uiContainer.setPosition(this.uiContainer.x, -screenSize.y);
    this.previewMask!.setPosition(this.uiContainer.x, -screenSize.y);

    gameManager.tweens.add({
      targets: [this.uiContainer, this.previewMask],
      ...entryTweenProps
    });
    GameGlobalAPI.getInstance().playSound(SoundAssets.modeEnter.key);
  }

  /**
   * Deactivate the 'Move' mode UI.
   *
   * Usually only called by the phase manager when 'Move' phase is
   * transitioned out.
   */
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
