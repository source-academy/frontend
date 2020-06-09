import { IGameUI, GameSprite, screenSize } from '../../commons/CommonsTypes';
import { GameButton } from 'src/features/game/commons/CommonsTypes';
import GameManager from 'src/pages/academy/game/subcomponents/GameManager';
import { defaultLocationImg, moveEntryTweenProps, moveExitTweenProps } from './GameModeMoveTypes';
import { sleep } from 'src/features/game/util/GameUtils';

class GameModeMove implements IGameUI {
  public currentLocationSprite: GameSprite;
  public possibleLocations: Array<GameButton>;
  public locationAssetKeys: Map<string, string>;

  constructor() {
    const defaultLocation = {
      assetKey: defaultLocationImg.key,
      assetXPos: defaultLocationImg.xPos,
      assetYPos: defaultLocationImg.yPos
    } as GameSprite;

    this.currentLocationSprite = defaultLocation;
    this.possibleLocations = new Array<GameButton>();
    this.locationAssetKeys = new Map<string, string>();
  }

  public getUIContainer(gameManager: GameManager): Phaser.GameObjects.Container {
    const moveMenuContainer = new Phaser.GameObjects.Container(gameManager, 0, 0);

    // const navigation = gameManager.currentChapter.map.
    this.possibleLocations.forEach(locationButton => {
      const buttonSprite = new Phaser.GameObjects.Sprite(
        gameManager,
        locationButton.assetXPos,
        locationButton.assetYPos,
        locationButton.assetKey
      );

      if (locationButton.isInteractive) {
        buttonSprite.setInteractive({ pixelPerfect: true, useHandCursor: true });
        buttonSprite.addListener(
          Phaser.Input.Events.GAMEOBJECT_POINTER_UP,
          locationButton.onInteract
        );
      }

      const text = locationButton.text ? locationButton.text : '';
      const style = locationButton.style ? locationButton.style : {};
      const locationButtonText = new Phaser.GameObjects.Text(
        gameManager,
        locationButton.assetXPos,
        locationButton.assetYPos,
        text,
        style
      ).setOrigin(0.5, 0.25);

      moveMenuContainer.add(buttonSprite);
      moveMenuContainer.add(locationButtonText);
    });

    return moveMenuContainer;
  }

  public async activateUI(gameManager: GameManager, container: Phaser.GameObjects.Container): Promise<void> {
    container.setActive(true);
    container.setVisible(true);
    container.setPosition(container.x, -screenSize.y);

    gameManager.tweens.add({
      targets: container,
      ...moveEntryTweenProps
    });
  }

  public async deactivateUI(gameManager: GameManager, container: Phaser.GameObjects.Container): Promise<void> {
    container.setPosition(container.x, 0);

    gameManager.tweens.add({
      targets: container,
      ...moveExitTweenProps
    });

    await sleep(500);
    container.setVisible(false);
    container.setActive(false);
  }
}

export default GameModeMove;
