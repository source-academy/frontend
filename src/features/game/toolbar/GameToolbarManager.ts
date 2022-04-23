import { IBaseScene } from '../commons/CommonTypes';
import { Layer } from '../layer/GameLayerTypes';
import { createButton } from '../utils/ButtonUtils';
import ToolbarConstants, { ToolbarButtonConfig } from './GameToolbarConstants';

/**
 * Manager for the toolbar buttons in the top right corner of the screen
 *
 * It calls the phase mangager when the toolbar buttons are clicked
 * to bring up the approriate menu
 */
class GameToolbarManager {
  private uiContainer: Phaser.GameObjects.Container | undefined;
  private scene: IBaseScene;

  /**
   * Initialises the toolbar manager UI
   *
   * @param scene - the scene to add toolbar manager
   */
  public constructor(scene: IBaseScene) {
    this.scene = scene;
  }

  /**
   * Create the container that encapsulates the toolbar UI
   */
  private createUIContainer() {
    const toolbarContainer = new Phaser.GameObjects.Container(this.scene, 0, 0);

    toolbarContainer.add(
      ToolbarConstants.buttonConfigs.map((buttonConfig, index) =>
        this.createToolbarButton(
          ToolbarConstants.firstButton.x - ToolbarConstants.xOffset * index,
          ToolbarConstants.firstButton.y,
          buttonConfig
        )
      )
    );
    return toolbarContainer;
  }

  /**
   * Format the button information to a UI container, complete with
   * styling and functionality.
   *
   * @param xPos x position of the button
   * @param yPos y position of the button
   * @param buttonConfig config details of the button
   */
  private createToolbarButton(xPos: number, yPos: number, buttonConfig: ToolbarButtonConfig) {
    return createButton(this.scene, {
      assetKey: buttonConfig.assetKey,
      onUp: buttonConfig.onUp(this.scene)
    }).setPosition(xPos, yPos);
  }

  /**
   * Render the toolbar UI.
   *
   * Called by the GameManager in every location
   */
  public async renderToolbarContainer(): Promise<void> {
    this.uiContainer = this.createUIContainer();
    this.scene.getLayerManager().addToLayer(Layer.UI, this.uiContainer);
  }
}

export default GameToolbarManager;
