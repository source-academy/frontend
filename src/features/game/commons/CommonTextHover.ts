import { HexColor } from '../utils/StyleUtils';
import { createBitmapText } from '../utils/TextUtils';
import { Constants } from './CommonConstants';
import { BitmapFontStyle } from './CommonTypes';

const textPad = 10;

/**
 * A container that can be used as simple text hover.
 * Its visibility is set to false by default.
 * The container only consists of a simple rectangle with text on top.
 *
 * The container still needs to be attached to an object.
 * i.e. on GAMEOBJECT_POINTER_OVER => hoverContainer.setVisibility(true)
 *      on GAMEOBJECT_POINTER_OUT => hoverContainer.setVisibility(false)
 *      on GAMEOBJECT_POINTER_MOVE => hoverContainer.x = pointer.x;
 *                                    hoverContainer.y = pointer.y;
 */
class CommonTextHover extends Phaser.GameObjects.Container {
  /**
   * @param scene scene for the container to attach to
   * @param x x position of the container
   * @param y y position of the container
   * @param text message to be displayed
   * @param style style to be applied to the text
   */
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
    const hoverText = createBitmapText(
      this.scene,
      text,
      { x: textPad, y: 0, oriX: 0.0, oriY: 0.5 },
      style
    );
    this.add([hoverTextBg, hoverText]);
    this.setVisible(false);
  }
}

export default CommonTextHover;
