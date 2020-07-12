import { TextConfig, BitmapFontStyle } from './CommonTypes';
import { screenSize, Constants } from './CommonConstants';
import { calcTableFormatPos, HexColor } from '../utils/StyleUtils';
import { createBitmapText } from '../utils/TextUtils';

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

class CommonRadioButton extends Phaser.GameObjects.Container {
  private activeChoice: Phaser.GameObjects.Container | undefined;
  private activeChoiceIdx: number;
  private choices: string[];
  private buttonPositions: Array<[number, number]>;

  private radioChoiceConfig: RadioButtonChoiceConfig;
  private choiceTextConfig: TextConfig;
  private bitmapTextStyle: BitmapFontStyle;

  constructor(
    scene: Phaser.Scene,
    {
      choices,
      defaultChoiceIdx = 0,
      maxXSpace = screenSize.x,
      radioChoiceConfig = {
        circleDim: 20,
        checkedDim: 15,
        outlineThickness: 5
      },
      choiceTextConfig = { x: 0, y: 0, oriX: 0.5, oriY: 0.5 },
      bitmapTextStyle = Constants.defaultFontStyle
    }: RadioButtonConfig,
    x?: number,
    y?: number
  ) {
    super(scene, x, y);
    this.activeChoiceIdx = defaultChoiceIdx;
    this.choices = choices;
    this.choiceTextConfig = choiceTextConfig;
    this.bitmapTextStyle = bitmapTextStyle;
    this.radioChoiceConfig = radioChoiceConfig;

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
      .addListener(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, callback);
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
      this.choiceTextConfig.x,
      this.choiceTextConfig.y,
      this.bitmapTextStyle
    ).setOrigin(this.choiceTextConfig.oriX, this.choiceTextConfig.oriY);
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
