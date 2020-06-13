import { Constants, screenSize } from '../commons/CommonConstants';
import { fadeIn, fadeAndDestroy } from '../effects/FadeEffect';

import DialogueGenerator from './DialogueGenerator';
import { DialogueObject } from './DialogueTypes';
import DialogueSpeakerBox from './DialogueSpeakerBox';
import Typewriter from '../effects/Typewriter';
import { Color } from '../utils/styles';
import { speechBox } from '../commons/CommonAssets';

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

/* Dialogue Box Container */
export function createDialogue(scene: Phaser.Scene, dialogueObject: DialogueObject) {
  // Preload contents
  const dialogueBox = createDialogueBox(scene);
  const [typeWriterSprite, changeLine] = Typewriter(scene, {
    x: dialogueRect.x + textPadding.x,
    y: dialogueRect.y + textPadding.y,
    textStyle: typeWriterTextStyle
  });

  const [speakerBox, changeSpeaker] = DialogueSpeakerBox(scene);
  const generateDialogue = DialogueGenerator(dialogueObject);

  const container = new Phaser.GameObjects.Container(scene, 0, 0).setAlpha(0);
  container.add([dialogueBox, speakerBox, typeWriterSprite]);

  // Destroy function
  const destroyContainer = () => {
    fadeAndDestroy(scene, container);
  };

  // Create function
  const activateContainer = new Promise(res => {
    scene.add.existing(container);
    scene.add.tween(fadeIn([container], Constants.fadeDuration * 2));
    dialogueBox
      .setInteractive({ useHandCursor: true, pixelPerfect: true })
      .on('pointerdown', () => {
        const [speakerDetail, line] = generateDialogue();
        changeLine(line);
        changeSpeaker(speakerDetail);
        if (!line) {
          res('done');
          destroyContainer();
        }
      });
  });

  return [activateContainer, destroyContainer];
}

/* Speech Box */
function createDialogueBox(scene: Phaser.Scene) {
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
