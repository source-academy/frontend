import { Color, HexColor } from '../utils/StyleUtils';

const textPad = 10;
const defaultTextHoverWidth = 300;
const cursorOffSet = 20;

const textHoverStyle = {
  fontFamily: 'Verdana',
  fontSize: '15px',
  fill: Color.lightBlue,
  align: 'left',
  wordWrap: { width: defaultTextHoverWidth - textPad }
};

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
   * @param maxWidth the maximum width of the text before the text wraps
   */
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    text: string,
    maxWidth: number = defaultTextHoverWidth
  ) {
    super(scene, x, y);
    this.renderTextHover(text, maxWidth);
  }

  private renderTextHover(text: string, maxWidth: number) {
    const fontSize = parseInt(
      textHoverStyle.fontSize.substring(0, textHoverStyle.fontSize.length - 2)
    );
    const width = text.length * fontSize * 0.75;
    const hoverWidth = Math.min(width, maxWidth);
    const hoverText = new Phaser.GameObjects.Text(
      this.scene,
      cursorOffSet + textPad,
      textPad,
      text,
      {
        ...textHoverStyle,
        wordWrap: { width: hoverWidth - textPad }
      }
    );
    const hoverTextBg = new Phaser.GameObjects.Rectangle(
      this.scene,
      cursorOffSet,
      0,
      hoverWidth,
      hoverText.getBounds().bottom + textPad,
      HexColor.darkBlue
    )
      .setOrigin(0.0, 0.0)
      .setAlpha(0.8);

    this.add([hoverTextBg, hoverText]);
    this.setDepth(1); // Render hover text over other objects
    this.setVisible(false);
  }
}

export default CommonTextHover;
