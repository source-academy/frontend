import { Color } from '../utils/styles';
import { Constants as c, Keys as k } from '../utils/constants';
import { fadeIn, fadeAndDestroy } from '../utils/effects';

import { dialogueGenerator } from './DialogueManager';
import { DialogueObject, SpeakerDetail, DialogueString } from './DialogueTypes';
import { avatarKey, caps } from './DialogueHelper';
import { resize } from '../utils/spriteUtils';

type Container = Phaser.GameObjects.Container;
type Image = Phaser.GameObjects.Image;
type Text = Phaser.GameObjects.Text;
type Callback = () => void;
const { Container, Image, Text } = Phaser.GameObjects;

type DialogueGenerator = () => [SpeakerDetail | null, DialogueString];
type LineChangeFn = (line: string) => void;
type SpeakerChangeFn = (speakerDetail: SpeakerDetail | null) => void;

const margin = 10;
const xOffset = margin;
const yOffset = 730;
const boxWidth = c.screenWidth - margin * 2;
const boxHeight = 400;

const textXPadding = 80;
const textXOffset = xOffset + textXPadding;
const textYOffset = yOffset + 130;

const nameXOffset = xOffset + 130;
const nameYOffset = yOffset + 45;

const textWidth = boxWidth - textXPadding * 2;

const avatarX = 350;
const avatarY = 800;
const avatarHeight = c.screenHeight * 0.4;

const typeWriterText = {
  fontFamily: 'Arial',
  fontSize: '36px',
  fill: Color.white,
  align: 'left',
  lineSpacing: 10,
  wordWrap: { width: textWidth }
};

const speakerTextStyle = {
  ...typeWriterText,
  fontStyle: 'bold'
};

/* Dialogue Container */
export function createDialogue(scene: Phaser.Scene, dialogueObject: DialogueObject) {
  // Preload contents
  const dialogueBox = createDialogueBox(scene);
  const [avatarContainer, speakerText, changeSpeaker] = avatarManager(scene);
  const [typeWriterSprite, changeLine] = typeWriterManager(scene);
  const generateDialogue = dialogueGenerator(dialogueObject);

  const container = new Container(scene, 0, 0).setAlpha(0);
  container.add([avatarContainer, dialogueBox, speakerText, typeWriterSprite]);

  // Destroy function
  const destroyContainer = () => {
    fadeAndDestroy(scene, container);
  };

  // Create function
  const activateContainer = () => {
    scene.add.existing(container);
    scene.add.tween(fadeIn([container], c.fadeDuration * 2));
    dialogueBox
      .setInteractive({ useHandCursor: true, pixelPerfect: true })
      .on('pointerdown', () =>
        onClick(generateDialogue, changeSpeaker, changeLine, destroyContainer)
      );
  };

  return [activateContainer, destroyContainer];
}

/* Render next line on click */
function onClick(
  generateDialogue: DialogueGenerator,
  changeSpeaker: SpeakerChangeFn,
  changeLine: LineChangeFn,
  destroyContainer: Callback
) {
  const [speakerDetail, line] = generateDialogue();
  changeLine(line);
  changeSpeaker(speakerDetail);
  if (!line) destroyContainer();
}

/* Text sprite manager to produce typewriter effect */
function typeWriterManager(scene: Phaser.Scene): [Text, LineChangeFn] {
  const textSprite = new Text(scene, textXOffset, textYOffset, '', typeWriterText);

  let line = '';
  let charPointer = 0;
  let typeWriting: NodeJS.Timeout;

  /* Reset line and type out */
  const changeLine = (message: string) => {
    if (!message) return;
    line = message;

    textSprite.text = '';
    charPointer = 0;

    typeWriting && clearInterval(typeWriting);
    typeWriting = setInterval(() => {
      textSprite.text += line[charPointer++];
      if (charPointer === line.length) {
        clearInterval(typeWriting);
      }
    }, c.typeWriterInterval);
  };

  return [textSprite, changeLine];
}

/* Renders avatar and speaker text */
function avatarManager(scene: Phaser.Scene): [Container, Text, SpeakerChangeFn] {
  let avatar: Image | null;
  const container = new Container(scene, 0, 0, []);
  const speakerText = new Text(scene, nameXOffset, nameYOffset, '', speakerTextStyle);

  // Reload avatar and speaker
  const changeSpeaker = (speakerDetail: SpeakerDetail | null) => {
    if (!speakerDetail) return;
    fadeAndDestroy(scene, avatar);
    avatar = createAvatar(scene, speakerDetail);
    avatar && container.add(avatar);
    speakerText.text = caps(speakerDetail[0]);
  };

  return [container, speakerText, changeSpeaker];
}

function createAvatar(scene: Phaser.Scene, speakerDetail: SpeakerDetail) {
  const [speaker, expression] = speakerDetail;
  if (speaker === k.narrator) return null;

  const avatar = new Image(scene, avatarX, avatarY, avatarKey(speaker, expression))
    .setAlpha(0)
    .setOrigin(0.5, 1);

  resize(avatar, 0, avatarHeight);
  scene.add.tween(fadeIn([avatar], c.fadeDuration));
  return avatar;
}

function createDialogueBox(scene: Phaser.Scene) {
  const dialogueBox = new Image(scene, xOffset, yOffset, 'speechBox').setOrigin(0);
  resize(dialogueBox, boxWidth, boxHeight);
  return dialogueBox;
}
