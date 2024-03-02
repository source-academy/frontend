import { HexColor } from '../utils/StyleUtils';
import PipeButton from './PipeButton';

type PipeConnect = {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  immutable: boolean;
};

enum Direction {
  left,
  above,
  below,
  right
}

/**
 * A simple pipe puzzle minigame.
 *
 * Given an input and output pipe, test whether the pipes
 * connect from the input pipe to the output pipe.
 */
class PipePuzzle extends Phaser.GameObjects.Container {
  // Fields storing information about the table of PipeButtons.
  private rowSize: number;
  private columnSize: number;
  private table: Array<Array<PipeButton>>;
  private checkButton: Phaser.GameObjects.Rectangle;
  private container: Phaser.GameObjects.Container;
  private buttonHeight: number;
  private buttonWidth: number;

  // Fields storing information for performing a search of the table.
  private visited: boolean[][];
  private solved: boolean;

  // Fields storing information about the input and output pipes.
  private startRow: number;
  private startCol: number;
  private startDirection: Direction;
  private endRow: number;
  private endCol: number;
  private endDirection: Direction;

  /**
   * @param scene The scene for the GameObject to attach to.
   * @param pipesArray An array of PipeConnect to initialize the PipeButtons
   *  @param maxXSpace The horizontal space taken up by the GameTable.
   * @param maxYSpace The vertical space taken up by the GameTable.
   * @param x The x position of the GameTable, optional.
   * @param y The y position of the GameTable, optional.
   * @param startRow The row for the input pipe to attach to.
   * @param startCol The column for the input pipe to attach to.
   * @param startDirection The direction for the input pipe to attach from.
   * @param endRow The row for the output pipe to attach to.
   * @param endCol The column for the output pipe to attach to.
   * @param endDirection The direction for the output pipe to attach from.
   */
  constructor(
    scene: Phaser.Scene,
    pipesArray: Array<Array<PipeConnect>>,
    maxXSpace: number,
    maxYSpace: number,
    x = 0,
    y = 0,
    startRow: number,
    startCol: number,
    startDirection: Direction,
    endRow: number,
    endCol: number,
    endDirection: Direction
  ) {
    super(scene, x, y);
    this.rowSize = pipesArray.length;
    this.columnSize = pipesArray[0].length;

    this.container = new Phaser.GameObjects.Container(this.scene, x, y);
    this.table = new Array(this.rowSize);

    this.startRow = startRow;
    this.startCol = startCol;
    this.startDirection = startDirection;
    this.endRow = endRow;
    this.endCol = endCol;
    this.endDirection = endDirection;

    this.visited = new Array(this.rowSize);
    for (let r = 0; r < this.rowSize; r++) {
      this.visited[r] = new Array(this.columnSize);
    }
    this.solved = false;

    this.buttonWidth = maxYSpace / this.rowSize;
    this.buttonHeight = maxXSpace / this.columnSize;

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
        this.table[r][c] = new PipeButton(
          this.scene,
          pipesArray[r][c],
          (c * this.buttonHeight) / 2 - maxXSpace / 4 + this.buttonHeight / 4,
          (r * this.buttonWidth) / 2 - maxYSpace / 4 + this.buttonWidth / 4,
          this.buttonHeight,
          this.buttonWidth
        );
      }

