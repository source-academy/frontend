import { Context, runInContext } from 'js-slang';
import { createContext } from 'src/commons/utils/JsSlangHelper';
import SourceAcademyGame from 'src/pages/academy/game/subcomponents/sourceAcademyGame';

import GameAwardsManager from '../../awards/GameAwardsManager';
import { Constants, screenSize } from '../../commons/CommonConstants';
import { addLoadingScreen } from '../../effects/LoadingScreen';
import GameEscapeManager from '../../escape/GameEscapeManager';
import GameInputManager from '../../input/GameInputManager';
import GameLayerManager from '../../layer/GameLayerManager';
import { Layer } from '../../layer/GameLayerTypes';
import GamePhaseManager from '../../phase/GamePhaseManager';
import { GamePhaseType } from '../../phase/GamePhaseTypes';
import { createEmptySaveState } from '../../save/GameSaveHelper';
import GameSaveManager from '../../save/GameSaveManager';
import { loadData } from '../../save/GameSaveRequests';
import { FullSaveState } from '../../save/GameSaveTypes';
import { UserStateTypes } from '../../state/GameStateTypes';
import GameUserStateManager from '../../state/GameUserStateManager';
import { loadImage, loadSound } from '../../utils/LoaderUtils';
import { roomDefaultCode } from './RoomPreviewConstants';
import { createCMRGamePhases, createVerifiedHoverContainer } from './RoomPreviewHelper';

type RoomPreviewProps = {
  studentCode: string;
  fullSaveState: FullSaveState;
};

/**
 * This scene uses the students code as part of its code.
 *
 * Additionally, the scene shares some common functionality as
 * GameManager, in that it incorporates escape menu and collectible
 * menu.
 */
export default class RoomPreview extends Phaser.Scene {
  public fullSaveState: FullSaveState;

  public layerManager: GameLayerManager;
  public inputManager: GameInputManager;

  private phaseManager: GamePhaseManager;
  private userStateManager: GameUserStateManager;
  private saveManager: GameSaveManager;
  private escapeManager: GameEscapeManager;
  private awardManager: GameAwardsManager;
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
    this.inputManager = new GameInputManager();
    this.escapeManager = new GameEscapeManager();
    this.userStateManager = new GameUserStateManager();
    this.awardManager = new GameAwardsManager();
    this.studentCode = roomDefaultCode;
    this.fullSaveState = createEmptySaveState();
  }

  public init({ studentCode, fullSaveState }: RoomPreviewProps) {
    SourceAcademyGame.getInstance().setCurrentSceneRef(this);

    this.studentCode = studentCode;
    this.fullSaveState = fullSaveState;

    this.userStateManager = new GameUserStateManager();
    this.layerManager = new GameLayerManager();
    this.phaseManager = new GamePhaseManager();
    this.saveManager = new GameSaveManager();
    this.inputManager = new GameInputManager();
    this.escapeManager = new GameEscapeManager();
    this.awardManager = new GameAwardsManager();
  }

  public preload() {
    addLoadingScreen(this);
    this.userStateManager.initialise(this.fullSaveState.userSaveState);
    this.layerManager.initialise(this);
    this.inputManager.initialise(this);
    this.awardManager.initialise(this, this.userStateManager, this.phaseManager);
    this.phaseManager.initialise(
      createCMRGamePhases(this.escapeManager, this.awardManager),
      this.inputManager
    );
    this.escapeManager.initialise(this, this.phaseManager, this.saveManager, false);
    this.bindKeyboardTriggers();
  }

  public async create() {
    // Process student's information
    const accountInfo = SourceAcademyGame.getInstance().getAccountInfo();
    const fullSaveState = await loadData(accountInfo);
    this.saveManager.initialiseForSettings(accountInfo, fullSaveState);
    await this.userStateManager.loadAchievements();

    /**
     * We don't use .eval('preload();') at preload() as
     * .eval() is not awaited by the preload() method i.e. it does not
     * wait for student's preload function to finish.
     *
     * Instead, the students' 'preload()' function simply populate a map
     * of assets key and path to be loaded.
     *
     * We await the students .eval('preload();') at create()
     * to ensure that the .eval('preload();') is fully resolved.
     */
    await this.eval(`preload();`);

    // Preload all necessary assets
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

    // Execute create
    await this.eval(`create();`);
    SourceAcademyGame.getInstance().getSoundManager().stopCurrBgMusic();

    const cookie = new Phaser.GameObjects.Sprite(this, 1920 / 2, 1080 / 2, 'cookies');
    this.attachVerificationTag(cookie);
    this.layerManager.addToLayer(Layer.Objects, cookie);
  }

  public update() {
    this.eval(`\nupdate();`);
  }

  private async eval(append: string) {
    // Pass necessary information to the library as context
    const context: Context = createContext(4, [], {}, 'gpu', {
      scene: this,
      phaser: Phaser,
      preloadImageMap: this.preloadImageMap,
      preloadSoundMap: this.preloadSoundMap,
      layerManager: this.layerManager,
      layerTypes: Layer,
      remotePath: Constants.assetsFolder,
      screenSize: screenSize,
      verify: (sprite: Phaser.GameObjects.Sprite) => this.attachVerificationTag(sprite),
      achievements: this.userStateManager.getList(UserStateTypes.achievements)
    });
    context.externalContext = 'playground';

    // Wait for students code to finish
    await runInContext(this.studentCode + append, context);
  }

  private bindKeyboardTriggers() {
    // Bind escape menu
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
    // Bind collectible menu
    this.inputManager.registerKeyboardListener(
      Phaser.Input.Keyboard.KeyCodes.TAB,
      'up',
      async () => {
        if (this.phaseManager.isCurrentPhase(GamePhaseType.AwardMenu)) {
          await this.phaseManager.popPhase();
        } else {
          await this.phaseManager.pushPhase(GamePhaseType.AwardMenu);
        }
      }
    );
  }

  public cleanUp() {
    SourceAcademyGame.getInstance().getSoundManager().stopCurrBgMusic();
    this.inputManager.clearListeners();
    this.layerManager.clearAllLayers();
  }

  private attachVerificationTag(sprite: Phaser.GameObjects.Sprite) {
    const [verifCont, verifMask] = createVerifiedHoverContainer(this);

    sprite.setInteractive({ pixelPerfect: true, useHandCursor: true });
    sprite.addListener(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, () =>
      verifCont.setVisible(true)
    );
    sprite.addListener(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, () =>
      verifCont.setVisible(false)
    );
    sprite.addListener(
      Phaser.Input.Events.GAMEOBJECT_POINTER_MOVE,
      (pointer: Phaser.Input.Pointer) => {
        verifCont.x = pointer.x + 10;
        verifCont.y = pointer.y - 10;
        verifMask.x = pointer.x + 10;
        verifMask.y = pointer.y - 10;
      }
    );

    this.layerManager.addToLayer(Layer.UI, verifCont);
    return sprite;
  }
}
