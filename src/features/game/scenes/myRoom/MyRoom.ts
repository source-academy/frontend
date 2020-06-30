import CommonBackButton from '../../commons/CommonBackButton';
import GameLayerManager from '../../layer/GameLayerManager';
import { Layer } from '../../layer/GameLayerTypes';

class MyRoom extends Phaser.Scene {
  private layerManager: GameLayerManager;

  constructor() {
    super('MyRoom');
    this.layerManager = new GameLayerManager();
  }

  public preload() {}

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

export default MyRoom;
