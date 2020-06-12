import { IGameUI, screenSize, DialogueId } from '../../commons/CommonsTypes';
import GameActionManager from 'src/features/game/action/GameActionManager';
import {
  talkEntryTweenProps,
  talkExitTweenProps,
  talkButtonYSpace,
  talkButtonStyle,
  talkOptButton,
  TalkButtonType,
  TalkButton
} from './GameModeTalkTypes';
import { Dialogue } from '../../dialogue/DialogueTypes';
import { sleep } from '../../utils/GameUtils';
import { getBackToMenuContainer } from '../GameModeHelper';

class GameModeTalk implements IGameUI {
  private gameButtons: TalkButton[];

  constructor(dialogues: Map<DialogueId, Dialogue>) {
    this.gameButtons = [];
    this.createGameButtons(dialogues);
  }

  public getUIContainer(): Phaser.GameObjects.Container {
    const gameManager = GameActionManager.getInstance().getGameManager();
    if (!gameManager) {
      throw console.error('GetUIContainer: Game Manager is not defined!');
    }
    const talkMenuContainer = new Phaser.GameObjects.Container(gameManager, 0, 0);

    this.gameButtons.forEach((topicButton: TalkButton) => {
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

        let callback;

        if (topicButton.type === TalkButtonType.Dialogue) {
          callback = async () => {
            gameManager.tweens.add({ targets: [talkMenuContainer], ...talkExitTweenProps });
            await topicButton.onInteract();
            gameManager.tweens.add({ targets: [talkMenuContainer], ...talkEntryTweenProps });
          };
        } else {
          callback = topicButton.onInteract;
        }

        buttonSprite.addListener(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, callback);
      }

      talkMenuContainer.add(buttonSprite);
      talkMenuContainer.add(topicButtonText);
    });

    talkMenuContainer.add(getBackToMenuContainer());
    return talkMenuContainer;
  }

  private createGameButtons(dialogues: Map<DialogueId, Dialogue>) {
    dialogues.forEach(dialogue => {
      this.addTopicOptionButton(TalkButtonType.Dialogue, dialogue.title, () =>
        GameActionManager.getInstance().bringUpDialogue(dialogue.content)
      );
    });
  }

  private addTopicOptionButton(type: TalkButtonType, name: string, callback: any) {
    const newNumberOfButtons = this.gameButtons.length + 1;
    const partitionSize = talkButtonYSpace / newNumberOfButtons;
    const newYPos = (screenSize.y - talkButtonYSpace) / 2 + partitionSize / 2;

    // Rearrange existing buttons
    for (let i = 0; i < this.gameButtons.length; i++) {
      this.gameButtons[i] = {
        ...this.gameButtons[i],
        assetYPos: newYPos + i * partitionSize
      };
    }

    // Add the new button
    const newModeButton: TalkButton = {
      text: name,
      style: talkButtonStyle,
      assetKey: talkOptButton.key,
      assetXPos: talkOptButton.xPos,
      assetYPos: newYPos + this.gameButtons.length * partitionSize,
      isInteractive: true,
      onInteract: callback,
      type
    };

    // Update
    this.gameButtons.push(newModeButton);
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
