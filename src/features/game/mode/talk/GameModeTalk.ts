import { IGameUI, GameButton, screenSize } from '../../commons/CommonsTypes';
import GameActionManager from 'src/pages/academy/game/subcomponents/GameActionManager';
import { talkEntryTweenProps, talkExitTweenProps } from './GameModeTalkTypes';
import { sleep } from '../../util/GameUtils';

class GameModeTalk implements IGameUI {
  public possibleTopics: Array<GameButton>;

  constructor() {
    this.possibleTopics = new Array<GameButton>();
  }

  public getUIContainer(): Phaser.GameObjects.Container {
    const gameManager = GameActionManager.getInstance().getGameManager();
    if (!gameManager) {
      throw console.error('GetUIContainer: Game Manager is not defined!');
    }

    const talkMenuContainer = new Phaser.GameObjects.Container(gameManager, 0, 0);

    this.possibleTopics.forEach(topicButton => {
      const text = topicButton.text ? topicButton.text : '';
      const style = topicButton.style ? topicButton.style : {};
      const topicButtonText = new Phaser.GameObjects.Text(
        gameManager,
        topicButton.assetXPos,
        topicButton.assetYPos,
        text,
        style
      ).setOrigin(0.5, 0.25);

      const buttonSprite = new Phaser.GameObjects.Sprite(
        gameManager,
        topicButton.assetXPos,
        topicButton.assetYPos,
        topicButton.assetKey
      );

      if (topicButton.isInteractive) {
        buttonSprite.setInteractive({ pixelPerfect: true, useHandCursor: true });
        buttonSprite.addListener(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, topicButton.onInteract);
      }

      talkMenuContainer.add(buttonSprite);
      talkMenuContainer.add(topicButtonText);
    });
    return talkMenuContainer;
  }

  public async activateUI(container: Phaser.GameObjects.Container): Promise<void> {
    const gameManager = GameActionManager.getInstance().getGameManager();
    if (!gameManager) {
      throw console.error('ActivateUI: Game Manager is not defined!');
    }

    container.setActive(true);
    container.setVisible(true);
    container.setPosition(container.x, -screenSize.y);

    gameManager.tweens.add({
      targets: container,
      ...talkEntryTweenProps
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
      ...talkExitTweenProps
    });

    await sleep(500);
    container.setVisible(false);
    container.setActive(false);
  }
}

export default GameModeTalk;
