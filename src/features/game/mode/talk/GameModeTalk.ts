import GameGlobalAPI from 'src/features/game/scenes/gameManager/GameGlobalAPI';

import ImageAssets from '../../assets/ImageAssets';
import CommonBackButton from '../../commons/CommonBackButton';
import { screenSize } from '../../commons/CommonConstants';
import { IGameUI, ItemId } from '../../commons/CommonTypes';
import { Dialogue } from '../../dialogue/GameDialogueTypes';
import { fadeAndDestroy } from '../../effects/FadeEffect';
import { entryTweenProps, exitTweenProps } from '../../effects/FlyEffect';
import { Layer } from '../../layer/GameLayerTypes';
import { GameLocationAttr } from '../../location/GameMapTypes';
import { createButton } from '../../utils/ButtonUtils';
import { mandatory,sleep } from '../../utils/GameUtils';
import { calcTableFormatPos } from '../../utils/StyleUtils';
import { talkButtonStyle,talkButtonYSpace } from './GameModeTalkConstants';

class GameModeTalk implements IGameUI {
  private uiContainer: Phaser.GameObjects.Container | undefined;

  private getLatestTalkTopics() {
    return GameGlobalAPI.getInstance().getLocationAttr(
      GameLocationAttr.talkTopics,
      GameGlobalAPI.getInstance().getCurrLocId()
    );
  }

  private createUIContainer() {
    const gameManager = GameGlobalAPI.getInstance().getGameManager();
    const talkMenuContainer = new Phaser.GameObjects.Container(gameManager, 0, 0);

    const talkTopics = this.getLatestTalkTopics();
    const buttons = this.getTalkTopicButtons(talkTopics);
    const buttonPositions = calcTableFormatPos({
      numOfItems: buttons.length,
      maxYSpace: talkButtonYSpace
    });

    talkMenuContainer.add(
      buttons.map((button, index) =>
        this.createTalkTopicButton(
          button.text,
          buttonPositions[index][0],
          buttonPositions[index][1],
          button.callback
        )
      )
    );

    // Add check for interacted talk topics
    buttons.forEach((button, index) => {
      const checkedSprite = new Phaser.GameObjects.Sprite(
        gameManager,
        buttonPositions[index][0],
        buttonPositions[index][1],
        ImageAssets.talkOptCheck.key
      );

      const isTriggeredTopic =
        !!button.interactionId &&
        GameGlobalAPI.getInstance().hasTriggeredInteraction(button.interactionId);

      if (isTriggeredTopic) {
        talkMenuContainer.add(checkedSprite);
      }
    });

    const backButton = new CommonBackButton(
      gameManager,
      () => GameGlobalAPI.getInstance().popPhase(),
      0,
      0,
      gameManager.soundManager
    );
    talkMenuContainer.add(backButton);
    return talkMenuContainer;
  }

  private getTalkTopicButtons(dialogueIds: ItemId[]) {
    return dialogueIds.map(dialogueId => {
      const dialogue = mandatory(GameGlobalAPI.getInstance().getDialogue(dialogueId)) as Dialogue;
      return {
        text: dialogue.title,
        callback: async () => {
          GameGlobalAPI.getInstance().triggerInteraction(dialogueId);
          await GameGlobalAPI.getInstance().showDialogue(dialogueId);
        },
        interactionId: dialogueId
      };
    });
  }

  private createTalkTopicButton(text: string, xPos: number, yPos: number, callback: any) {
    const gameManager = GameGlobalAPI.getInstance().getGameManager();
    return createButton(
      gameManager,
      {
        assetKey: ImageAssets.talkOptButton.key,
        message: text,
        textConfig: { x: 0, y: 0, oriX: 0.5, oriY: 0.2 },
        bitMapTextStyle: talkButtonStyle,
        onUp: callback,
        onHoverEffect: false
      },
      gameManager.soundManager
    ).setPosition(xPos, yPos);
  }

  public async activateUI(): Promise<void> {
    const gameManager = GameGlobalAPI.getInstance().getGameManager();
    this.uiContainer = this.createUIContainer();
    GameGlobalAPI.getInstance().addContainerToLayer(Layer.UI, this.uiContainer);

    this.uiContainer.setPosition(this.uiContainer.x, -screenSize.y);

    gameManager.tweens.add({
      targets: this.uiContainer,
      ...entryTweenProps
    });
  }

  public async deactivateUI(): Promise<void> {
    const gameManager = GameGlobalAPI.getInstance().getGameManager();
    if (this.uiContainer) {
      this.uiContainer.setPosition(this.uiContainer.x, 0);

      gameManager.tweens.add({
        targets: this.uiContainer,
        ...exitTweenProps
      });

      await sleep(500);
      fadeAndDestroy(gameManager, this.uiContainer);
    }
  }
}

export default GameModeTalk;
