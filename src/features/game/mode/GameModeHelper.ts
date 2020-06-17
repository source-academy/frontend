import { backText, GameMode, backButtonStyle, backTextYPos } from './GameModeTypes';
import GameActionManager from 'src/features/game/action/GameActionManager';
import { screenCenter } from '../commons/CommonConstants';
import { topButton } from '../commons/CommonAssets';

export function getBackToMenuContainer(): Phaser.GameObjects.Container {
  const gameManager = GameActionManager.getInstance().getGameManager();

  const backToMenuContainer = new Phaser.GameObjects.Container(gameManager, 0, 0);

  const backButtonText = new Phaser.GameObjects.Text(
    gameManager,
    screenCenter.x,
    backTextYPos,
    backText,
    backButtonStyle
  ).setOrigin(0.5, 0.25);

  const backButtonSprite = new Phaser.GameObjects.Sprite(
    gameManager,
    screenCenter.x,
    screenCenter.y,
    topButton.key
  );

  backButtonSprite.setInteractive({ pixelPerfect: true, useHandCursor: true });
  backButtonSprite.addListener(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () =>
    GameActionManager.getInstance().changeLocationModeTo(GameMode.Menu)
  );

  backToMenuContainer.add(backButtonSprite);
  backToMenuContainer.add(backButtonText);
  return backToMenuContainer;
}
