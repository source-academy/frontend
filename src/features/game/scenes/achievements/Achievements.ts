import CommonBackButton from '../../commons/CommonBackButton';
import { addLoadingScreen } from '../../effects/LoadingScreen';
import GameLayerManager from '../../layer/GameLayerManager';
import { Layer } from '../../layer/GameLayerTypes';

class Achievements extends Phaser.Scene {
  private layerManager: GameLayerManager;

  constructor() {
    super('Achievements');
    this.layerManager = new GameLayerManager();
  }

  public preload() {
    addLoadingScreen(this);
    this.layerManager.initialise(this);
  }

  public create() {
    this.renderMyRoom();
  }

  private renderMyRoom() {
    const backButton = new CommonBackButton(
      this,
      () => {
        this.layerManager.clearAllLayers();
        this.scene.start('MainMenu');
      },
      0,
      0
    );
    this.layerManager.addToLayer(Layer.UI, backButton);
  }
}

export default Achievements;
