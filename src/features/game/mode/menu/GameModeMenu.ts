import GameGlobalAPI from 'src/features/game/scenes/gameManager/GameGlobalAPI';

import ImageAssets from '../../assets/ImageAssets';
import SoundAssets from '../../assets/SoundAssets';
import { screenCenter, screenSize } from '../../commons/CommonConstants';
import { IGameUI } from '../../commons/CommonTypes';
import { fadeAndDestroy } from '../../effects/FadeEffect';
import { Layer } from '../../layer/GameLayerTypes';
import { GameItemType } from '../../location/GameMapTypes';
import { createButton } from '../../utils/ButtonUtils';
import { sleep } from '../../utils/GameUtils';
import { calcTableFormatPos } from '../../utils/StyleUtils';
import { GameMode, gameModeToPhase } from '../GameModeTypes';
import MenuModeConstants, { MenuLineConstants, modeButtonStyle } from './GameModeMenuConstants';

/**
 * The class in charge of showing the "Menu" mode UI
 * which displays the menu for players
 * to choose the game mode they want to play
 * in a location
 */
class GameModeMenu implements IGameUI {
  private uiContainer: Phaser.GameObjects.Container | undefined;

  /**
   * Fetches the game modes of the current location id.
   */
  private getLatestLocationModes() {
    const currLocId = GameGlobalAPI.getInstance().getCurrLocId();
    let latestModesInLoc = GameGlobalAPI.getInstance().getLocationModes(currLocId);
    const talkTopics = GameGlobalAPI.getInstance().getGameItemsInLocation(
      GameItemType.talkTopics,
      currLocId
    );

    // Remove talk mode if there is no talk topics
    if (talkTopics.length === 0) {
      latestModesInLoc = latestModesInLoc.filter(mode => mode !== GameMode.Talk);
    }

    return latestModesInLoc;
  }

  /**
   * Create the container that encapsulate the 'Menu' mode UI,
   * i.e. the modes selection.
   */
  private createUIContainer() {
    const gameManager = GameGlobalAPI.getInstance().getGameManager();
    const modeMenuContainer = new Phaser.GameObjects.Container(gameManager, 0, 0);

    const modeBanner = new Phaser.GameObjects.Image(
      gameManager,
      screenCenter.x,
      screenCenter.y,
      ImageAssets.modeMenuBanner.key
    );
    modeMenuContainer.add(modeBanner);

    const modes = this.getLatestLocationModes();
    const buttons = this.getModeButtons(modes);
    const buttonPositions = calcTableFormatPos({
      numOfItems: buttons.length
    });

    const lineList: Phaser.GameObjects.Line[] = buttons.map((button, index) =>
      this.createLine(
        buttonPositions[index][0],
        buttonPositions[index][1] + MenuModeConstants.button.yOffset + MenuLineConstants.yOffset,
        button
      )
    );

    modeMenuContainer.add(
      buttons.map((button, index) =>
        this.createModeButton(
          button.text,
          buttonPositions[index][0],
          buttonPositions[index][1] + MenuModeConstants.button.yOffset,
          button.callback
        )
      )
    );

    modeMenuContainer.add(lineList);

    return modeMenuContainer;
  }

  /**
   * Create underline for each button.
   */
  private createLine(
    xPos: number,
    yPos: number,
    button: {
      text: GameMode;
      callback: () => Promise<void>;
    }
  ) {
    const gameManager = GameGlobalAPI.getInstance().getGameManager();
    if (button.text === GameMode.Explore) {
      xPos += MenuLineConstants.exploreOffset;
    } else if (button.text === GameMode.Move) {
      xPos += MenuLineConstants.moveOffset;
    } else {
      xPos += MenuLineConstants.talkOffset;
    }
    const line: Phaser.GameObjects.Line = gameManager.add.line(
      MenuLineConstants.x,
      MenuLineConstants.y,
      xPos,
      yPos,
      xPos + MenuLineConstants.lineLength,
      yPos,
      MenuLineConstants.color
    );
    line.setLineWidth(MenuLineConstants.lineWidth);
    return line;
  }

  /**
   * Get the mode buttons preset to be formatted later.
   * The preset includes the text to be displayed on the button and
   * its functionality (phase change callback).
   *
   * @param modes modes to be shown
   */
  private getModeButtons(modes: GameMode[]) {
    return modes.sort().map(mode => {
      return {
        text: mode,
        callback: async () => await GameGlobalAPI.getInstance().swapPhase(gameModeToPhase[mode])
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
   */
  private createModeButton(text: string, xPos: number, yPos: number, callback: any) {
    const gameManager = GameGlobalAPI.getInstance().getGameManager();
    return createButton(gameManager, {
      assetKey: ImageAssets.shortButton.key,
      message: text,
      textConfig: { x: 0, y: 0, oriX: 0.5, oriY: 0.25 },
      bitMapTextStyle: modeButtonStyle,
      onUp: callback
    }).setPosition(xPos, yPos);
  }

  /**
   * Activate the 'Menu' mode UI.
   *
   * Usually only called by the phase manager when 'Menu' phase is
   * pushed.
   */
  public async activateUI(): Promise<void> {
    const gameManager = GameGlobalAPI.getInstance().getGameManager();
    this.uiContainer = this.createUIContainer();
    GameGlobalAPI.getInstance().addToLayer(Layer.UI, this.uiContainer);

    this.uiContainer.setPosition(this.uiContainer.x, screenSize.y);

    gameManager.tweens.add({
      targets: this.uiContainer,
      ...MenuModeConstants.entryTweenProps
    });
    await sleep(500);
    GameGlobalAPI.getInstance().playSound(SoundAssets.modeEnter.key);
  }

  /**
   * Deactivate the 'Menu' mode UI.
   *
   * Usually only called by the phase manager when 'Menu' phase is
   * transitioned out.
   */
  public async deactivateUI(): Promise<void> {
    const gameManager = GameGlobalAPI.getInstance().getGameManager();

    if (this.uiContainer) {
      this.uiContainer.setPosition(this.uiContainer.x, 0);

      gameManager.tweens.add({
        targets: this.uiContainer,
        ...MenuModeConstants.exitTweenProps
      });

      await sleep(500);
      fadeAndDestroy(gameManager, this.uiContainer);
    }
  }
}

export default GameModeMenu;
