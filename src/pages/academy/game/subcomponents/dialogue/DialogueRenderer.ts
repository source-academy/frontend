import { PhaserScene, PhaserImage } from '../utils/extendedPhaser';
import { Color, hex } from '../utils/styles';
import { Constants as c, Keys as k } from '../utils/constants';
import { dialogueGenerator } from './DialogueManager';
import { DialogueObject, SpeakerDetail, DialogueString } from './DialogueTypes';
import { avatarKey } from './DialogueHelper';
import { fadeIn, fadeAndDestroy } from '../utils/effects';

type Rectangle = Phaser.GameObjects.Rectangle;
type DialogueGenerator = () => [SpeakerDetail | null, DialogueString];
type LineChangeFn = (line: string) => void;
type SpeakerChangeFn = (speakerDetail: SpeakerDetail | null) => void;

const margin = 20;
const xOffset = margin;
const yOffset = 800;
const padding = 50;

const boxWidth = c.screenWidth - margin * 2;
const textWidth = boxWidth - padding * 2;
const boxHeight = c.screenHeight - yOffset - margin;

const avatarY = c.centerY + 30;

const typeWriterText = {
  fontFamily: 'Arial',
  fontSize: '36px',
  fill: Color.white,
  align: 'left',
  wordWrap: { width: textWidth }
};

type Deleter = () => void;

export function renderDialogue(scene: PhaserScene, dialogueObject: DialogueObject) {
  // const container = new PhaserContainer(scene, 0, 0);
  const dialogueBox = drawDialogueBox(scene).setInteractive({ useHandCursor: true });
  const generateDialogue = dialogueGenerator(dialogueObject);
  const changeSpeaker = avatarManager(scene);
  const changeLine = typeWriterManager(scene);
  dialogueBox.on('pointerdown', () =>
    updateDialogue(scene, dialogueBox, generateDialogue, changeSpeaker, changeLine)
  );
}

function updateDialogue(
  scene: PhaserScene,
  dialogueBox: Rectangle,
  generateDialogue: DialogueGenerator,
  changeSpeaker: SpeakerChangeFn,
  changeLine: LineChangeFn
) {
  const [speakerDetail, line] = generateDialogue();
  changeLine(line);
  changeSpeaker(speakerDetail);
  if (!line) fadeAndDestroy(scene, dialogueBox);
}

function typeWriterManager(scene: PhaserScene) {
  let typeWriterDeleter: Deleter;
  const changeLine = (line: string) => {
    typeWriterDeleter && typeWriterDeleter();
    typeWriterDeleter = createTypeWriter(scene, line);
  };
  return changeLine;
}

function avatarManager(scene: PhaserScene) {
  let avatar: PhaserImage | null;
  const changeSpeaker = (speakerDetail: SpeakerDetail | null) => {
    if (!speakerDetail) return;
    avatar && fadeAndDestroy(scene, avatar);
    avatar = addAvatar(scene, speakerDetail);
  };
  return changeSpeaker;
}

function addAvatar(scene: PhaserScene, speakerDetail: SpeakerDetail) {
  const [speaker, expression] = speakerDetail;
  if (speaker === k.narrator) return null;
  const avatar = scene
    .addImage(c.centerX, avatarY, avatarKey(speaker, expression))
    .resize(c.screenWidth / 3)
    .setAlpha(0);
  scene.add.tween(fadeIn([avatar], c.fadeDuration));
  return avatar;
}

function drawDialogueBox(scene: PhaserScene) {
  const dialogueBox = scene.add
    .rectangle(xOffset, yOffset, boxWidth, boxHeight, hex(Color.black))
    .setOrigin(0, 0)
    .setAlpha(0.8);
  scene.add.tween(fadeIn([dialogueBox], c.fadeDuration));
  return dialogueBox;
}

function createTypeWriter(scene: PhaserScene, line: string = ' '): Deleter {
  let charPointer = 0;
  const textSprite = scene.add.text(xOffset + padding, yOffset + padding, '', typeWriterText);
  const typeWrite = setInterval(() => {
    textSprite.text += line[charPointer++];
    if (charPointer === line.length) {
      clearInterval(typeWrite);
    }
  }, c.typeWriterInterval);

  const typeWriterDeleter = () => {
    textSprite.destroy();
    clearInterval(typeWrite);
  };

  return typeWriterDeleter;
}
