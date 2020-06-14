import { ItemId } from '../commons/CommonsTypes';
import { GameChapter } from '../chapter/GameChapterTypes';
import { Dialogue } from './DialogueTypes';

import { Constants, screenSize } from '../commons/CommonConstants';
import { fadeIn, fadeAndDestroy } from '../effects/FadeEffect';

import DialogueGenerator from './DialogueGenerator';
import DialogueSpeakerBox from './DialogueSpeakerBox';
import Typewriter from '../effects/Typewriter';
import { speechBox } from '../commons/CommonAssets';
import GameActionManager from '../action/GameActionManager';
import { Layer } from '../layer/GameLayerTypes';
import { Color } from '../utils/styles';

const boxMargin = 10;
const dialogueRect = {
  x: boxMargin,
  y: 760,
  width: screenSize.x - boxMargin * 2,
  height: 320
};

const textPadding = {
  x: 60,
  y: 90
};
const typeWriterTextStyle = {
  fontFamily: 'Arial',
  fontSize: '36px',
  fill: Color.white,
  align: 'left',
  lineSpacing: 10,
  wordWrap: { width: dialogueRect.width - textPadding.x * 2 - boxMargin * 2 }
};

export default class DialogueManager {
  private dialogueMap: Map<ItemId, Dialogue>;

  constructor() {
    this.dialogueMap = new Map<ItemId, Dialogue>();
  }

  public processDialogues(chapter: GameChapter) {
    this.dialogueMap = chapter.map.getDialogues();
  }

  public async playDialogue(dialogueId: ItemId) {
    const dialogue = this.dialogueMap.get(dialogueId);

    if (!dialogue || !dialogue.content) {
      return undefined;
    }

    const gameManager = GameActionManager.getInstance().getGameManager();
    // Preload contents
    const dialogueBox = this.createDialogueBox(gameManager);
    const [typeWriterSprite, changeLine] = Typewriter(gameManager, {
      x: dialogueRect.x + textPadding.x,
      y: dialogueRect.y + textPadding.y,
      textStyle: typeWriterTextStyle
    });

    const [speakerBox, changeSpeaker] = DialogueSpeakerBox(gameManager);
    const generateDialogue = DialogueGenerator(dialogue.content);

    const container = new Phaser.GameObjects.Container(gameManager, 0, 0).setAlpha(0);
    container.add([dialogueBox, speakerBox, typeWriterSprite]);

    const activateContainer = new Promise(res => {
      gameManager.layerManager.addToLayer(Layer.Dialogue, container);
      gameManager.add.tween(fadeIn([container], Constants.fadeDuration * 2));
      dialogueBox
        .setInteractive({ useHandCursor: true, pixelPerfect: true })
        .on('pointerdown', () => {
          const [speakerDetail, line] = generateDialogue();
          changeLine(line);
          if (speakerDetail) {
            changeSpeaker(speakerDetail);
            GameActionManager.getInstance().changeSpeaker(speakerDetail);
          }
          if (!line) {
            res('done');
            fadeAndDestroy(gameManager, container);
          }
        });
    });

    await activateContainer;
    return true;
  }

  /* Speech Box */
  private createDialogueBox(scene: Phaser.Scene) {
    const dialogueBox = new Phaser.GameObjects.Image(
      scene,
      dialogueRect.x,
      dialogueRect.y,
      speechBox.key
    )
      .setOrigin(0)
      .setDisplaySize(dialogueRect.width, dialogueRect.height)
      .setAlpha(0.8);

    return dialogueBox;
  }
}
