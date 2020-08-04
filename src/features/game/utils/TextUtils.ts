import { BitmapFontStyle, TextConfig } from '../commons/CommonTypes';

/**
 * Create bitmap text with the given style.
 *
 * @param scene scene to be attached to
 * @param text message to be shon
 * @param x x coordinate in worldspace
 * @param y y coordinate in worldspace
 * @param style style to be applied to the bitmap text
 * @returns {Phaser.GameObjects.BitmapText}
 */
export const createBitmapText = (
  scene: Phaser.Scene,
  text: string,
  { x, y, oriX, oriY }: TextConfig,
  style: BitmapFontStyle
) => {
  return new Phaser.GameObjects.BitmapText(
    scene,
    x,
    y,
    style.key,
    text,
    style.size,
    style.align
  ).setOrigin(oriX, oriY);
};
