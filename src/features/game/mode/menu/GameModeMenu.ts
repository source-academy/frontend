import { IGameUI } from '../../commons/CommonTypes';
import modeMenuConstants, { modeButtonStyle, modeBannerRect } from './GameModeMenuConstants';
import { sleep } from '../../utils/GameUtils';
import GameGlobalAPI from 'src/features/game/scenes/gameManager/GameGlobalAPI';
import { GameMode, gameModeToPhase } from '../GameModeTypes';
import { screenSize } from '../../commons/CommonConstants';
import { Layer } from '../../layer/GameLayerTypes';
import { GameLocationAttr } from '../../location/GameMapTypes';
import ImageAssets from '../../assets/ImageAssets';
import { createButton } from '../../utils/ButtonUtils';
import { calcTableFormatPos } from '../../utils/StyleUtils';
import { fadeAndDestroy } from '../../effects/FadeEffect';

class GameModeMenu implements IGameUI {
  private uiContainer: Phaser.GameObjects.Container | undefined;

  private getLatestLocationModes() {
    const currLocId = GameGlobalAPI.getInstance().getCurrLocId();
    let latestModesInLoc = GameGlobalAPI.getInstance().getModesByLocId(currLocId);
    const talkTopics = GameGlobalAPI.getInstance().getLocationAttr(
      GameLocationAttr.talkTopics,
      currLocId
    );

    // Remove talk mode if there is no talk topics
    if (talkTopics.length === 0) {
      latestModesInLoc = latestModesInLoc.filter(mode => mode !== GameMode.Talk);
    }

    return latestModesInLoc;
  }

  private createUIContainer() {
    const gameManager = GameGlobalAPI.getInstance().getGameManager();
    const modeMenuContainer = new Phaser.GameObjects.Container(gameManager, 0, 0);

    const modeBanner = new Phaser.GameObjects.Image(
      gameManager,
      modeBannerRect.assetXPos,
      modeBannerRect.assetYPos,
      modeBannerRect.assetKey
    );
    modeMenuContainer.add(modeBanner);

    const modes = this.getLatestLocationModes();
    const buttons = this.getModeButtons(modes);
    const buttonPositions = calcTableFormatPos({
      numOfItems: buttons.length
    });

    modeMenuContainer.add(
      buttons.map((button, index) =>
        this.createModeButton(
          button.text,
          buttonPositions[index][0],
          buttonPositions[index][1] + modeMenuConstants.buttonYPosOffset,
          button.callback
        )
      )
    );
    return modeMenuContainer;
  }

  private getModeButtons(modes: GameMode[]) {
    return modes.sort().map(mode => {
      return {
        text: mode,
        callback: () => {
          GameGlobalAPI.getInstance().pushPhase(gameModeToPhase[mode]);
          if (mode !== GameMode.Talk) {
            GameGlobalAPI.getInstance().fadeOutLayer(Layer.Character, 300);
          }
        }
      };
    });
  }

  private createModeButton(text: string, xPos: number, yPos: number, callback: any) {
    const gameManager = GameGlobalAPI.getInstance().getGameManager();
    return createButton(
      gameManager,
      {
        assetKey: ImageAssets.shortButton.key,
        message: text,
        textConfig: { x: 0, y: 0, oriX: 0.5, oriY: 0.25 },
        bitMapTextStyle: modeButtonStyle,
        onUp: callback
      },
      gameManager.soundManager
    ).setPosition(xPos, yPos);
  }

  public async activateUI(): Promise<void> {
    const gameManager = GameGlobalAPI.getInstance().getGameManager();
    this.uiContainer = this.createUIContainer();
    GameGlobalAPI.getInstance().addContainerToLayer(Layer.UI, this.uiContainer);

    this.uiContainer.setPosition(this.uiContainer.x, screenSize.y);

    gameManager.tweens.add({
      targets: this.uiContainer,
      ...modeMenuConstants.entryTweenProps
    });
  }

  public async deactivateUI(): Promise<void> {
    const gameManager = GameGlobalAPI.getInstance().getGameManager();

    if (this.uiContainer) {
      this.uiContainer.setPosition(this.uiContainer.x, 0);

      gameManager.tweens.add({
        targets: this.uiContainer,
        ...modeMenuConstants.exitTweenProps
      });

      await sleep(500);
      fadeAndDestroy(gameManager, this.uiContainer);
    }
  }
}

export default GameModeMenu;
