import ImageAssets from '../assets/ImageAssets';
import { screenCenter } from '../commons/CommonConstants';
import Typewriter from '../effects/Typewriter';
import dialogueConstants from './GameDialogueConstants';

/**
 * Helper function to render the green box shown in every dialogue/ notification popup
 */
export function createDialogueBox(scene: Phaser.Scene) {
  const dialogueBox = new Phaser.GameObjects.Image(
    scene,
    screenCenter.x,
    screenCenter.y,
    ImageAssets.speechBox.key
  ).setAlpha(0.9);
  return dialogueBox;
}

/**
 * Helper function to to generate the typewriter effect used by the dialogue renderer
 * @param scene the scene on which to place the typewriter effect
 * @param style the style of the typewriter
 */
export function createTypewriter(
  scene: Phaser.Scene,
  style: Phaser.Types.GameObjects.Text.TextStyle
) {
  const typewriter = Typewriter(scene, {
    x: dialogueConstants.rect.x + dialogueConstants.text.xPad,
    y: dialogueConstants.rect.y + dialogueConstants.text.yPad,
    textStyle: style
  });
  return typewriter;
}
