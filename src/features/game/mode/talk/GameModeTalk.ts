import { IGameUI, DialogueId, GameButton } from '../../commons/CommonsTypes';
import GameActionManager from 'src/features/game/action/GameActionManager';
import {
  talkButtonYSpace,
  talkButtonStyle,
  talkOptButton,
  talkOptCheck
} from './GameModeTalkConstants';
import { Dialogue } from '../../dialogue/DialogueTypes';
import { sleep } from '../../utils/GameUtils';
import { getBackToMenuContainer } from '../GameModeHelper';
import { GameLocationAttr } from '../../location/GameMapTypes';
import { screenSize } from '../../commons/CommonConstants';
import { entryTweenProps, exitTweenProps } from '../../effects/FlyEffect';

class GameModeTalk implements IGameUI {
  private uiContainer: Phaser.GameObjects.Container | undefined;
  private locationName: string;
  private dialogues: Map<DialogueId, Dialogue>;
  private gameButtons: GameButton[];

  constructor(
    locationName: string,
    talkTopics: DialogueId[],
    dialogues: Map<DialogueId, Dialogue>
  ) {
    this.uiContainer = undefined;
    this.locationName = locationName;
    this.dialogues = dialogues;
    this.gameButtons = [];
    this.createGameButtons(talkTopics);
  }

  private async createGameButtons(dialogueIds: DialogueId[]) {
    // Refresh Buttons
    this.gameButtons = [];

    await dialogueIds.forEach(dialogueId => {
      const dialogue = this.dialogues.get(dialogueId);
      if (dialogue) {
        this.addTalkOptionButton(
          dialogue.title,
          async () => {
            this.deactivateUI();
            GameActionManager.getInstance().triggerInteraction(dialogueId);
            await GameActionManager.getInstance().bringUpDialogue(dialogue.content);
            this.activateUI();
          },
          dialogueId
        );
      }
    });
  }

  private addTalkOptionButton(name: string, callback: any, interactionId: string) {
    const newNumberOfButtons = this.gameButtons.length + 1;
    const partitionSize = talkButtonYSpace / newNumberOfButtons;

    const newYPos = (screenSize.y - talkButtonYSpace + partitionSize) / 2;

    // Rearrange existing buttons
    for (let i = 0; i < this.gameButtons.length; i++) {
      this.gameButtons[i] = {
        ...this.gameButtons[i],
        assetYPos: newYPos + i * partitionSize
      };
    }

    // Add the new button
    const newTalkButton: GameButton = {
      text: name,
      style: talkButtonStyle,
      assetKey: talkOptButton.key,
      assetXPos: screenSize.x / 2,
      assetYPos: newYPos + this.gameButtons.length * partitionSize,
      isInteractive: true,
      onInteract: callback,
      interactionId: interactionId
    };

    // Update
    this.gameButtons.push(newTalkButton);
  }

  public fetchLatestState(): void {
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

    this.gameButtons.forEach((topicButton: GameButton) => {
      const text = topicButton.text || '';
      const style = topicButton.style || {};
      const topicButtonText = new Phaser.GameObjects.Text(
        gameManager,
        topicButton.assetXPos,
        topicButton.assetYPos,
        text,
        style
      ).setOrigin(0.5, 0.25);

      const checkedSprite = new Phaser.GameObjects.Sprite(
        gameManager,
        topicButton.assetXPos,
        topicButton.assetYPos,
        talkOptCheck.key
      );

      const buttonSprite = new Phaser.GameObjects.Sprite(
        gameManager,
        topicButton.assetXPos,
        topicButton.assetYPos,
        topicButton.assetKey
      ).setInteractive({ pixelPerfect: true, useHandCursor: true });

      buttonSprite.addListener(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, topicButton.onInteract);

      talkMenuContainer.add(buttonSprite);
      talkMenuContainer.add(topicButtonText);

      const isTriggeredTopic =
        !!topicButton.interactionId &&
        GameActionManager.getInstance().hasTriggeredInteraction(topicButton.interactionId);
      if (isTriggeredTopic) {
        talkMenuContainer.add(checkedSprite);
      }
    });

    talkMenuContainer.add(getBackToMenuContainer());
    return talkMenuContainer;
  }

  public async activateUI(): Promise<void> {
    const gameManager = GameActionManager.getInstance().getGameManager();
    if (!gameManager) {
      throw console.error('ActivateUI: Game Manager is not defined!');
    }

    // Fetch latest state if location is not yet visited
    const hasUpdates = GameActionManager.getInstance().hasLocationUpdate(this.locationName);
    if (hasUpdates || !this.uiContainer) {
      if (this.uiContainer) {
        this.uiContainer.destroy();
      }
      this.fetchLatestState();
      this.uiContainer = await this.getUIContainer();
      gameManager.add.existing(this.uiContainer);
    }

    if (this.uiContainer) {
      this.uiContainer.setActive(true);
      this.uiContainer.setVisible(true);
      this.uiContainer.setPosition(this.uiContainer.x, -screenSize.y);

      gameManager.tweens.add({
        targets: this.uiContainer,
        ...entryTweenProps
      });
    }
  }

  public async deactivateUI(): Promise<void> {
    const gameManager = GameActionManager.getInstance().getGameManager();
    if (!gameManager) {
      throw console.error('DeactivateUI: Game Manager is not defined!');
    }

    if (this.uiContainer) {
      this.uiContainer.setPosition(this.uiContainer.x, 0);

      gameManager.tweens.add({
        targets: this.uiContainer,
        ...exitTweenProps
      });

      await sleep(500);
      this.uiContainer.setVisible(false);
      this.uiContainer.setActive(false);
    }
  }
}

export default GameModeTalk;
