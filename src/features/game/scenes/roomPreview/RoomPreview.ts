import { Context, runInContext } from 'js-slang';
import { createContext } from 'src/commons/utils/JsSlangHelper';
import CommonBackButton from '../../commons/CommonBackButton';
import GameLayerManager from '../../layer/GameLayerManager';
import { roomDefaultCode } from './RoomPreviewConstants';
import { loadImage, loadSound } from 'src/features/storySimulator/utils/LoaderUtils';
import { Constants } from '../../commons/CommonConstants';

type RoomPreviewProps = {
  studentCode: string;
};

export default class RoomPreview extends Phaser.Scene {
  private layerManager: GameLayerManager;
  private studentCode: string;
  private preloadImageMap: Map<string, string>;
  private preloadSoundMap: Map<string, string>;

  constructor() {
    super('RoomPreview');
    this.preloadImageMap = new Map<string, string>();
    this.preloadSoundMap = new Map<string, string>();
    this.layerManager = new GameLayerManager();
    this.studentCode = roomDefaultCode;
  }

  public init({ studentCode }: RoomPreviewProps) {
    this.studentCode = studentCode;
    this.layerManager.initialiseMainLayer(this);
  }

  public async create() {
    await this.eval(`preload();`);

    await Promise.all(
      Array.from(this.preloadImageMap).map(async ([key, path]) => {
        await loadImage(this, key, path);
      })
    );

    await Promise.all(
      Array.from(this.preloadSoundMap).map(async ([key, path]) => {
        await loadSound(this, key, path);
      })
    );

    await this.eval(`create();`);
    const backButton = new CommonBackButton(
      this,
      () => {
        this.layerManager.clearAllLayers();
        this.scene.start('MainMenu');
      },
      0,
      0
    );
    this.add.existing(backButton);
  }

  public update() {
    this.eval(`\nupdate();`);
  }

  private async eval(append: string) {
    const context: Context = createContext(4, [], {}, 'gpu', {
      scene: this,
      phaser: Phaser,
      preloadImageMap: this.preloadImageMap,
      preloadSoundMap: this.preloadSoundMap,
      remotePath: Constants.assetsFolder
    });
    context.externalContext = 'playground';
    await runInContext(this.studentCode + append, context);
  }
}
