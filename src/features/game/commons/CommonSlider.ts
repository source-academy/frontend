import SoundAssets from '../assets/SoundAssets';
import SourceAcademyGame from '../SourceAcademyGame';
import { HexColor } from '../utils/StyleUtils';
import { createBitmapText } from '../utils/TextUtils';
import { Constants, screenSize } from './CommonConstants';
import { AssetKey, BitmapFontStyle, TextConfig } from './CommonTypes';

type SliderButtonConfig = {
  circleDim: number;
  dragDim: number;
  outlineThickness: number;
};

type SliderConfig = {
  minMax: [number, number];
  defaultChoiceValue?: number;
  maxXSpace?: number;
  sliderButtonConfig?: SliderButtonConfig;
  choiceTextConfig?: TextConfig;
  bitmapTextStyle?: BitmapFontStyle;
};

/**
 * A container that contains a menu slider.
 * Sliders allows user to choose any number within
 * a predefined range.
 * 
 * The slider consists of a draggable button
 * (That only changes its x-coordinate when dragged)
 * and a stationary horizontal bar.
 * 
 * The slider's choice will be displayed above the slider
 * button at all times.
 */
class CommonSlider extends Phaser.GameObjects.Container {
  private buttonClickSoundKey: AssetKey;

  private activeChoiceValue: number;
  private minMax: [number, number];
  private barExtents: [number, number];
  private activeChoice: Phaser.GameObjects.Container | undefined;

  private sliderButtonConfig: SliderButtonConfig;
  private barlength: number;
  private choiceTextConfig: TextConfig;
  private bitmapTextStyle: BitmapFontStyle;

  /**
   * @param scene scene for the container to attach to
   * @param minMax minimum and maximum values at the edges of the slider
   * @param defaultChoiceValue value of default choice, optional
   * @param maxXSpace maximum horizontal space to be used by the slider, optional
   * @param circleDim diameter of the slider button, optional
   * @param checkedDim diameter of the 'checked' slider button; commonly smaller than circleDim, optional
   * @param outlineThickness if not 0, apply stroke effect on the slider button, optional
   * @param choiceTextConfig text config to be applied to the displayed choice.
   *                         The X, Y are relative to the slider button.
   *                         Using this, we can specify where the choice should appear
   *                         e.g. on top of the slider button, on the side of slider button, optional
   * @param bitmapTextStyle style to be applied to the choice, optional
   * @param x x coordinate of the container, optional
   * @param y y coordinate of the container, optional
   * @param soundManager if defined, the slider button will play sounds when clicked, optional
   * @param buttonClickSoundKey require soundManager to be defined; Sound key to be played when
   *                            button is clicked, optioanl
   */
  constructor(
    scene: Phaser.Scene,
    {
      minMax,
      defaultChoiceValue = 0,
      maxXSpace = screenSize.x,
      sliderButtonConfig = {
        circleDim: 20,
        dragDim: 10,
        outlineThickness: 5
      },
      choiceTextConfig = { x: 0, y: 0, oriX: 0.5, oriY: 0.5 },
      bitmapTextStyle = Constants.defaultFontStyle
    }: SliderConfig,
    x?: number,
    y?: number,
    buttonClickSoundKey: AssetKey = SoundAssets.radioButtonClick.key
  ) {
    super(scene, x, y);
    this.activeChoiceValue = defaultChoiceValue;
    this.minMax = minMax;
    this.choiceTextConfig = choiceTextConfig;
    this.bitmapTextStyle = bitmapTextStyle;
    this.sliderButtonConfig = sliderButtonConfig;
    this.buttonClickSoundKey = buttonClickSoundKey;

    const slider = this.createSlider(
      this.x, 
      this.y, 
      () => {}, 
      this.sliderButtonConfig);
    this.scene.input.setDraggable(slider);
    slider.addListener('drag', (pointer: any, dragX: number) =>
      {
        if (dragX < this.barExtents[0]) {
          slider.setX(this.barExtents[0]);
        } else if (dragX > this.barExtents[1]) {
          slider.setX(this.barExtents[1]);
        } else {
          slider.setX(dragX);
        }
        this.activeChoiceValue = 
        ((slider.x - this.barExtents[0]) /
         (this.barlength)) *
        (this.minMax[1] - this.minMax[0]);
        this.updateValue(this.activeChoiceValue, slider);
      }
    );

    this.barExtents = [this.x, this.x + maxXSpace];
    this.barlength = this.barExtents[1] - this.barExtents[0];
    this.add(new Phaser.GameObjects.Rectangle(
      this.scene, 
      this.x + this.barlength / 2,
      this.y,
      this.barlength,
      6,
      HexColor.white)
    );
    this.add(slider);
    
    this.activate(defaultChoiceValue, slider);
    this.updateValue(defaultChoiceValue, slider);
  }

  // Initialize the slider button based on the configuration of the sliderButtonConfig
  private createSlider(
    xPos: number,
    yPos: number,
    callback: any,
    sliderButtonConfig: SliderButtonConfig
  ) {
    return new Phaser.GameObjects.Ellipse(
      this.scene,
      xPos,
      yPos,
      sliderButtonConfig.circleDim,
      sliderButtonConfig.circleDim,
      HexColor.darkBlue
    ).setInteractive({ useHandCursor: true, draggable: true })
     .setStrokeStyle(this.sliderButtonConfig.outlineThickness)
     .addListener('pointerdown', () =>
        SourceAcademyGame.getInstance().getSoundManager().playSound(this.buttonClickSoundKey))
  }

  // Place the silder button in the correct position based on the current value of the button.
  private activate(
    value: number,
    slider: Phaser.GameObjects.Ellipse
  ) {
    slider.setX((this.barExtents[1] + this.barExtents[0]) / 2);
    this.activeChoiceValue = value;
    slider.setX(this.barExtents[0] + value / (this.minMax[1] - this.minMax[0]) * (this.barlength));
  } 
  
  // Gets the current value of the button
  public getValue(): number {
    return this.activeChoiceValue;
  }

  // Change the active value of the button based on the position of the slider.
  private updateValue(
    value: number, 
    slider: Phaser.GameObjects.Ellipse
  ) {
    if (this.activeChoice) this.activeChoice.destroy();

    this.activeChoice = new Phaser.GameObjects.Container(
      this.scene,
      slider.x,
      slider.y
    );
    const choiceText = createBitmapText(
      this.scene,
      value.toFixed(2).toString(),
      this.choiceTextConfig,
      this.bitmapTextStyle
    );
    this.activeChoice.add(choiceText)
    this.add(this.activeChoice)
  }
}

export default CommonSlider;