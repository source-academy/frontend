import { GameButton, IGameUI, GameSprite } from '../../commons/CommonsTypes';
import {
  menuEntryTweenProps,
  menuExitTweenProps,
  modeButtonYPos,
  modeButtonStyle,
  banner
} from './GameModeMenuConstants';
import { sleep } from '../../utils/GameUtils';
import GameActionManager from 'src/features/game/action/GameActionManager';
import { GameMode } from '../GameModeTypes';
import { screenSize, screenCenter, Constants } from '../../commons/CommonConstants';
import { shortButton, modeMenuBanner } from '../../commons/CommonAssets';
import { LocationId } from '../../location/GameMapTypes';
import { Layer } from '../../layer/GameLayerTypes';

class GameModeMenu implements IGameUI {
  private uiContainer: Phaser.GameObjects.Container | undefined;
  private locationId: LocationId;
  private modeBanner: GameSprite;
  private gameButtons: GameButton[];

  constructor(locationId: LocationId) {
    this.locationId = locationId;
    const banner = {
      assetKey: modeMenuBanner.key,
      assetXPos: screenCenter.x,
      assetYPos: screenCenter.y,
      isInteractive: false
    } as GameSprite;

    this.uiContainer = undefined;
    this.modeBanner = banner;
    this.gameButtons = [];
    this.fetchLatestState();
  }

  private async createGameButtons(modes?: GameMode[]) {
    if (modes) {
      // Refresh Buttons
      this.gameButtons = [];
      await modes.forEach(mode => {
        this.addModeButton(mode, () => GameActionManager.getInstance().changeLocationModeTo(mode));
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
      style: modeButtonStyle,
      assetKey: shortButton.key,
      assetXPos: newXPos + this.gameButtons.length * partitionSize,
      assetYPos: modeButtonYPos,
      isInteractive: true,
      onInteract: callback,
      interactionId: Constants.nullInteractionId
    };

    // Update
    this.gameButtons.push(newModeButton);
  }

  public fetchLatestState(): void {
    const latestLocationMode = GameActionManager.getInstance().getLocationMode(this.locationId);
    if (!latestLocationMode) {
      return;
    }
    this.createGameButtons(latestLocationMode);
  }

  public getUIContainer(): Phaser.GameObjects.Container {
    const gameManager = GameActionManager.getInstance().getGameManager();
    if (!gameManager) {
      throw console.error('GetUIContainer: Game Manager is not defined!');
    }

    const modeMenuContainer = new Phaser.GameObjects.Container(gameManager, 0, 0);

    const modeBanner = new Phaser.GameObjects.Image(
      gameManager,
      this.modeBanner.assetXPos,
      this.modeBanner.assetYPos,
      this.modeBanner.assetKey
    );
    modeMenuContainer.add(modeBanner);

    this.gameButtons.forEach(button => {
      const buttonSprite = new Phaser.GameObjects.Sprite(
        gameManager,
        button.assetXPos,
        button.assetYPos,
        button.assetKey
      );

      if (button.isInteractive) {
        buttonSprite.setInteractive({ pixelPerfect: true, useHandCursor: true });
        buttonSprite.addListener(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, button.onInteract);
      }

      const text = button.text ? button.text : '';
      const style = button.style ? button.style : {};
      const buttonText = new Phaser.GameObjects.Text(
        gameManager,
        button.assetXPos,
        button.assetYPos,
        text,
        style
      ).setOrigin(0.5, 0.25);

      modeMenuContainer.add(buttonSprite);
      modeMenuContainer.add(buttonText);
    });

    return modeMenuContainer;
  }

  public async activate() {
    this.locationId = GameActionManager.getInstance().getCurrLocId();

    this.uiContainer = undefined;
    this.modeBanner = banner;
    this.gameButtons = [];
    this.fetchLatestState();
    await this.activateUI();
  }

  public async activateUI(): Promise<void> {
    const gameManager = GameActionManager.getInstance().getGameManager();

    this.fetchLatestState();
    this.uiContainer = await this.getUIContainer();
    GameActionManager.getInstance().addContainerToLayer(Layer.UI, this.uiContainer);

    this.uiContainer.setActive(true);
    this.uiContainer.setVisible(true);
    this.uiContainer.setPosition(this.uiContainer.x, screenSize.y);

    gameManager.tweens.add({
      targets: this.uiContainer,
      ...menuEntryTweenProps
    });
  }

  public async deactivateUI(): Promise<void> {
    const gameManager = GameActionManager.getInstance().getGameManager();

    if (this.uiContainer) {
      this.uiContainer.setPosition(this.uiContainer.x, 0);

      gameManager.tweens.add({
        targets: this.uiContainer,
        ...menuExitTweenProps
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
