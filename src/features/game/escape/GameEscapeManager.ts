import GameActionManager from '../action/GameActionManager';
import { mediumButton, escapeMenuBackground } from '../commons/CommonAssets';
import { screenSize, screenCenter } from '../commons/CommonConstants';
import { createButton } from '../utils/StyleUtils';
import { Layer } from '../layer/GameLayerTypes';
import {
  escapeOptButtonStyle,
  escapeTextOriX,
  escapeTextOriY,
  escapeButtonYPos
} from './GameEscapeConstants';

class GameEscapeManager {
  private isEscapeMenuActive: boolean;
  private escapeMenuContainer: Phaser.GameObjects.Container | undefined;

  constructor() {
    this.isEscapeMenuActive = false;
    this.escapeMenuContainer = undefined;
  }

  public setEscapeMenu(active: boolean) {
    if (active) {
      this.escapeMenuContainer = this.createEscapeMenu();
      GameActionManager.getInstance().addContainerToLayer(Layer.Escape, this.escapeMenuContainer);
    } else if (this.escapeMenuContainer) {
      GameActionManager.getInstance()
        .getGameManager()
        .layerManager.clearSeveralLayers([Layer.Escape]);
      this.escapeMenuContainer.destroy();
      this.escapeMenuContainer = undefined;
    }
    this.isEscapeMenuActive = active;
  }

  public toggleEscapeMenu() {
    GameActionManager.getInstance().setEscapeMenu(!this.isEscapeMenuActive);
  }

  private createEscapeMenu() {
    const gameManager = GameActionManager.getInstance().getGameManager();

    const escapeMenuContainer = new Phaser.GameObjects.Container(gameManager, 0, 0);
    const escapeMenuBg = new Phaser.GameObjects.Image(
      gameManager,
      screenCenter.x,
      screenCenter.y,
      escapeMenuBackground.key
    );
    escapeMenuBg.setDisplaySize(screenSize.x, screenSize.y);
    escapeMenuBg.setInteractive({ pixelPerfect: true });

    const mainMenuButton = createButton(
      gameManager,
      'Main Menu',
      () => {
        gameManager.layerManager.clearAllLayers();
        gameManager.scene.start('MainMenu');
      },
      mediumButton.key,
      { x: screenSize.x * 0.25, y: escapeButtonYPos },
      escapeTextOriX,
      escapeTextOriY,
      escapeOptButtonStyle
    );

    const continueButton = createButton(
      gameManager,
      'Continue',
      () => {
        GameActionManager.getInstance().setEscapeMenu(false);
      },
      mediumButton.key,
      { x: screenSize.x * 0.5, y: escapeButtonYPos },
      escapeTextOriX,
      escapeTextOriY,
      escapeOptButtonStyle
    );

    const saveSettingsButton = createButton(
      gameManager,
      'Save Settings',
      () => GameActionManager.getInstance().saveGame();
      mediumButton.key,
      { x: screenSize.x * 0.75, y: escapeButtonYPos },
      escapeTextOriX,
      escapeTextOriY,
      escapeOptButtonStyle
    );

    escapeMenuContainer.add([escapeMenuBg, mainMenuButton, continueButton, saveSettingsButton]);
    return escapeMenuContainer;
  }
}

export default GameEscapeManager;
