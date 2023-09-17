import ImageAssets from 'src/features/game/assets/ImageAssets';
import SoundAssets from 'src/features/game/assets/SoundAssets';
import CommonBackButton from 'src/features/game/commons/CommonBackButton';
import { screenSize } from 'src/features/game/commons/CommonConstants';
import { IGameUI, ItemId } from 'src/features/game/commons/CommonTypes';
import { fadeAndDestroy } from 'src/features/game/effects/FadeEffect';
import { entryTweenProps, exitTweenProps } from 'src/features/game/effects/FlyEffect';
import { Layer } from 'src/features/game/layer/GameLayerTypes';
import { GameItemType } from 'src/features/game/location/GameMapTypes';
import { GamePhaseType } from 'src/features/game/phase/GamePhaseTypes';
import GameGlobalAPI from 'src/features/game/scenes/gameManager/GameGlobalAPI';
import { createButton } from 'src/features/game/utils/ButtonUtils';
import { mandatory, sleep } from 'src/features/game/utils/GameUtils';
import { calcTableFormatPos, Direction } from 'src/features/game/utils/StyleUtils';

import TalkModeConstants, { talkButtonStyle } from './GameModeTalkConstants';

/**
 * The class renders the "Talk" UI which displays
 * a selection of all the dialogues that players can
 * talk about in a location.
 */
class GameModeTalk implements IGameUI {
  private uiContainer: Phaser.GameObjects.Container | undefined;

  /**
   * Fetches the talk topics of the current location id.
   */
  private getLatestTalkTopics() {
    return GameGlobalAPI.getInstance().getGameItemsInLocation(
      GameItemType.talkTopics,
      GameGlobalAPI.getInstance().getCurrLocId()
    );
  }

  /**
   * Create the container that encapsulate the 'Talk' mode UI,
   * i.e. the talk topics, the back button, as well the checked
   * icon for triggered talk topics.
   */
  private createUIContainer() {
    const gameManager = GameGlobalAPI.getInstance().getGameManager();
    const talkMenuContainer = new Phaser.GameObjects.Container(gameManager, 0, 0);

    // Add talk topics of the location
    const talkTopics = this.getLatestTalkTopics();
    const buttons = this.getTalkTopicButtons(talkTopics);
    const buttonPositions = calcTableFormatPos({
      direction: Direction.Column,
      numOfItems: buttons.length,
      maxYSpace: TalkModeConstants.button.ySpace
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
      async () => await GameGlobalAPI.getInstance().swapPhase(GamePhaseType.Menu)
    );
    talkMenuContainer.add(backButton);
    return talkMenuContainer;
  }

  /**
   * Get the talk topics button preset to be formatted later.
   * The preset includes the text to be displayed on the button and
   * its functionality (dialogue callback).
   *
   * @param dialogueIds dialogue IDs to create talk topics from
   */
  private getTalkTopicButtons(dialogueIds: ItemId[]) {
    return dialogueIds.map(dialogueId => {
      const dialogue = mandatory(GameGlobalAPI.getInstance().getDialogueById(dialogueId));
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

  /**
   * Format the button information to a UI container, complete with
   * styling and functionality.
   *
   * @param text text to be displayed on the button
   * @param xPos x position of the button
   * @param yPos y position of the button
   * @param callback callback to be executed on click
   */
  private createTalkTopicButton(text: string, xPos: number, yPos: number, callback: any) {
    const gameManager = GameGlobalAPI.getInstance().getGameManager();
    return createButton(gameManager, {
      assetKey: ImageAssets.talkOptButton.key,
      message: text,
      textConfig: { x: 0, y: 0, oriX: 0.5, oriY: 0.2 },
      bitMapTextStyle: talkButtonStyle,
      onUp: callback
    }).setPosition(xPos, yPos);
  }

  /**
   * Activate the 'Talk' mode UI.
   *
   * Usually only called by the phase manager when 'Talk' phase is
   * pushed.
   */
  public async activateUI(): Promise<void> {
    const gameManager = GameGlobalAPI.getInstance().getGameManager();
    this.uiContainer = this.createUIContainer();
    GameGlobalAPI.getInstance().addToLayer(Layer.UI, this.uiContainer);

    this.uiContainer.setPosition(this.uiContainer.x, -screenSize.y);

    gameManager.tweens.add({
      targets: this.uiContainer,
      ...entryTweenProps
    });
    GameGlobalAPI.getInstance().playSound(SoundAssets.modeEnter.key);
  }

  /**
   * Deactivate the 'Talk' mode UI.
   *
   * Usually only called by the phase manager when 'Talk' phase is
   * transitioned out.
   */
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
