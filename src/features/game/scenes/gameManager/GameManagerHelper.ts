import GameActionManager from '../../action/GameActionManager';
import { escapeMenuBackground, mediumButton } from '../../commons/CommonAssets';
import { screenSize, screenCenter } from '../../commons/CommonConstants';
import { createButton } from '../../utils/StyleUtils';

export function createEscapeMenu() {
  const gameManager = GameActionManager.getInstance().getGameManager();

  const escapeOptButtonStyle = {
    fontFamily: 'Helvetica',
    fontSize: '30px',
    fill: '#abd4c6',
    align: 'center'
  };

  const escapeMenuContainer = new Phaser.GameObjects.Container(gameManager, 0, 0);
  const escapeMenuBg = new Phaser.GameObjects.Image(
    gameManager,
    screenCenter.x,
    screenCenter.y,
    escapeMenuBackground.key
  );
  escapeMenuBg.setDisplaySize(screenSize.x, screenSize.y);
  escapeMenuBg.setInteractive({ pixelPerfect: true });

  const textOriX = 0.33;
  const textOriY = 0.85;

  const mainMenuButton = createButton(
    gameManager,
    'Main Menu',
    () => {
      gameManager.layerManager.clearAllLayers();
      gameManager.scene.start('MainMenu');
    },
    mediumButton.key,
    { x: screenSize.x * 0.25, y: screenSize.y * 0.65 },
    textOriX,
    textOriY,
    escapeOptButtonStyle
  );

  const continueButton = createButton(
    gameManager,
    'Continue',
    () => {
      GameActionManager.getInstance().setEscapeMenu(false);
    },
    mediumButton.key,
    { x: screenSize.x * 0.5, y: screenSize.y * 0.65 },
    textOriX,
    textOriY,
    escapeOptButtonStyle
  );

  const saveSettingsButton = createButton(
    gameManager,
    'Save Settings',
    () => {
      // TODO: Fix
      console.log('Saving settings');
    },
    mediumButton.key,
    { x: screenSize.x * 0.75, y: screenSize.y * 0.65 },
    textOriX,
    textOriY,
    escapeOptButtonStyle
  );

  escapeMenuContainer.add([escapeMenuBg, mainMenuButton, continueButton, saveSettingsButton]);
  return escapeMenuContainer;
}
