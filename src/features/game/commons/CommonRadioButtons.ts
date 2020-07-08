import { GameButton, BitmapFontStyle } from './CommonTypes';
import { screenSize, Constants } from './CommonConstants';
import { HexColor } from '../utils/StyleUtils';

class CommonRadioButtons extends Phaser.GameObjects.Container {
  private circleDiameter: number;
  private outlineSize: number;
  private checkedDiameter: number;
  private textXOffset: number;
  private textYOffset: number;
  private valueIdx: number;
  private choices: string[];
  private isChosen: boolean[];
  private radioButtons: GameButton[];
  private style: BitmapFontStyle;
  private textAnchorX: number | undefined;
  private textAnchorY: number | undefined;

  constructor(
    scene: Phaser.Scene,
    choices: string[],
    defaultChoiceIdx: number,
    maxWidth: number = screenSize.x,
    style: BitmapFontStyle,
    x?: number,
    y?: number,
    textAnchorX?: number,
    textAnchorY?: number,
    circleDiameter: number = 20,
    outlineSize: number = 5,
    checkedDiameter: number = 15,
    textXOffset: number = 0,
    textYOffset: number = 15
  ) {
    super(scene, x, y);
    this.scene = scene;
    this.valueIdx = 0;
    this.choices = choices;
    this.style = style;
    this.textAnchorX = textAnchorX;
    this.textAnchorY = textAnchorY;
    this.circleDiameter = circleDiameter;
    this.outlineSize = outlineSize;
    this.checkedDiameter = checkedDiameter;
    this.textXOffset = textXOffset;
    this.textYOffset = textYOffset;
    this.radioButtons = [];
    this.isChosen = [];

    this.createRadioButtons(this.choices, maxWidth);
    this.renderRadioButtons();
    this.activate(defaultChoiceIdx);
  }

  private createRadioButtons(choices: string[], maxWidth: number) {
    this.radioButtons = [];
    this.isChosen = [];
    for (let i = 0; i < choices.length; i++) {
      this.isChosen[i] = false;
      this.addRadioButton(choices[i], maxWidth, () => this.activate(i));
    }
  }

  private renderRadioButtons() {
    this.removeAll(true);
    const optionOutlineDiameter = this.circleDiameter + this.outlineSize;

    for (let i = 0; i < this.choices.length; i++) {
      const button = this.radioButtons[i];
      const optionFrame = new Phaser.GameObjects.Ellipse(
        this.scene,
        button.assetXPos,
        button.assetYPos,
        optionOutlineDiameter,
        optionOutlineDiameter,
        HexColor.darkBlue
      );
      const option = new Phaser.GameObjects.Ellipse(
        this.scene,
        button.assetXPos,
        button.assetYPos,
        this.circleDiameter,
        this.circleDiameter,
        HexColor.lightBlue
      );
      if (button.isInteractive) {
        option.setInteractive({ useHandCursor: true });
        option.addListener(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, button.onInteract);
      }
      const xPos = this.textXOffset
        ? button.assetXPos + optionOutlineDiameter + this.textXOffset
        : button.assetXPos;
      const yPos = this.textYOffset
        ? button.assetYPos + optionOutlineDiameter + this.textYOffset
        : button.assetYPos;
      const xAnchor = this.textAnchorX ? this.textAnchorX : 0.25;
      const yAnchor = this.textAnchorY ? this.textAnchorY : 0.5;
      const textOption = new Phaser.GameObjects.BitmapText(
        this.scene,
        xPos,
        yPos,
        this.style.key,
        this.choices[i],
        this.style.size,
        this.style.align
      )
        .setOrigin(xAnchor, yAnchor)
        .setTintFill(this.style.fill);
      const optionChecked = new Phaser.GameObjects.Ellipse(
        this.scene,
        button.assetXPos,
        button.assetYPos,
        this.checkedDiameter,
        this.checkedDiameter,
        HexColor.darkBlue
      );
      this.add([optionFrame, option]);
      if (this.isChosen[i]) {
        this.add([optionChecked, textOption]);
      }
    }
  }

  private addRadioButton(choice: string, maxWidth: number, callback: any) {
    const newNumberOfButtons = this.radioButtons.length + 1;
    const partitionSize = maxWidth / newNumberOfButtons;

    const newXPos = (screenSize.x - maxWidth + partitionSize) / 2;

    // Rearrange existing buttons
    for (let i = 0; i < this.radioButtons.length; i++) {
      this.radioButtons[i] = {
        ...this.radioButtons[i],
        assetXPos: newXPos + i * partitionSize
      };
    }

    // Add the new button
    const newRadioButton: GameButton = {
      text: '',
      style: {},
      assetKey: '',
      assetXPos: newXPos + this.radioButtons.length * partitionSize,
      assetYPos: 0,
      isInteractive: true,
      onInteract: callback,
      interactionId: Constants.nullInteractionId
    };

    // Update
    this.radioButtons.push(newRadioButton);
  }

  private activate(id: number): void {
    this.valueIdx = id;
    for (let i = 0; i < this.choices.length; i++) {
      this.isChosen[i] = i === id;
    }
    this.renderRadioButtons();
  }

  public getValueIdx(): number {
    return this.valueIdx;
  }

  public getChoices(): string[] {
    return this.choices;
  }

  public getChosenChoice(): string {
    if (this.valueIdx < this.choices.length) {
      return this.choices[this.valueIdx];
    }
    return '';
  }
}

export default CommonRadioButtons;
