import { IGameUI, GameButton, ItemId } from '../../commons/CommonsTypes';
import GameActionManager from 'src/features/game/action/GameActionManager';
import { talkButtonYSpace, talkButtonStyle } from './GameModeTalkConstants';
import { sleep } from '../../utils/GameUtils';
import { GameLocationAttr } from '../../location/GameMapTypes';
import { screenSize, screenCenter } from '../../commons/CommonConstants';
import { entryTweenProps, exitTweenProps } from '../../effects/FlyEffect';
import { talkOptButton, talkOptCheck } from '../../commons/CommonAssets';
import { Layer } from '../../layer/GameLayerTypes';
import CommonBackButton from '../../commons/CommonBackButton';

class GameModeTalk implements IGameUI {
  private uiContainer: Phaser.GameObjects.Container | undefined;
  private gameButtons: GameButton[];

  constructor() {
    this.gameButtons = [];
  }

  public fetchLatestState(): void {
    const talkTopics = GameActionManager.getInstance().getLocationAttr(
      GameLocationAttr.talkTopics,
      GameActionManager.getInstance().getCurrLocId()
    );
    if (!talkTopics) {
      return;
    }
    this.createGameButtons(talkTopics);
  }

  private async createGameButtons(dialogueIds: ItemId[]) {
    // Refresh Buttons
    this.gameButtons = [];

    dialogueIds.forEach(dialogueId => {
      const dialogue = GameActionManager.getInstance().getDialogue(dialogueId);
      if (dialogue) {
        this.addTalkOptionButton(
          dialogue.title,
          async () => {
            GameActionManager.getInstance().triggerInteraction(dialogueId);
            await GameActionManager.getInstance().bringUpDialogue(dialogueId);
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
      assetXPos: screenCenter.x,
      assetYPos: newYPos + this.gameButtons.length * partitionSize,
      isInteractive: true,
      onInteract: callback,
      interactionId: interactionId
    };

    // Update
    this.gameButtons.push(newTalkButton);
  }

  public getUIContainer(): Phaser.GameObjects.Container {
    const gameManager = GameActionManager.getInstance().getGameManager();
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

    const backButton = new CommonBackButton(
      gameManager,
      () => GameActionManager.getInstance().getGameManager().phaseManager.popPhase(),
      0,
      0
    );
    talkMenuContainer.add(backButton);
    return talkMenuContainer;
  }

  public async activateUI(): Promise<void> {
    this.gameButtons = [];
    this.fetchLatestState();
    const gameManager = GameActionManager.getInstance().getGameManager();

    this.fetchLatestState();
    this.uiContainer = await this.getUIContainer();
    GameActionManager.getInstance().addContainerToLayer(Layer.UI, this.uiContainer);

    this.uiContainer.setActive(true);
    this.uiContainer.setVisible(true);
    this.uiContainer.setPosition(this.uiContainer.x, -screenSize.y);

    gameManager.tweens.add({
      targets: this.uiContainer,
      ...entryTweenProps
    });
  }

  public async deactivateUI(): Promise<void> {
    const gameManager = GameActionManager.getInstance().getGameManager();

    if (this.uiContainer) {
      this.uiContainer.setPosition(this.uiContainer.x, 0);

      gameManager.tweens.add({
        targets: this.uiContainer,
        ...exitTweenProps
      });

      await sleep(500);
      this.uiContainer.setVisible(false);
      this.uiContainer.setActive(false);
      this.uiContainer.destroy();
      this.uiContainer = undefined;
    }
  }
}

export default GameModeTalk;
