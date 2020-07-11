import { GameButton, IGameUI } from '../../commons/CommonTypes';
import modeMenuConstants, { modeButtonStyle, modeBannerRect } from './GameModeMenuConstants';
import { sleep } from '../../utils/GameUtils';
import GameGlobalAPI from 'src/features/game/scenes/gameManager/GameGlobalAPI';
import { GameMode, gameModeToPhase } from '../GameModeTypes';
import { screenSize, Constants } from '../../commons/CommonConstants';
import { Layer } from '../../layer/GameLayerTypes';
import { GameLocationAttr } from '../../location/GameMapTypes';
import ImageAssets from '../../assets/ImageAssets';
import { createButton } from '../../utils/ButtonUtils';

class GameModeMenu implements IGameUI {
  private uiContainer: Phaser.GameObjects.Container | undefined;
  private gameButtons: GameButton[];

  constructor() {
    this.gameButtons = [];
  }

  private createGameButtons(modes?: GameMode[]) {
    if (modes) {
      // Refresh Buttons
      modes.sort().forEach(mode => {
        this.addModeButton(mode, () => {
          GameGlobalAPI.getInstance().pushPhase(gameModeToPhase[mode]);

          if (mode !== GameMode.Talk) {
            GameGlobalAPI.getInstance()
              .getGameManager()
              .layerManager.fadeOutLayer(Layer.Character, 300);
          }
        });
      });
    }
  }

  private addModeButton(modeName: GameMode, callback: any) {
    const newNumberOfButtons = this.gameButtons.length + 1;
    const partitionSize = screenSize.x / newNumberOfButtons;

    const newXPos = partitionSize / 2;

    // Rearrange existing buttons
    for (let i = 0; i < this.gameButtons.length; i++) {
      this.gameButtons[i] = {
        ...this.gameButtons[i],
        assetXPos: newXPos + i * partitionSize
      };
    }

    // Add the new button
    const newModeButton: GameButton = {
      text: modeName,
      bitmapStyle: modeButtonStyle,
      assetKey: ImageAssets.shortButton.key,
      assetXPos: newXPos + this.gameButtons.length * partitionSize,
      assetYPos: modeMenuConstants.modeButtonYPos,
      isInteractive: true,
      onInteract: callback,
      interactionId: Constants.nullInteractionId
    };

    // Update
    this.gameButtons.push(newModeButton);
  }

  public fetchLatestState(): void {
    const currLocId = GameGlobalAPI.getInstance().getCurrLocId();
    let latestModesInLoc = GameGlobalAPI.getInstance().getModesByLocId(currLocId);
    const talkTopics = GameGlobalAPI.getInstance().getLocationAttr(
      GameLocationAttr.talkTopics,
      currLocId
    );
    if (talkTopics.length === 0) {
      latestModesInLoc = latestModesInLoc.filter(mode => mode !== GameMode.Talk);
    }
    this.createGameButtons(latestModesInLoc);
  }

  public getUIContainer(): Phaser.GameObjects.Container {
    const gameManager = GameGlobalAPI.getInstance().getGameManager();
    const modeMenuContainer = new Phaser.GameObjects.Container(gameManager, 0, 0);

    const modeBanner = new Phaser.GameObjects.Image(
      gameManager,
      modeBannerRect.assetXPos,
      modeBannerRect.assetYPos,
      modeBannerRect.assetKey
    );
    modeMenuContainer.add(modeBanner);

    this.gameButtons.forEach(modeButton => {
      const text = modeButton.text ? modeButton.text : '';
      const button = createButton(
        gameManager,
        {
          assetKey: modeButton.assetKey,
          message: text,
          textConfig: { x: 0, y: 0, oriX: 0.5, oriY: 0.25 },
          bitMapTextStyle: modeButton.bitmapStyle,
          onUp: modeButton.onInteract
        },
        gameManager.soundManager
      ).setPosition(modeButton.assetXPos, modeButton.assetYPos);

      modeMenuContainer.add(button);
    });

    return modeMenuContainer;
  }

  public async activateUI(): Promise<void> {
    this.uiContainer = undefined;
    this.gameButtons = [];
    this.fetchLatestState();
    const gameManager = GameGlobalAPI.getInstance().getGameManager();

    this.uiContainer = await this.getUIContainer();
    GameGlobalAPI.getInstance().addContainerToLayer(Layer.UI, this.uiContainer);

    this.uiContainer.setActive(true);
    this.uiContainer.setVisible(true);
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
      this.uiContainer.setVisible(false);
      this.uiContainer.setActive(false);
      this.uiContainer.destroy();
      this.uiContainer = undefined;
    }
  }
}

export default GameModeMenu;
