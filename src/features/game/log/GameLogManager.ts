import { screenCenter } from '../commons/CommonConstants';
import { IBaseScene } from '../commons/CommonTypes';
import GameGlobalAPI from '../scenes/gameManager/GameGlobalAPI';
import { createBitmapText } from '../utils/TextUtils';
import LogConstants, { logTextStyle } from './GameLogConstants';

/**
 * Manager in charge of rendering and destroying the dialogue log in a scene
 */
class GameLogManager {
  private scene: IBaseScene;
  private uiContainer: Phaser.GameObjects.Container | undefined;

  /**
   * Initialises the dialogue log UI
   *
   * @param scene - the scene to add dialogue log
   */
  public constructor(scene: IBaseScene) {
    this.scene = scene;
  }

  /**
   * Create the container that encapsulate the 'Dialogue Log' UI,
   * i.e. the scrollable text
   */
  private createUIContainer() {
    const logContainer = new Phaser.GameObjects.Container(this.scene, 0, 0);

    const textLog = GameGlobalAPI.getInstance().getDialogueStorage();
    logContainer.add(
      textLog.map((text, index) =>
        createBitmapText(
          this.scene,
          text.speaker + ': ' + text.line,
          { ...LogConstants.logTextConfig, y: screenCenter.y * (0.3 + index * 0.1) },
          logTextStyle
        )
      )
    );

    this.scene.input.on(
      'wheel',
      (pointer: Phaser.Input.Pointer, gameObjects: any, deltaX: any, deltaY: any, deltaZ: any) => {
        logContainer.y -= deltaY * LogConstants.scrollSpeed;
      }
    );

    return logContainer;
  }

  /**
   * Returns the dialogue log UI container.
   */
  public getUIContainer() {
    this.uiContainer = this.createUIContainer();
    return this.uiContainer;
  }

  /**
   * Destroys the dialogue log UI container.
   */
  public destroyUIContainer() {
    if (this.uiContainer) {
      this.uiContainer.destroy();
    }
  }
}

export default GameLogManager;
