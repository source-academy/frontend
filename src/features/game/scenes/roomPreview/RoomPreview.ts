import { Context, runInContext } from 'js-slang';
import { createContext } from 'src/commons/utils/JsSlangHelper';
import CommonBackButton from '../../commons/CommonBackButton';
import GameLayerManager from '../../layer/GameLayerManager';
import { Layer } from '../../layer/GameLayerTypes';
import { roomDefaultCode } from './RoomPreviewConstants';

type RoomPreviewProps = {
  studentCode: string;
};

export default class RoomPreview extends Phaser.Scene {
  private layerManager: GameLayerManager;
  private studentCode: string;

  constructor() {
    super('RoomPreview');
    this.layerManager = new GameLayerManager();
    this.studentCode = roomDefaultCode;
  }

  public init({ studentCode }: RoomPreviewProps) {
    this.studentCode = studentCode;
    this.layerManager.initialiseMainLayer(this);
  }

  public async preload() {
    await this.eval(`\npreload();`);
  }

  public async create() {
    this.eval(`\ncreate();`);
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

  private async eval(append: string) {
    const context: Context = createContext(4, [], {}, 'gpu', {
      scene: this,
      phaser: Phaser
    });
    context.externalContext = 'playground';
    await runInContext(this.studentCode + append, context);
  }
}
