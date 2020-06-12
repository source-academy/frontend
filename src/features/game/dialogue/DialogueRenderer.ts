import { Constants as c, screenSize } from '../commons/CommonConstants';
import { fadeIn, fadeAndDestroy } from '../effects/FadeEffect';

import { DialogueGenerator } from './DialogueGenerator';
import { DialogueObject } from './DialogueTypes';
import { DialogueSpeakerBox } from './DialogueSpeakerBox';
import Typewriter from '../effects/Typewriter';
import { Color } from '../utils/styles';

const boxMargin = 10;
const textPadding = 10;

const dialogueRect = {
  x: boxMargin,
  y: 730,
  width: screenSize.x - boxMargin * 2,
  height: 400
};

const typeWriterTextStyle = {
  fontFamily: 'Arial',
  fontSize: '36px',
  fill: Color.white,
  align: 'left',
  lineSpacing: 10,
  wordWrap: { width: dialogueRect.width - textPadding }
};

/* Dialogue Box Container */
export function Dialogue(scene: Phaser.Scene, dialogueObject: DialogueObject) {
  // Preload contents
  const dialogueBox = createDialogueBox(scene);
  const [typeWriterSprite, changeLine] = Typewriter(scene, {
    x: dialogueRect.x + textPadding,
    y: dialogueRect.y + textPadding,
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
    scene.add.tween(fadeIn([container], c.fadeDuration * 2));
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

/* Dialogue Box */
function createDialogueBox(scene: Phaser.Scene) {
  const dialogueBox = new Phaser.GameObjects.Image(scene, dialogueRect.x, dialogueRect.y, 'button')
    .setOrigin(0)
    .setDisplaySize(dialogueRect.width, dialogueRect.height);
  return dialogueBox;
}
