import { GameButton } from './CommonsTypes';
import { screenSize, Constants } from './CommonConstants';
import { Color, hex } from '../utils/StyleUtils';

class CommonRadioButtons extends Phaser.GameObjects.Container {
  private readonly optionDiameter: number = 20;
  private readonly optionOutlineThickness: number = 5;
  private readonly optionCheckedDiameter: number = 15;
  private readonly textYOffset: number = 15;
  private valueIdx: number;
  private choices: string[];
  private isChosen: boolean[];
  private radioButtons: GameButton[];
  private style: any;
  private textAnchorX: number | undefined;
  private textAnchorY: number | undefined;
  constructor(
    scene: Phaser.Scene,
    choices: string[],
    maxWidth: number = screenSize.x,
    style: any,
    x?: number,
    y?: number,
    textAnchorX?: number,
    textAnchorY?: number
  ) {
    super(scene, x, y);
    this.scene = scene;
    this.valueIdx = 0;
    this.choices = choices;
    this.style = style;
    this.textAnchorX = textAnchorX;
    this.textAnchorY = textAnchorY;
    this.radioButtons = [];
    this.isChosen = [];

    this.createRadioButtons(this.choices, maxWidth);
    this.renderRadioButtons();
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
    const optionOutlineDiameter = this.optionDiameter + this.optionOutlineThickness;

    for (let i = 0; i < this.choices.length; i++) {
      const button = this.radioButtons[i];
      const optionFrame = new Phaser.GameObjects.Ellipse(
        this.scene,
        button.assetXPos,
        button.assetYPos,
        optionOutlineDiameter,
        optionOutlineDiameter,
        hex(Color.darkBlue)
      );
      const option = new Phaser.GameObjects.Ellipse(
        this.scene,
        button.assetXPos,
        button.assetYPos,
        this.optionDiameter,
        this.optionDiameter,
        hex(Color.lightBlue)
      );
      if (button.isInteractive) {
        option.setInteractive({ useHandCursor: true });
        option.addListener(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, button.onInteract);
      }
      const textOption = new Phaser.GameObjects.Text(
        this.scene,
        button.assetXPos,
        button.assetYPos + optionOutlineDiameter + this.textYOffset,
        this.choices[i],
        this.style
      );
      const xAnchor = this.textAnchorX ? this.textAnchorX : 0.25;
      const yAnchor = this.textAnchorY ? this.textAnchorY : 0.5;
      textOption.setOrigin(xAnchor, yAnchor);

      const optionChecked = new Phaser.GameObjects.Ellipse(
        this.scene,
        button.assetXPos,
        button.assetYPos,
        this.optionCheckedDiameter,
        this.optionCheckedDiameter,
        hex(Color.darkBlue)
      );
      this.add([optionFrame, option, textOption]);
      if (this.isChosen[i]) this.add(optionChecked);
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
