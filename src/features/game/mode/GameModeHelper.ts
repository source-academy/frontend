import { backText, GameMode, backButtonStyle, backTextYPos } from './GameModeTypes';
import GameActionManager from 'src/features/game/action/GameActionManager';
import { topButton } from '../commons/CommonsTypes';

export function getBackToMenuContainer(): Phaser.GameObjects.Container {
  const gameManager = GameActionManager.getInstance().getGameManager();
  if (!gameManager) {
    throw console.error('Game Manager is undefined!');
  }
  const backToMenuContainer = new Phaser.GameObjects.Container(gameManager, 0, 0);

  const backButtonText = new Phaser.GameObjects.Text(
    gameManager,
    topButton.xPos,
    backTextYPos,
    backText,
    backButtonStyle
  ).setOrigin(0.5, 0.25);

  const backButtonSprite = new Phaser.GameObjects.Sprite(
    gameManager,
    topButton.xPos,
    topButton.yPos,
    topButton.key
  );

  backButtonSprite.setInteractive({ pixelPerfect: true, useHandCursor: true });
  backButtonSprite.addListener(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () =>
    GameActionManager.getInstance().changeModeTo(GameMode.Menu)
  );

  backToMenuContainer.add(backButtonSprite);
  backToMenuContainer.add(backButtonText);
  return backToMenuContainer;
}
