import { HexColor } from '../utils/StyleUtils';
import GameTable from './GameTable';

/**
 * A simple light switch puzzle.
 *
 * When a button is clicked, it and its surrounding buttons will have their colors flipped.
 */
class LightSwitchPuzzle extends GameTable {
  private rows: number;
  private columns: number;

  /**
   * @param scene The scene for the GameObject to attach to.
   * @param rowSize How many buttons there will be in one row of the table.
   * @param columnSize How many buttons there will be in one column of the table.
   * @param maxXSpace The horizontal space taken up by the GameTable.
   * @param maxYSpace The vertical space taken up by the GameTable.
   * @param x The x position of the GameTable, optional.
   * @param y The y position of the GameTable, optional.
   */
  constructor(
    scene: Phaser.Scene,
    rowSize: number,
    columnSize: number,
    maxXSpace: number,
    maxYSpace: number,
    x = 0,
    y = 0
  ) {
    super(scene, rowSize, columnSize, maxXSpace, maxYSpace, x, y, 0, 1, 0);
    this.rows = rowSize;
    this.columns = columnSize;

    for (let r = 0; r < rowSize; r++) {
      for (let c = 0; c < columnSize; c++) {
        super.setCallback(r, c, () => {
          this.flipButton(r, c);
          this.flipButton(r + 1, c);
          this.flipButton(r - 1, c);
          this.flipButton(r, c + 1);
          this.flipButton(r, c - 1);
        });
      }
    }
    super.hideAllText();
  }

  // Flips the button's value and its color like a light switch.
  private flipButton(row: number, column: number) {
    if (row < 0 || row >= this.rows || column < 0 || column >= this.columns) {
      return;
    }
    super.increment(row, column);
    if (super.getButtonValue(row, column) === 1) {
      super.recolor(row, column, HexColor.offWhite);
    } else {
      super.recolor(row, column, HexColor.darkBlue);
    }
  }
}

export default LightSwitchPuzzle;
