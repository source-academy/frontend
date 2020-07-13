import { Context, runInContext } from 'js-slang';
import { createContext } from 'src/commons/utils/JsSlangHelper';
import CommonBackButton from '../../commons/CommonBackButton';
import GameLayerManager from '../../layer/GameLayerManager';
import { roomDefaultCode } from './RoomPreviewConstants';
import { loadImage, loadSound } from 'src/features/game/utils/LoaderUtils';
import { Constants, screenSize } from '../../commons/CommonConstants';
import GameSoundManager from '../../sound/GameSoundManager';
import { getSourceAcademyGame } from 'src/pages/academy/game/subcomponents/sourceAcademyGame';
import GameCollectiblesManager from '../../collectibles/GameCollectiblesManager';
import GameInputManager from '../../input/GameInputManager';
import { Layer } from '../../layer/GameLayerTypes';

type RoomPreviewProps = {
  studentCode: string;
};

export default class RoomPreview extends Phaser.Scene {
  private layerManager: GameLayerManager;
  private soundManager: GameSoundManager;
  private inputManager: GameInputManager;
  private collectibleManager: GameCollectiblesManager;
  private studentCode: string;
  private preloadImageMap: Map<string, string>;
  private preloadSoundMap: Map<string, string>;

  // TODO: Replace with phase manager
  private isCollectibleMenuActive: boolean;

  constructor() {
    super('RoomPreview');
    this.preloadImageMap = new Map<string, string>();
    this.preloadSoundMap = new Map<string, string>();
    this.layerManager = new GameLayerManager();
    this.soundManager = new GameSoundManager();
    this.inputManager = new GameInputManager();
    this.collectibleManager = new GameCollectiblesManager();
    this.studentCode = roomDefaultCode;
    this.isCollectibleMenuActive = false;
  }

  public init({ studentCode }: RoomPreviewProps) {
    this.studentCode = studentCode;
    this.layerManager.initialise(this);
    this.soundManager.initialise(this, getSourceAcademyGame());
    this.inputManager.initialise(this);
    this.collectibleManager.initialise(this, this.layerManager, this.soundManager);
    this.bindKeyboardTriggers();
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
        this.cleanUp();
        this.scene.start('MainMenu');
      },
      0,
      0,
      this.soundManager
    );
    this.layerManager.addToLayer(Layer.UI, backButton);
    this.soundManager.stopCurrBgMusic();
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
      layerManager: this.layerManager,
      layerTypes: Layer,
      remotePath: Constants.assetsFolder,
      screenSize: screenSize
    });
    context.externalContext = 'playground';
    await runInContext(this.studentCode + append, context);
  }

  private bindKeyboardTriggers() {
    this.inputManager.registerKeyboardListener(Phaser.Input.Keyboard.KeyCodes.I, 'up', async () => {
      if (this.isCollectibleMenuActive) {
        await this.collectibleManager.deactivateUI();
        this.isCollectibleMenuActive = false;
      } else {
        await this.collectibleManager.activateUI();
        this.isCollectibleMenuActive = true;
      }
    });
  }

  public cleanUp() {
    this.soundManager.stopCurrBgMusic();
    this.inputManager.clearListeners();
    this.layerManager.clearAllLayers();
  }
}
