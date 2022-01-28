import ImageAssets from '../assets/ImageAssets';
import { screenCenter, screenSize } from '../commons/CommonConstants';
import { IBaseScene, IGameUI } from '../commons/CommonTypes';
import { Layer } from '../layer/GameLayerTypes';
import { GamePhaseType } from '../phase/GamePhaseTypes';

/**
 * Manager in charge of rendering and destroying the escape manager in a scene
 */
class GameLogManager implements IGameUI {
  private scene: IBaseScene;

  /**
   * Initialises the escape manager UI
   *
   * @param scene - the scene to add escape manager
   */
  public constructor(scene: IBaseScene) {
    this.scene = scene;
    this.scene.getPhaseManager().addPhaseToMap(GamePhaseType.Log, this);
  }

  /**
   * Create the container that encapsulate the 'Escape Menu' UI,
   * i.e. the background, the buttons, and the options.
   */
  private createUIContainer() {
    const logContainer = new Phaser.GameObjects.Container(this.scene, 0, 0);

    const logBg = new Phaser.GameObjects.Image(
      this.scene,
      screenCenter.x,
      screenCenter.y,
      ImageAssets.logBackground.key
    )
      .setDisplaySize(screenSize.x, screenSize.y)
      .setInteractive({ pixelPerfect: true });
    logContainer.add(logBg);

    return logContainer;
  }

  /**
   * Activate the 'Log' UI.
   *
   * Usually only called by the phase manager when 'Log' phase is
   * pushed.
   */
  public activateUI() {
    const escapeMenuContainer = this.createUIContainer();
    this.scene.getLayerManager().addToLayer(Layer.Escape, escapeMenuContainer);
  }

  /**
   * Deactivate the 'Log' UI.
   *
   * Usually only called by the phase manager when 'Log' phase is
   * transitioned out.
   */
  public deactivateUI() {
    this.scene.getLayerManager().clearSeveralLayers([Layer.Escape]);
  }
}

export default GameLogManager;
