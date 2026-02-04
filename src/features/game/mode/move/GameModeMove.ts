import ImageAssets from '../../assets/ImageAssets';
import SoundAssets from '../../assets/SoundAssets';
import CommonBackButton from '../../commons/CommonBackButton';
import { screenCenter, screenSize } from '../../commons/CommonConstants';
import { IGameUI } from '../../commons/CommonTypes';
import { ItemId } from '../../commons/CommonTypes';
import { fadeAndDestroy } from '../../effects/FadeEffect';
import { entryTweenProps, exitTweenProps } from '../../effects/FlyEffect';
import { keyboardShortcuts } from '../../input/GameInputConstants';
import { Layer } from '../../layer/GameLayerTypes';
import { GameItemType, LocationId } from '../../location/GameMapTypes';
import { GamePhaseType } from '../../phase/GamePhaseTypes';
import GameGlobalAPI from '../../scenes/gameManager/GameGlobalAPI';
import { createButton, createButtonText } from '../../utils/ButtonUtils';
import { sleep } from '../../utils/GameUtils';
import { calcTableFormatPos } from '../../utils/StyleUtils';
import MoveModeConstants, { moveButtonStyle } from './GameModeMoveConstants';

/**
 * The class in charge of showing the "Move" UI
 * to show the images and titles of navigable
 * locations from one location
 */
class GameModeMove implements IGameUI {
  private uiContainer: Phaser.GameObjects.Container | undefined;

  /**
   * Set the location preview sprite to the given asset key.
   *
   * @param sprite sprite for which its texture will be replaced with the new preview
   * @param assetKey asset key of the new preview
   */
  private setPreview(sprite: Phaser.GameObjects.Sprite, assetKey: string) {
    sprite
      .setTexture(assetKey)
      .setDisplaySize(MoveModeConstants.preview.rect.width, MoveModeConstants.preview.rect.height)
      .setPosition(MoveModeConstants.preview.rect.x, MoveModeConstants.preview.rect.y);
  }

  /**
   * Fetches the navigations of the current location id.
   */
  private getLatestNavigations(): ItemId[] {
    return GameGlobalAPI.getInstance().getGameItemsInLocation(
      GameItemType.navigation,
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
    const previewFrame = new Phaser.GameObjects.Sprite(
      gameManager,
      MoveModeConstants.preview.frame.x,
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

    // Add all navigation buttons
    const navigations = this.getLatestNavigations();
    const buttons = this.getMoveButtons(navigations, previewFill);
    const buttonPositions = calcTableFormatPos({
      numOfItems: buttons.length,
      numItemLimit: 1,
      maxYSpace: MoveModeConstants.button.ySpace
    });

    moveMenuContainer.add(
      buttons.map((button, index) => {
        return this.createMoveButton(
          createButtonText(index + 1, button.text),
          buttonPositions[index][0] + MoveModeConstants.button.xOffSet,
          buttonPositions[index][1],
          button.callback,
          button.onHover,
          button.onOut
        );
      })
    );

    const backButton = new CommonBackButton(
      gameManager,
      async () => await GameGlobalAPI.getInstance().swapPhase(GamePhaseType.Menu)
    );
    moveMenuContainer.add(backButton);

    // Initial setting
    this.setPreview(previewFill, ImageAssets.defaultLocationImg.key);

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
          await GameGlobalAPI.getInstance().swapPhase(GamePhaseType.Sequence);
          await GameGlobalAPI.getInstance().changeLocationTo(nav);
        },
        onHover: () => previewLoc(location.previewKey || location.assetKey),
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
   * Register keyboard listeners for location selection.
   * Called by activateUI function.
   */
  private registerKeyboardListener(): void {
    const inputManager = GameGlobalAPI.getInstance().getGameManager().getInputManager();
    const navList: string[] = this.getLatestNavigations();

    navList.forEach((nav, index) => {
      inputManager.registerKeyboardListener(keyboardShortcuts.Options[index], 'up', async () => {
        await GameGlobalAPI.getInstance().swapPhase(GamePhaseType.Sequence);
        await GameGlobalAPI.getInstance().changeLocationTo(nav);
      });
    });
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
    GameGlobalAPI.getInstance().addToLayer(Layer.UI, this.uiContainer);

    this.registerKeyboardListener();

    this.uiContainer.setPosition(this.uiContainer.x, -screenSize.y);
    gameManager.tweens.add({
      targets: this.uiContainer,
      ...entryTweenProps
    });
    GameGlobalAPI.getInstance().playSound(SoundAssets.modeEnter.key);
  }

  /**
   * Remove keyboard listners for location selection
   * when Move mode is transitioned out.
   */
  private removeKeyboardListener(): void {
    const inputManager = GameGlobalAPI.getInstance().getGameManager().getInputManager();
    inputManager.clearKeyboardListeners(keyboardShortcuts.Options);
  }

  /**
   * Deactivate the 'Move' mode UI.
   *
   * Usually only called by the phase manager when 'Move' phase is
   * transitioned out.
   */
  public async deactivateUI(): Promise<void> {
    const gameManager = GameGlobalAPI.getInstance().getGameManager();
    this.removeKeyboardListener();
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
