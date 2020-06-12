import { IGameUI, DialogueId } from '../../commons/CommonsTypes';
import GameActionManager from 'src/features/game/action/GameActionManager';
import {
  talkButtonYSpace,
  talkButtonStyle,
  talkOptButton,
  TalkButton
} from './GameModeTalkConstants';
import { Dialogue } from '../../dialogue/DialogueTypes';
import { sleep } from '../../utils/GameUtils';
import { getBackToMenuContainer } from '../GameModeHelper';
import { GameLocationAttr } from '../../location/GameMapTypes';
import { screenSize, screenCenter, nullFunction } from '../../commons/CommonConstants';
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
    this.dialogues = dialogues;
    this.gameButtons = [];
    this.createGameButtons(talkTopics);
  }

  private createGameButtons(dialogueIds: DialogueId[]) {
    const dialogues = dialogueIds
      .map(dialogueId => this.dialogues.get(dialogueId))
      .filter(dialogue => !!dialogue) as Dialogue[];

    this.gameButtons = dialogues.map(({ title, content }: Dialogue, dialogueIndex: number) => {
      return {
        text: title,
        style: talkButtonStyle,
        assetKey: talkOptButton.key,
        assetXPos: screenCenter.x,
        assetYPos: getButtonYPos(dialogueIndex, dialogues.length),
        isInteractive: true,
        onInteract: nullFunction,
        content
      };
    });
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
      const text = topicButton.text || '';
      const style = topicButton.style || {};
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
      ).setInteractive({ pixelPerfect: true, useHandCursor: true });

      const callback = async () => {
        gameManager.tweens.add({ targets: [talkMenuContainer], ...exitTweenProps });
        await GameActionManager.getInstance().bringUpDialogue(topicButton.content);
        gameManager.tweens.add({ targets: [talkMenuContainer], ...entryTweenProps });
      };

      buttonSprite.addListener(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, callback);

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

function getButtonYPos(dialogueIndex: number, numberOfDialogues: number) {
  const partitionSize = talkButtonYSpace / numberOfDialogues;
  const newYPos = (screenSize.y - talkButtonYSpace + partitionSize) / 2;

  return newYPos + dialogueIndex * partitionSize;
}
