import { HexColor } from '../utils/StyleUtils';

type PipeConnect = {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  immutable: boolean;
};

/**
 * A container that contains a pipe button for the minigame.
 */
class PipeButton extends Phaser.GameObjects.Container {
  // Fields containing information about the dimensions of the button.
  private pipeConfig: PipeConnect;
  private rectWidth: number;
  private rectHeight: number;

  // Fields containing information about the pipe itself.
  private button: Phaser.GameObjects.Rectangle;
  private renderedPipes: Phaser.GameObjects.Container | undefined;

  constructor(
    scene: Phaser.Scene,
    pipeConfig: PipeConnect,
    x?: number,
    y?: number,
    width = 50,
    height = 50
  ) {
    super(scene, x, y);
    this.pipeConfig = pipeConfig;
    this.rectWidth = width;
    this.rectHeight = height;

    this.button = new Phaser.GameObjects.Rectangle(
      this.scene,
      this.x,
      this.y,
      this.rectWidth,
      this.rectHeight,
      HexColor.darkBlue
    )
      .setStrokeStyle(2, HexColor.white)
      .setInteractive({ useHandCursor: true })
      .addListener(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
        this.shift();
      });

    this.add(this.button);
    this.renderPipes(this.pipeConfig);
  }

  // Render the pipes according to which sides they should connect to.
  private renderPipes(pipes: PipeConnect): void {
    if (this.renderedPipes) this.renderedPipes.destroy();
    const pipeColor = pipes.immutable ? HexColor.orange : HexColor.white;
    this.renderedPipes = new Phaser.GameObjects.Container(this.scene, this.x, this.y);
    this.renderedPipes.add(
      new Phaser.GameObjects.Rectangle(
        this.scene,
        0,
        0,
        this.rectWidth / 4,
        this.rectHeight / 4,
        pipeColor
      )
    );
    if (pipes.left) {
      this.renderedPipes.add(
        new Phaser.GameObjects.Rectangle(
          this.scene,
          -this.rectWidth / 4,
          0,
          this.rectWidth / 2,
          this.rectHeight / 4,
          pipeColor
        )
      );
    }
    if (pipes.right) {
      this.renderedPipes.add(
        new Phaser.GameObjects.Rectangle(
          this.scene,
          this.rectWidth / 4,
          0,
          this.rectWidth / 2,
          this.rectHeight / 4,
          pipeColor
        )
      );
    }
    if (pipes.up) {
      this.renderedPipes.add(
        new Phaser.GameObjects.Rectangle(
          this.scene,
          0,
          -this.rectHeight / 4,
          this.rectWidth / 4,
          this.rectHeight / 2,
          pipeColor
        )
      );
    }
    if (pipes.down) {
      this.renderedPipes.add(
        new Phaser.GameObjects.Rectangle(
          this.scene,
          0,
          this.rectHeight / 4,
          this.rectWidth / 4,
          this.rectHeight / 2,
          pipeColor
        )
      );
    }

    this.add(this.renderedPipes);
  }

  // Rotates the pipe 90 degrees clockwise.
  private shift(): void {
    if (this.pipeConfig.immutable) {
      return;
    } else {
      const newPipe = {
        up: this.pipeConfig.left,
        down: this.pipeConfig.right,
        left: this.pipeConfig.down,
        right: this.pipeConfig.up,
        immutable: this.pipeConfig.immutable
      };
      this.pipeConfig = newPipe;
      this.renderPipes(this.pipeConfig);
    }
  }

  /**
   * Checks whether this pipe can connect to a given pipe from the left
   *
   * @param pipe Another pipe for this pipe to connect to.
   */
  public connectLeft(pipe: PipeButton): boolean {
    return this.pipeConfig.right && pipe.pipeConfig.left;
  }

  /**
   * Checks whether this pipe can connect to a given pipe from the right
   *
   * @param pipe Another pipe for this pipe to connect to.
   */
  public connectRight(pipe: PipeButton): boolean {
    return this.pipeConfig.left && pipe.pipeConfig.right;
  }

  /**
   * Checks whether this pipe can connect to a given pipe from above
   *
   * @param pipe Another pipe for this pipe to connect to.
   */
  public connectAbove(pipe: PipeButton): boolean {
    return this.pipeConfig.down && pipe.pipeConfig.up;
  }

  /**
   * Checks whether this pipe can connect to a given pipe from below
   *
   * @param pipe Another pipe for this pipe to connect to.
   */
  public connectBelow(pipe: PipeButton): boolean {
    return this.pipeConfig.up && pipe.pipeConfig.down;
  }

  // Change the color of the pipe.
  public recolor(newColor: number): void {
    this.button.setFillStyle(newColor);
  }

  // Prevent the pipe from being rotated.
  public removeInput(): void {
    this.button.removeAllListeners();
  }

  // Gets information about the pipe, like where it connects to, and
  // whether it can be rotated.
  public getConfig(): PipeConnect {
    return this.pipeConfig;
  }
}

export default PipeButton;
