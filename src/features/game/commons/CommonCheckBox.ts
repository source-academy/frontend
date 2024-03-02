import SoundAssets from '../assets/SoundAssets';
import { BitmapFontStyle, TextConfig } from '../commons/CommonTypes';
import SourceAcademyGame from '../SourceAcademyGame';
import { HexColor } from '../utils/StyleUtils';
import { createBitmapText } from '../utils/TextUtils';
import { AssetKey } from './CommonTypes';

type CheckboxConfig = {
  sideLength: number;
  outlineThickness: number;
};

/**
 * A container that contains a checkbox.
 * A checkbox can be toggled on or off by clicking on it.
 */

class CommonCheckBox extends Phaser.GameObjects.Container {
  private checkboxClickSoundKey: AssetKey;

  private checkboxConfig: CheckboxConfig;
  private checkboxValue: boolean;

  private checkboxImage: Phaser.GameObjects.Rectangle | undefined;
  private choiceTextConfig: TextConfig;
  private bitmapTextStyle: BitmapFontStyle;
  private text: string;

  /**
   * @param scene scene for the container to attach to
   * @param defaultChoiceValue value oof default choice, optional
   * @param outlineThickness apply stroke effect on the checkbox
   * @param x x coordinate of the container, optional
   * @param y y coordinate of the container, optional
   * @param sideLength length of the sides of the checkbox
   * @param soundManager if defined, the checkbox will play sounds when clicked
   * @param checkboxClickSoundKey require soundManager to be defined; Sound key to play
   *                              when checkbox is clicked, optional
   */
  constructor(
    scene: Phaser.Scene,
    defaultChoiceValue = false,
    checkboxConfig = {
      sideLength: 50,
      outlineThickness: 5
    },
    textConfig: TextConfig,
    bitmapTextStyle: BitmapFontStyle,
    x?: number,
    y?: number,
    text = '',
    checkboxClickSoundKey: AssetKey = SoundAssets.radioButtonClick.key
  ) {
    super(scene, x, y);
    this.checkboxValue = defaultChoiceValue;
    this.checkboxConfig = checkboxConfig;
    this.checkboxClickSoundKey = checkboxClickSoundKey;
    this.choiceTextConfig = textConfig;
    this.bitmapTextStyle = bitmapTextStyle;
    this.text = text;

    this.render();
  }

  /**
   * Replace checkbox with checked/unchecked version, depending on prior state
   */
  private activate(): void {
    this.checkboxValue = !this.checkboxValue;
    if (this.checkboxImage) this.checkboxImage.destroy();
    this.render();
  }

  /**
   * Ensures the correct checkbox is rendered at all times
   */
  private render(): void {
    const color = this.checkboxValue ? HexColor.offWhite : HexColor.darkBlue;
    this.checkboxImage = new Phaser.GameObjects.Rectangle(
      this.scene,
      this.x,
      this.y,
      this.checkboxConfig.sideLength,
      this.checkboxConfig.sideLength,
      color
    )
      .setStrokeStyle(this.checkboxConfig.outlineThickness, HexColor.white)
      .setInteractive({ useHandCursor: true })
      .addListener(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
        SourceAcademyGame.getInstance().getSoundManager().playSound(this.checkboxClickSoundKey);
        this.activate();
      });
    this.add(this.checkboxImage);
    const textbox = new Phaser.GameObjects.Container(this.scene, this.x, this.y);
    textbox.add(
      createBitmapText(this.scene, this.text, this.choiceTextConfig, this.bitmapTextStyle)
    );
    this.add(textbox);
  }

  /**
   * Gets the value of the checkbox.
   *
   * @returns true if the checkbox is ticked, false otherwise
   */
  public getChoice(): boolean {
    return this.checkboxValue;
  }
}

export default CommonCheckBox;
