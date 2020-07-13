import { Context, runInContext } from 'js-slang';
import { createContext } from 'src/commons/utils/JsSlangHelper';
import GameLayerManager from '../../layer/GameLayerManager';
import { roomDefaultCode } from './RoomPreviewConstants';
import { loadImage, loadSound } from 'src/features/game/utils/LoaderUtils';
import { Constants, screenSize } from '../../commons/CommonConstants';
import GameSoundManager from '../../sound/GameSoundManager';
import { getSourceAcademyGame } from 'src/pages/academy/game/subcomponents/sourceAcademyGame';
import GameCollectiblesManager from '../../collectibles/GameCollectiblesManager';
import GameInputManager from '../../input/GameInputManager';
import { Layer } from '../../layer/GameLayerTypes';
import GamePhaseManager from '../../phase/GamePhaseManager';
import GameSaveManager from '../../save/GameSaveManager';
import GameEscapeManager from '../../escape/GameEscapeManager';
import { addLoadingScreen } from '../../effects/LoadingScreen';
import { loadData } from '../../save/GameSaveRequests';
import { createCMRGamePhases } from './RoomPreviewHelper';
import { GamePhaseType } from '../../phase/GamePhaseTypes';

type RoomPreviewProps = {
  studentCode: string;
};

export default class RoomPreview extends Phaser.Scene {
  private layerManager: GameLayerManager;
  private phaseManager: GamePhaseManager;
  private soundManager: GameSoundManager;
  private inputManager: GameInputManager;
  private saveManager: GameSaveManager;
  private escapeManager: GameEscapeManager;
  private collectibleManager: GameCollectiblesManager;
  private studentCode: string;
  private preloadImageMap: Map<string, string>;
  private preloadSoundMap: Map<string, string>;

  constructor() {
    super('RoomPreview');
    this.preloadImageMap = new Map<string, string>();
    this.preloadSoundMap = new Map<string, string>();
    this.layerManager = new GameLayerManager();
    this.phaseManager = new GamePhaseManager();
    this.saveManager = new GameSaveManager();
    this.soundManager = new GameSoundManager();
    this.inputManager = new GameInputManager();
    this.escapeManager = new GameEscapeManager();
    this.collectibleManager = new GameCollectiblesManager();
    this.studentCode = roomDefaultCode;
  }

  public init({ studentCode }: RoomPreviewProps) {
    this.studentCode = studentCode;
    this.layerManager = new GameLayerManager();
    this.phaseManager = new GamePhaseManager();
    this.saveManager = new GameSaveManager();
    this.soundManager = new GameSoundManager();
    this.inputManager = new GameInputManager();
    this.escapeManager = new GameEscapeManager();
    this.collectibleManager = new GameCollectiblesManager();
  }

  public preload() {
    addLoadingScreen(this);
    this.soundManager.initialise(this, getSourceAcademyGame());
    this.layerManager.initialise(this);
    this.inputManager.initialise(this);
    this.collectibleManager.initialise(this, this.layerManager, this.soundManager);
    this.phaseManager.initialise(
      createCMRGamePhases(this.escapeManager, this.collectibleManager),
      this.inputManager
    );
    this.escapeManager.initialise(
      this,
      this.layerManager,
      this.phaseManager,
      this.soundManager,
      this.inputManager,
      this.saveManager,
      false
    );
    this.bindKeyboardTriggers();
  }

  public async create() {
    const accountInfo = getSourceAcademyGame().getAccountInfo();
    const fullSaveState = await loadData(accountInfo);
    this.saveManager.initialiseForSettings(accountInfo, fullSaveState);

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
    this.inputManager.registerKeyboardListener(
      Phaser.Input.Keyboard.KeyCodes.ESC,
      'up',
      async () => {
        if (this.phaseManager.isCurrentPhase(GamePhaseType.EscapeMenu)) {
          await this.phaseManager.popPhase();
        } else {
          await this.phaseManager.pushPhase(GamePhaseType.EscapeMenu);
        }
      }
    );
    this.inputManager.registerKeyboardListener(Phaser.Input.Keyboard.KeyCodes.I, 'up', async () => {
      if (this.phaseManager.isCurrentPhase(GamePhaseType.CollectibleMenu)) {
        await this.phaseManager.popPhase();
      } else {
        await this.phaseManager.pushPhase(GamePhaseType.CollectibleMenu);
      }
    });
  }

  public cleanUp() {
    this.soundManager.stopCurrBgMusic();
    this.inputManager.clearListeners();
    this.layerManager.clearAllLayers();
  }
}
