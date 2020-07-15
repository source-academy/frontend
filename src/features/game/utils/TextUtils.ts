import { BitmapFontStyle } from '../commons/CommonTypes';

export const createBitmapText = (
  scene: Phaser.Scene,
  text: string,
  x: number,
  y: number,
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
  ).setTintFill(style.fill);
};
