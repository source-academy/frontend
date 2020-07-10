import { BitmapFontStyle } from './CommonTypes';
import { Constants } from './CommonConstants';
import { HexColor } from '../utils/StyleUtils';
import { createBitmapText } from '../utils/TextUtils';

const textPad = 10;

class CommonTextHover extends Phaser.GameObjects.Container {
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    text: string,
    style: BitmapFontStyle = Constants.defaultFontStyle
  ) {
    super(scene, x, y);
    this.renderTextHover(text, style);
  }

  private renderTextHover(text: string, style: BitmapFontStyle) {
    const hoverTextBg = new Phaser.GameObjects.Rectangle(
      this.scene,
      0,
      0,
      text.length * style.size * 0.7,
      style.size * 2,
      HexColor.darkBlue
    )
      .setOrigin(0.0, 0.5)
      .setAlpha(0.8);
    const hoverText = createBitmapText(this.scene, text, textPad, 0, style).setOrigin(0.0, 0.5);
    this.add([hoverTextBg, hoverText]);
    this.setVisible(false);
  }
}

export default CommonTextHover;
