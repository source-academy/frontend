import { screenCenter } from '../commons/CommonConstants';
import Typewriter from '../effects/Typewriter';
import { speechBox } from '../commons/CommonAssets';
import { textPadding, dialogueRect } from '../dialogue/DialogueConstants';

export function createDialogueBox(scene: Phaser.Scene) {
  const dialogueBox = new Phaser.GameObjects.Image(
    scene,
    screenCenter.x,
    screenCenter.y,
    speechBox.key
  ).setAlpha(0.8);
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
