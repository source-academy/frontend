import { screenCenter } from '../commons/CommonConstants';
import Typewriter from '../effects/Typewriter';
import { textPadding, dialogueRect } from './GameDialogueConstants';
import ImageAssets from '../assets/ImageAssets';

export function createDialogueBox(scene: Phaser.Scene) {
  const dialogueBox = new Phaser.GameObjects.Image(
    scene,
    screenCenter.x,
    screenCenter.y,
    ImageAssets.speechBox.key
  ).setAlpha(0.9);
  return dialogueBox;
}

export function createTypewriter(
  scene: Phaser.Scene,
  style: Phaser.Types.GameObjects.Text.TextStyle
) {
  const typewriter = Typewriter(scene, {
    x: dialogueRect.x + textPadding.x,
    y: dialogueRect.y + textPadding.y,
    textStyle: style
  });
  return typewriter;
}
