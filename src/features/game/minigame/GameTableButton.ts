import { Constants } from '../commons/CommonConstants';
import { BitmapFontStyle, TextConfig } from '../commons/CommonTypes';
import { HexColor } from '../utils/StyleUtils';
import { createBitmapText } from '../utils/TextUtils';

/**
 * A container that contains a button for a GameTable
 * 
 * A button consists of a number and min/max values.
 * Clicking the button increments the number by 1 (though this
 * behavior can be modified)
 */
class GameTableButton extends Phaser.GameObjects.Container {
  // Stores numerical information about the button.
  private currentValue: number;
  private minValue: number;
  private maxValue: number;
  private activeValue: Phaser.GameObjects.Container | undefined;

  // Stores information about the dimensions of the button.
  private button: Phaser.GameObjects.Rectangle;
  private rectWidth: number;
  private rectHeight: number;
  private choiceTextConfig: TextConfig;
  private bitmapTextStyle: BitmapFontStyle;

  // This boolean determines whether to show the value in the button as text.
  private showText = true;

  /**
   * @param scene scene for the container to attach to
   * @param defaultValue default value, usually 0
   * @param minValue
   * @param maxValue min and max values the button can take on
   * @param choiceTextConfig text config to be applied to the displayed choice.
   *                         The X, Y are relative to the individual button.
   *                         Using this, we can specify where the choice should appear
   *                         e.g. on top of the button, on the side of button, optional
   * @param bitmapTextStyle style to be applied to the choices, optional
   * @param width width of container, optional
   * @param height height of container, optional
   * @param x x coordinate of the container, optional
   * @param y y coordinate of the container, optional
   * 
   */
  constructor(
    scene: Phaser.Scene,
    defaultValue = 0,
    minValue: number,
    maxValue: number,
    choiceTextConfig = { x: 0, y: 0, oriX: 0, oriY: 0 },
    x?: number,
    y?: number,
    width = 50,
    height = 50,
    bitmapTextStyle = Constants.defaultFontStyle
  ) {
    super(scene, x, y);
    this.currentValue = defaultValue;
    this.minValue = minValue;
    this.maxValue = maxValue;
    this.choiceTextConfig = choiceTextConfig;
    this.bitmapTextStyle = bitmapTextStyle;
    this.rectWidth = width;
    this.rectHeight = height;

    this.button = new Phaser.GameObjects.Rectangle(
      this.scene,
      this.x,
      this.y,
      this.rectWidth,
      this.rectHeight,
      HexColor.darkBlue
    )
    .setStrokeStyle(5, HexColor.white)
    .setInteractive({ useHandCursor: true })
    .addListener(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
      this.increment();
    });

    this.add(this.button);
    this.setText(this.currentValue);
  }

  // Increments the value inside the button by 1.
  // If the value of the button is the max value, roll back into the minimum value.
  public increment() : void {
    this.currentValue = this.currentValue === this.maxValue
                          ? this.minValue 
                          : this.currentValue + 1;
    this.setText(this.currentValue);
  }

  // Decrements the value inside the button by 1.
  // If the value of the button is the min value, roll forward into the maximum value.
  public decrement(): void {
    this.currentValue = this.currentValue === this.minValue
                          ? this.maxValue
                          : this.currentValue - 1;
    this.setText(this.currentValue);
  }

  // Change the displayed text of the button.
  // Usually called whenever the button is clicked.
  private setText(value: number) : void {
    if (this.activeValue) this.activeValue.destroy();
    if (this.showText) {
      this.activeValue = new Phaser.GameObjects.Container(
        this.scene,
        this.x,
        this.y
      );
      const choiceText = createBitmapText(
        this.scene,
        this.currentValue.toString(),
        this.choiceTextConfig,
        this.bitmapTextStyle
      );
      this.activeValue.add(choiceText);
  
      this.add(this.activeValue);
    }
  }

  // Get the current value of the button.
  public getActiveValue() : number {
    return this.currentValue;
  }

  // Change the color of the button.
  public recolor(newColor: number) {
    this.button.setFillStyle(newColor);
  }

  // Gets the current color of the button.
  public getColor() : number {
    return this.button.fillColor;
  }

  // Hide the displayed text.
  public hideText() {
    if (this.activeValue) this.activeValue.destroy();
    this.showText = false;
  }

  // Change the functionality of the button.
  public setCallback(callback: any) {
    this.button.removeAllListeners();
    this.button.addListener(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, callback);
  }
}

export default GameTableButton