      this.container.add(this.table[r]);
    }

    this.resetVisits();
    this.extantPipe(startRow, startCol, startDirection, HexColor.yellow);
    this.extantPipe(endRow, endCol, endDirection, HexColor.orange);

    this.add(this.container);
  }

  // Tests whether a connected path from the input pipe to the output path exists.
  private check(): boolean {
    this.resetVisits();
    if (this.connectPipe(this.startDirection, this.table[this.startRow][this.startCol])) {
      this.checkEntry(this.startRow, this.startCol);
    }

    if (
      this.visited[this.endRow][this.endCol] &&
      this.connectPipe(this.endDirection, this.table[this.endRow][this.endCol]) &&
      !this.solved
    ) {
      this.solved = true;
      this.disableAllInput();
      return false;
    }

    return this.solved;
  }

  // Reset the 'visited' status of all pipes.
  private resetVisits(): void {
    for (let r = 0; r < this.rowSize; r++) {
      for (let c = 0; c < this.columnSize; c++) {
        this.visited[r][c] = false;
        this.table[r][c].recolor(HexColor.darkBlue);
      }
    }
  }

  // DFS search through the table of pipes to test whether they connect.
  private checkEntry(row: number, col: number): void {
    if (row < 0 || row >= this.rowSize || col < 0 || col >= this.columnSize) return;
    if (this.visited[row][col]) return;

    this.visited[row][col] = true;
    this.table[row][col].recolor(HexColor.offWhite);

    if (this.connectLeft(row, col, row, col + 1)) this.checkEntry(row, col + 1);
    if (this.connectRight(row, col, row, col - 1)) this.checkEntry(row, col - 1);
    if (this.connectAbove(row, col, row + 1, col)) this.checkEntry(row + 1, col);
    if (this.connectBelow(row, col, row - 1, col)) this.checkEntry(row - 1, col);
  }

  private connectLeft(rIn: number, cIn: number, rOut: number, cOut: number): boolean {
    if (rOut < 0 || rOut >= this.rowSize || cOut < 0 || cOut >= this.columnSize) return false;
    return this.table[rIn][cIn].connectLeft(this.table[rOut][cOut]);
  }

  private connectRight(rIn: number, cIn: number, rOut: number, cOut: number): boolean {
    if (rOut < 0 || rOut >= this.rowSize || cOut < 0 || cOut >= this.columnSize) return false;
    return this.table[rIn][cIn].connectRight(this.table[rOut][cOut]);
  }

  private connectAbove(rIn: number, cIn: number, rOut: number, cOut: number): boolean {
    if (rOut < 0 || rOut >= this.rowSize || cOut < 0 || cOut >= this.columnSize) return false;
    return this.table[rIn][cIn].connectAbove(this.table[rOut][cOut]);
  }

  private connectBelow(rIn: number, cIn: number, rOut: number, cOut: number): boolean {
    if (rOut < 0 || rOut >= this.rowSize || cOut < 0 || cOut >= this.columnSize) return false;
    return this.table[rIn][cIn].connectBelow(this.table[rOut][cOut]);
  }

  private disableAllInput(): void {
    for (let r = 0; r < this.rowSize; r++) {
      for (let c = 0; c < this.columnSize; c++) {
        this.table[r][c].removeInput();
      }
    }
  }

  // Used for testing whether a specified pipe connects to the input/output pipe.
  private connectPipe(dir: Direction, input: PipeButton): boolean {
    switch (dir) {
      case Direction.left: {
        return new PipeButton(this.scene, {
          up: true,
          down: true,
          left: true,
          right: true,
          immutable: true
        }).connectLeft(input);
      }
      case Direction.right: {
        return new PipeButton(this.scene, {
          up: true,
          down: true,
          left: true,
          right: true,
          immutable: true
        }).connectRight(input);
      }
      case Direction.above: {
        return new PipeButton(this.scene, {
          up: true,
          down: true,
          left: true,
          right: true,
          immutable: true
        }).connectAbove(input);
      }
      case Direction.below: {
        return new PipeButton(this.scene, {
          up: true,
          down: true,
          left: true,
          right: true,
          immutable: true
        }).connectBelow(input);
      }
      default: {
        return false;
      }
    }
  }

  // Render input/output pipes
  private extantPipe(row: number, col: number, dir: Direction, color: number) {
    const x =
      dir === Direction.left
        ? 2 * this.table[row][col].x - this.buttonWidth / 2
        : dir === Direction.right
        ? 2 * this.table[row][col].x + this.buttonWidth / 2
        : 2 * this.table[row][col].x;

    const y =
      dir === Direction.above
        ? 2 * this.table[row][col].y - this.buttonHeight / 2
        : dir === Direction.below
        ? 2 * this.table[row][col].y + this.buttonHeight / 2
        : 2 * this.table[row][col].y;

    const rect = new Phaser.GameObjects.Rectangle(
      this.scene,
      x,
      y,
      this.buttonWidth / 4,
      this.buttonHeight / 4,
      color
    ).setStrokeStyle(2, HexColor.white);
    rect.depth = Infinity;
    this.container.add(rect);
  }
}

export default PipePuzzle;
