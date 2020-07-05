import CommonBackButton from '../../commons/CommonBackButton';
import GameLayerManager from '../../layer/GameLayerManager';
import { Layer } from '../../layer/GameLayerTypes';
import { addLoadingScreen } from '../../effects/LoadingScreen';
import GameCollectiblesManager from '../../collectibles/GameCollectiblesManager';
import commonAssets from '../../commons/CommonAssets';
import { mandatory } from '../../utils/GameUtils';

class MyRoom extends Phaser.Scene {
  private layerManager?: GameLayerManager;
  private collectiblesManager: GameCollectiblesManager;

  constructor() {
    super('MyRoom');
    this.collectiblesManager = new GameCollectiblesManager();
  }

  public preload() {
    addLoadingScreen(this);
    this.preloadBaseAssets();
    this.layerManager = new GameLayerManager(this);
    this.collectiblesManager.initialise(this, this.layerManager);
  }

  public create() {
    this.collectiblesManager.renderCollectibleMenu();
    this.renderMyRoom();
  }

  private preloadBaseAssets() {
    commonAssets.forEach(asset => {
      this.load.image(asset.key, asset.path);
    });
  }

  private renderMyRoom() {
    const backButton = new CommonBackButton(
      this,
      () => {
        this.getLayerManager().clearAllLayers();
        this.scene.start('MainMenu');
      },
      0,
      0
    );
    this.getLayerManager().addToLayer(Layer.UI, backButton);
  }
  public getLayerManager = () => mandatory(this.layerManager) as GameLayerManager;
}

export default MyRoom;
