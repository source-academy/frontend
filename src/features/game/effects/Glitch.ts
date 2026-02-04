import FontAssets from '../assets/FontAssets';
import { BitmapFontStyle, ILayeredScene, TextConfig } from '../commons/CommonTypes';
import { createBitmapText } from '../utils/TextUtils';

const defaultGlitchStyle: BitmapFontStyle = {
  key: FontAssets.zektonFont.key,
  size: 30,
  align: Phaser.GameObjects.BitmapText.ALIGN_CENTER
};

/**
 * Create a bitmap text that glitches.
 *
 * Internally, we make use of multiple bitmap texts and apply
 * random small displacement to the individual bitmap texts.
 *
 * Returns an array of the individual bitmap texts.
 *
 * @param scene scene to attach it to
 * @param text text to show on the screen
 * @param baseTextConfig text config to be applied as the base to the text.
 *                       All random displacement is relative to this config
 * @param style style of the bitmap text
 * @param numOfFrames number of bitmap text to be created. The larger it is,
 *                    the more glitchy it becomes; but the more expensive is the effect
 * @param maxXDisplacement maximum horizontal displacement to be applied to the text
 * @param maxYDisplacement maximum vertical displacement to be applied to the text
 */
export function createGlitchBitmapText(
  scene: ILayeredScene,
  text: string,
  baseTextConfig: TextConfig = { x: 0, y: 0, oriX: 0.5, oriY: 0.5 },
  style: BitmapFontStyle = defaultGlitchStyle,
  numOfFrames: number = 4,
  maxXDisplacement: number = 5,
  maxYDisplacement: number = 3
) {
  const textFrames = [];
  for (let i = 0; i < numOfFrames; i++) {
    const textConfig = {
      x: baseTextConfig.x + maxXDisplacement * Math.random(),
      y: baseTextConfig.y + maxYDisplacement * Math.random(),
      oriX: baseTextConfig.oriX,
      oriY: baseTextConfig.oriY
    };
    const bitmapText = createBitmapText(scene, text, textConfig, style);
    bitmapText.setAlpha(0.4).setBlendMode(Phaser.BlendModes.SCREEN);
    textFrames.push(bitmapText);
  }

  textFrames.forEach(bitmapText => {
    scene.tweens.add({
      targets: bitmapText,
      x: bitmapText.x + maxXDisplacement * Math.random(),
      y: bitmapText.y + maxYDisplacement * Math.random(),
      alpha: 0.5,
      duration: 20,
      yoyo: true,
      loop: -1,
      loopDelay: 1000 * Math.random()
    });
  });

  return textFrames;
}
