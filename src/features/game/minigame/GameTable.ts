import { HexColor } from '../utils/StyleUtils';
import GameTableButton from './GameTableButton';

/**
 * A container that contains a table of GameTableButtons.
 *
 * Not really meant to be constructed on its own (though you can if you want),
 * rather it is meant to be inherited by more complex puzzle objects.
 */
class GameTable extends Phaser.GameObjects.Container {
  // Fields containing information about the table of buttons.
  private rowSize: number;
  private columnSize: number;
  private table: Array<Array<GameTableButton>>;
  private container: Phaser.GameObjects.Container;

  // Field containing information about the button that checks for a defined "correct" answer.
  private checkButton: Phaser.GameObjects.Rectangle;

  /**
   * @param scene The scene for the GameObject to attach to.
   * @param rowSize How many buttons there will be in one row of the table.
   * @param columnSize How many buttons there will be in one column of the table.
   * @param maxXSpace The horizontal space taken up by the GameTable.
   * @param maxYSpace The vertical space taken up by the GameTable.
   * @param x The x position of the GameTable, optional.
   * @param y The y position of the GameTable, optional.
   * @param min The minimum value each button can take, optional.
   * @param max The maximum value each button can take, optional.
   * @param defaultValue The value each button will take when the table is initialized.
   */
  constructor(
    scene: Phaser.Scene,
    rowSize: number,
    columnSize: number,
    maxXSpace: number,
    maxYSpace: number,
    x = 0,
    y = 0,
    min = 0,
    max = 1,
    defaultValue = 0
  ) {
    super(scene, x, y);
    this.rowSize = rowSize;
    this.columnSize = columnSize;

    this.container = new Phaser.GameObjects.Container(this.scene, x, y);

    this.table = new Array(this.rowSize);

    const buttonWidth = maxYSpace / this.rowSize;

    const buttonHeight = maxXSpace / this.columnSize;

    this.container.add(
      new Phaser.GameObjects.Rectangle(
        this.scene,
        0,
        40,
        maxXSpace + 40,
        maxYSpace + 120,
        HexColor.darkBlue,
        0.7
      ).setStrokeStyle(5, HexColor.white)
    );

    this.checkButton = new Phaser.GameObjects.Rectangle(
      this.scene,
      0,
      maxYSpace / 2 + 50,
      maxXSpace,
      60,
      HexColor.offWhite,
      1
    )
      .setStrokeStyle(5, HexColor.white)
      .setInteractive({ useHandCursor: true })
      .addListener(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
        if (this.check()) this.container.destroy();
      });

    this.container.add(this.checkButton);

    for (let r = 0; r < this.rowSize; r++) {
      this.table[r] = new Array(this.columnSize);
      for (let c = 0; c < this.columnSize; c++) {
        this.table[r][c] = new GameTableButton(
          this.scene,
          min,
          defaultValue,
          max,
          { x: 0, y: 0, oriX: 0.5, oriY: 0.5 },
          (c * buttonHeight) / 2 - maxXSpace / 4 + buttonHeight / 4,
          (r * buttonWidth) / 2 - maxYSpace / 4 + buttonWidth / 4,
          buttonHeight,
          buttonWidth
        );
      }
      this.container.add(this.table[r]);
    }

    this.add(this.container);
  }

  // Calls a specified button's increment function.
  public increment(r: number, c: number) {
    if (r < 0 || r >= this.rowSize || c < 0 || c >= this.columnSize) {
      return;
    }
    this.table[r][c].increment();
  }

  // Calls a specified button's decrement function.
  public decrement(r: number, c: number) {
    if (r < 0 || r >= this.rowSize || c < 0 || c >= this.columnSize) {
      return;
    }
    this.table[r][c].decrement();
  }

  // Recolors a specified button.
  public recolor(r: number, c: number, newColor: number) {
    if (r < 0 || r >= this.rowSize || c < 0 || c >= this.columnSize) {
      return;
    }
    this.table[r][c].recolor(newColor);
  }

  // The check method defines some correct combination for the GameTable
  protected check(): boolean {
    for (let r = 0; r < this.rowSize; r++) {
      for (let c = 0; c < this.columnSize; c++) {
        if (this.table[r][c].getActiveValue() === 0) return false;
      }
    }
    return true;
  }

  // Returns the color of the specified button.
  public getButtonColor(r: number, c: number): number {
    return this.table[r][c].getColor();
  }

  // Modifies the functionality of the specified button.
  public setCallback(r: number, c: number, callback: any) {
    if (r < 0 || r >= this.rowSize || c < 0 || c >= this.columnSize) {
      return;
    }
    this.table[r][c].setCallback(callback);
  }

  // Hides the text of the specified button.
  public hideText(r: number, c: number) {
    if (r < 0 || r >= this.rowSize || c < 0 || c >= this.columnSize) {
      return;
    }
    this.table[r][c].hideText();
  }

  // Hides the text of all buttons.
  public hideAllText() {
    for (let r = 0; r < this.rowSize; r++) {
      for (let c = 0; c < this.columnSize; c++) {
        this.hideText(r, c);
      }
    }
  }

  // Gets the value of the specified button
  public getButtonValue(r: number, c: number): number {
    return this.table[r][c].getActiveValue();
  }

  // Overrides the default check method of the check button.
  public setCheck(callback: any) {
    this.checkButton.removeAllListeners();
    this.checkButton.addListener(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
      if (callback()) this.container.destroy();
    });
  }
}

export default GameTable;
