import { Context, runInContext } from 'js-slang';
import { createContext } from 'src/commons/utils/JsSlangHelper';
import CommonBackButton from '../../commons/CommonBackButton';
import GameLayerManager from '../../layer/GameLayerManager';
import { Layer } from '../../layer/GameLayerTypes';
import { roomDefaultCode } from './RoomPreviewConstants';
import { loadImage } from 'src/features/storySimulator/utils/LoaderUtils';

type RoomPreviewProps = {
  studentCode: string;
};

export default class RoomPreview extends Phaser.Scene {
  private layerManager: GameLayerManager;
  private studentCode: string;
  private preload_map: Map<string, string>;

  constructor() {
    super('RoomPreview');
    this.preload_map = new Map<string, string>();
    this.layerManager = new GameLayerManager();
    this.studentCode = roomDefaultCode;
  }

  public init({ studentCode }: RoomPreviewProps) {
    this.studentCode = studentCode;
    this.layerManager.initialiseMainLayer(this);
  }

  public async create() {
    await this.eval(`\npreload();`);

    await Promise.all(
      Array.from(this.preload_map).map(async ([key, path]) => {
        await loadImage(this, key, path);
      })
    );

    await this.eval(`\ncreate();`);
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
      phaser: Phaser,
      preload_map: this.preload_map
    });
    context.externalContext = 'playground';
    await runInContext(this.studentCode + append, context);
  }
}
