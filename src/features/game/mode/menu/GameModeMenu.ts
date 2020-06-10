import { GameButton, IGameUI, GameSprite, screenSize } from '../../commons/CommonsTypes';
import { modeMenuBanner, menuEntryTweenProps, menuExitTweenProps } from './GameModeMenuTypes';
import { sleep } from 'src/features/game/util/GameUtils';
import GameActionManager from 'src/pages/academy/game/subcomponents/GameActionManager';

class GameModeMenu implements IGameUI {
  public modeBanner: GameSprite;
  public modeButtons: Array<GameButton>;

  constructor() {
    const banner = {
      assetKey: modeMenuBanner.key,
      assetXPos: modeMenuBanner.xPos,
      assetYPos: modeMenuBanner.yPos,
      isInteractive: false
    } as GameSprite;

    this.modeBanner = banner;
    this.modeButtons = new Array<GameButton>();
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

    this.modeButtons.forEach(button => {
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

  public async activateUI(container: Phaser.GameObjects.Container): Promise<void> {
    const gameManager = GameActionManager.getInstance().getGameManager();
    if (!gameManager) {
      throw console.error('ActivateUI: Game Manager is not defined!');
    }

    container.setActive(true);
    container.setVisible(true);
    container.setPosition(container.x, screenSize.y);

    gameManager.tweens.add({
      targets: container,
      ...menuEntryTweenProps
    });
  }

  public async deactivateUI(container: Phaser.GameObjects.Container): Promise<void> {
    const gameManager = GameActionManager.getInstance().getGameManager();
    if (!gameManager) {
      throw console.error('DeactivateUI: Game Manager is not defined!');
    }

    container.setPosition(container.x, 0);

    gameManager.tweens.add({
      targets: container,
      ...menuExitTweenProps
    });

    await sleep(500);
    container.setVisible(false);
    container.setActive(false);
  }
}

export default GameModeMenu;
