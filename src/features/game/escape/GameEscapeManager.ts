import GameActionManager from '../action/GameActionManager';
import { mediumButton, escapeMenuBackground } from '../commons/CommonAssets';
import { screenSize, screenCenter } from '../commons/CommonConstants';
import { createButton } from '../utils/StyleUtils';
import {
  escapeOptButtonStyle,
  escapeTextOriX,
  escapeTextOriY,
  escapeButtonYPos
} from './GameEscapeConstants';
import { Layer } from '../layer/GameLayerTypes';

class GameEscapeManager {
  public createEscapeMenu() {
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
      () => this.destroyEscapeMenu(escapeMenuContainer),
      mediumButton.key,
      { x: screenSize.x * 0.5, y: escapeButtonYPos },
      escapeTextOriX,
      escapeTextOriY,
      escapeOptButtonStyle
    );

    const saveSettingsButton = createButton(
      gameManager,
      'Save Settings',
      () => GameActionManager.getInstance().saveGame(),
      mediumButton.key,
      { x: screenSize.x * 0.75, y: escapeButtonYPos },
      escapeTextOriX,
      escapeTextOriY,
      escapeOptButtonStyle
    );

    escapeMenuContainer.add([escapeMenuBg, mainMenuButton, continueButton, saveSettingsButton]);
    GameActionManager.getInstance().addContainerToLayer(Layer.Escape, escapeMenuContainer);
  }

  private destroyEscapeMenu(escapeMenuContainer: Phaser.GameObjects.Container) {
    GameActionManager.getInstance()
      .getGameManager()
      .layerManager.clearSeveralLayers([Layer.Escape]);
    escapeMenuContainer.destroy();
    GameActionManager.getInstance().getGameManager().phaseManager.popPhase();
  }
}

export default GameEscapeManager;
