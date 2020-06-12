import { IGameUI, DialogueId } from '../../commons/CommonsTypes';
import GameActionManager from 'src/features/game/action/GameActionManager';
import {
  talkButtonYSpace,
  talkButtonStyle,
  talkOptButton,
  TalkButtonType,
  TalkButton
} from './GameModeTalkConstants';
import { Dialogue } from '../../dialogue/DialogueTypes';
import { sleep } from '../../utils/GameUtils';
import { getBackToMenuContainer } from '../GameModeHelper';
import { GameLocationAttr } from '../../location/GameMapTypes';
import { screenSize, screenCenter } from '../../commons/CommonConstants';
import { entryTweenProps, exitTweenProps } from '../../effects/FlyEffect';

class GameModeTalk implements IGameUI {
  private locationName: string;
  private dialogues: Map<DialogueId, Dialogue>;
  private gameButtons: TalkButton[];

  constructor(
    locationName: string,
    talkTopics: DialogueId[],
    dialogues: Map<DialogueId, Dialogue>
  ) {
    this.locationName = locationName;
    this.gameButtons = [];
    this.dialogues = dialogues;
    this.createGameButtons(talkTopics);
  }

  private createGameButtons(dialogueIds: DialogueId[]) {
    // Refresh Buttons
    this.gameButtons = [];

    dialogueIds.forEach(dialogueId => {
      const dialogue = this.dialogues.get(dialogueId);
      if (dialogue) {
        this.addTopicOptionButton(TalkButtonType.Dialogue, dialogue.title, () =>
          GameActionManager.getInstance().bringUpDialogue(dialogue.content)
        );
      }
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
      assetXPos: screenCenter.x,
      assetYPos: newYPos + this.gameButtons.length * partitionSize,
      isInteractive: true,
      onInteract: callback,
      type
    };

    // Update
    this.gameButtons.push(newModeButton);
  }

  private fetchLatestState() {
    const latestTalkTopics = GameActionManager.getInstance().getLocationAttr(
      GameLocationAttr.talkTopics,
      this.locationName
    );
    if (!latestTalkTopics) {
      return;
    }
    this.createGameButtons(latestTalkTopics);
  }

  public getUIContainer(): Phaser.GameObjects.Container {
    const gameManager = GameActionManager.getInstance().getGameManager();
    if (!gameManager) {
      throw console.error('GetUIContainer: Game Manager is not defined!');
    }
    const talkMenuContainer = new Phaser.GameObjects.Container(gameManager, 0, 0);

    // Fetch latest state if location is not yet visited
    const hasUpdates = GameActionManager.getInstance().hasLocationUpdate(this.locationName);
    if (hasUpdates) {
      this.fetchLatestState();
    }

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
            gameManager.tweens.add({ targets: [talkMenuContainer], ...exitTweenProps });
            await topicButton.onInteract();
            gameManager.tweens.add({ targets: [talkMenuContainer], ...entryTweenProps });
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
      ...entryTweenProps
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
      ...exitTweenProps
    });

    await sleep(500);
    container.setVisible(false);
    container.setActive(false);
  }
}

export default GameModeTalk;
