import { HexColor } from "../utils/StyleUtils";
import GameTable from "./GameTable";

/**
 * A simple combination lock puzzle.
 * 
 * Users can click the top buttons on the top row to increment
 * the value in the middle, and decrement using the bottom
 * row buttons.
 * 
 * The gray button at the bottom is used to check that the correct
 * combination has been inputted.
 */
class CombinationLockPuzzle extends GameTable {
  // Fields for storing the length of the combination puzzle.
  numOfCols: number;
  combination: number[];
  /**
   * @param scene The scene for the GameObject to attach to.
   * @param combination An array of numbers representing the correct number combination.
   * @param maxXSpace The horizontal space taken up by the GameTable.
   * @param maxYSpace The vertical space taken up by the GameTable.
   * @param x The x position of the GameTable, optional.
   * @param y The y position of the GameTable, optional.
   */
  constructor(
    scene: Phaser.Scene,
    combination: number[],
    maxXSpace: number,
    maxYSpace: number,
    x = 0,
    y = 0
  ) {
    super(scene, 3, combination.length, maxXSpace, maxYSpace, x, y, 0, 9, 0);
    this.combination = combination;
    this.numOfCols = this.combination.length;
    for (let c = 0; c < this.numOfCols; c++) {
      super.recolor(0, c, HexColor.orange);
      super.recolor(2, c, HexColor.orange);
      super.hideText(0, c);
      super.hideText(2, c);
      super.setCallback(0, c, () => super.increment(1, c));
      super.setCallback(1, c, () => {});
      super.setCallback(2, c, () => super.decrement(1, c));
    }

    this.overrideCheck(this.combination);
  }
  
  /**
   * Overrides the default check of the GameTable so that this GameTable can properly test
   * for the correct combination.
   * 
   * @param numArray The array containing the correct numerical combination.
   */
  private overrideCheck(numArray: number[]){
    super.setCheck(() => {
      for (let c = 0; c < this.numOfCols; c++) {
        if (super.getButtonValue(1, c) !== numArray[c]) return false;
      }
      return true;
    })

  }

}

export default CombinationLockPuzzle;