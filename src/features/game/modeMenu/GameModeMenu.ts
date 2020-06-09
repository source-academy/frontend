import { GameButton, IGameUI, GameSprite, screenSize } from '../commons/CommonsTypes';
import { modeMenuBanner, menuEntryTweenProps, menuExitTweenProps } from './GameModeMenuTypes';
import GameManager from 'src/pages/academy/game/subcomponents/GameManager';

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

  public getUIContainer(gameManager: GameManager): Phaser.GameObjects.Container {
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

  public activateUI(gameManager: GameManager, container: Phaser.GameObjects.Container) {
    container.setActive(true);
    container.setVisible(true);
    container.setPosition(container.x, screenSize.y);

    gameManager.tweens.add({
      targets: container,
      ...menuEntryTweenProps
    });
  }

  public deactivateUI(gameManager: GameManager, container: Phaser.GameObjects.Container) {
    gameManager.tweens.add({
      targets: container,
      ...menuExitTweenProps
    });

    container.setVisible(false);
    container.setActive(false);
  }
}

export default GameModeMenu;
