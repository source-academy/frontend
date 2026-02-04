import SoundAssets from '../assets/SoundAssets';
import SourceAcademyGame from '../SourceAcademyGame';
import { calcTableFormatPos, HexColor } from '../utils/StyleUtils';
import { createBitmapText } from '../utils/TextUtils';
import { Constants, screenSize } from './CommonConstants';
import { AssetKey, BitmapFontStyle, TextConfig } from './CommonTypes';

type RadioButtonChoiceConfig = {
  circleDim: number;
  checkedDim: number;
  outlineThickness: number;
};

type RadioButtonConfig = {
  choices: string[];
  defaultChoiceIdx?: number;
  maxXSpace?: number;
  radioChoiceConfig?: RadioButtonChoiceConfig;
  choiceTextConfig?: TextConfig;
  bitmapTextStyle?: BitmapFontStyle;
};

/**
 * A container that is contains radio buttons.
 * Radio buttons only allows user to choose only one of the
 * predefined set of mutually exclusive options.
 *
 * The radio buttons will be arranged horizontally,
 * with even spacing.
 *
 * The radio button's choice will only be displayed when
 * the given radio button is selected so as to not clutter the display.
 */
class CommonRadioButton extends Phaser.GameObjects.Container {
  private buttonClickSoundKey: AssetKey;

  private activeChoice: Phaser.GameObjects.Container | undefined;
  private activeChoiceIdx: number;
  private choices: string[];
  private buttonPositions: Array<[number, number]>;

  private radioChoiceConfig: RadioButtonChoiceConfig;
  private choiceTextConfig: TextConfig;
  private bitmapTextStyle: BitmapFontStyle;

  /**
   * @param scene scene for the container to attach to
   * @param choices displayed choices, in string, for the radio buttons.
   * @param defaultChoiceIdx index of default choice, optional
   * @param maxXSpace maximum horizontal space to be used by the radio buttons, optional
   * @param circleDim diameter of the radio button, optional
   * @param checkedDim diameter of the 'checked' radio button; commonly smaller than circleDim, optional
   * @param outlineThickness if not 0, apply stroke effect on the radio button, optional
   * @param choiceTextConfig text config to be applied to the displayed choice.
   *                         The X, Y are relative to each individual radio button.
   *                         Using this, we can specify where the choice should appear
   *                         e.g. on top of the radio button, on the side of radio button, optional
   * @param bitmapTextStyle style to be applied to the choices, optional
   * @param x x coordinate of the container, optional
   * @param y y coordinate of the container, optional
   * @param soundManager if defined, the radio button will play sounds when clicked, optional
   * @param buttonClickSoundKey require soundManager to be defined; Sound key to be played when
   *                            button is clicked, optioanl
   */
  constructor(
    scene: Phaser.Scene,
    {
      choices,
      defaultChoiceIdx = 0,
      maxXSpace = screenSize.x,
      radioChoiceConfig = {
        circleDim: 20,
        checkedDim: 10,
        outlineThickness: 5
      },
      choiceTextConfig = { x: 0, y: 0, oriX: 0.5, oriY: 0.5 },
      bitmapTextStyle = Constants.defaultFontStyle
    }: RadioButtonConfig,
    x?: number,
    y?: number,
    buttonClickSoundKey: AssetKey = SoundAssets.radioButtonClick.key
  ) {
    super(scene, x, y);
    this.activeChoiceIdx = defaultChoiceIdx;
    this.choices = choices;
    this.choiceTextConfig = choiceTextConfig;
    this.bitmapTextStyle = bitmapTextStyle;
    this.radioChoiceConfig = radioChoiceConfig;
    this.buttonClickSoundKey = buttonClickSoundKey;

    const buttons = this.getRadioButtons(choices);
    this.buttonPositions = calcTableFormatPos({
      numOfItems: buttons.length,
      maxXSpace: maxXSpace
    });

    this.renderRadioButtons(buttons, this.buttonPositions, this.radioChoiceConfig);
    this.activate(defaultChoiceIdx);
  }

  private getRadioButtons(choices: string[]) {
    return choices.map((choice, index) => {
      return {
        text: choice,
        callback: () => this.activate(index)
      };
    });
  }

  private renderRadioButtons(
    buttons: { text: string; callback: any }[],
    buttonPos: Array<[number, number]>,
    radioChoiceConfig: RadioButtonChoiceConfig
  ) {
    this.add(
      buttons.map((button, index) =>
        this.createRadioButton(
          buttonPos[index][0],
          buttonPos[index][1],
          button.callback,
          radioChoiceConfig
        )
      )
    );
  }

  private createRadioButton(
    xPos: number,
    yPos: number,
    callback: any,
    radioChoiceConfig: RadioButtonChoiceConfig
  ) {
    return new Phaser.GameObjects.Ellipse(
      this.scene,
      xPos,
      yPos,
      radioChoiceConfig.circleDim,
      radioChoiceConfig.circleDim,
      HexColor.lightBlue
    )
      .setStrokeStyle(radioChoiceConfig.outlineThickness, HexColor.darkBlue)
      .setInteractive({ useHandCursor: true })
      .addListener(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
        SourceAcademyGame.getInstance().getSoundManager().playSound(this.buttonClickSoundKey);
        callback();
      });
  }

  private activate(id: number): void {
    this.activeChoiceIdx = id;

    // Render checked option
    if (this.activeChoice) this.activeChoice.destroy();

    this.activeChoice = new Phaser.GameObjects.Container(
      this.scene,
      this.buttonPositions[id][0],
      this.buttonPositions[id][1]
    );
    const choiceText = createBitmapText(
      this.scene,
      this.choices[id],
      this.choiceTextConfig,
      this.bitmapTextStyle
    );
    const optionChecked = new Phaser.GameObjects.Ellipse(
      this.scene,
      0,
      0,
      this.radioChoiceConfig.checkedDim,
      this.radioChoiceConfig.checkedDim,
      HexColor.darkBlue
    );
    this.activeChoice.add([choiceText, optionChecked]);

    this.add(this.activeChoice);
  }

  public getValueIdx(): number {
    return this.activeChoiceIdx;
  }

  public getChoices(): string[] {
    return this.choices;
  }

  public getChosenChoice(): string {
    if (this.activeChoiceIdx < this.choices.length) {
      return this.choices[this.activeChoiceIdx];
    }
    return Constants.nullInteractionId;
  }
}

export default CommonRadioButton;
