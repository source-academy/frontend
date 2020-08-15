import { Context, runInContext } from 'js-slang';
import { createContext } from 'src/commons/utils/JsSlangHelper';

import ImageAssets from '../../assets/ImageAssets';
import { getAwardProp } from '../../awards/GameAwardsHelper';
import GameAwardsManager from '../../awards/GameAwardsManager';
import { Constants, screenCenter, screenSize } from '../../commons/CommonConstants';
import { ItemId } from '../../commons/CommonTypes';
import { addLoadingScreen } from '../../effects/LoadingScreen';
import GameEscapeManager from '../../escape/GameEscapeManager';
import GameInputManager from '../../input/GameInputManager';
import GameLayerManager from '../../layer/GameLayerManager';
import { Layer } from '../../layer/GameLayerTypes';
import GamePhaseManager from '../../phase/GamePhaseManager';
import { GamePhaseType } from '../../phase/GamePhaseTypes';
import SourceAcademyGame from '../../SourceAcademyGame';
import { mandatory } from '../../utils/GameUtils';
import { loadImage, loadSound, loadSpritesheet } from '../../utils/LoaderUtils';
import { resizeOverflow } from '../../utils/SpriteUtils';
import { roomDefaultCode } from './RoomPreviewConstants';
import { createCMRGamePhases, createVerifiedHoverContainer } from './RoomPreviewHelper';

/**
 * This scene uses the students code as part of its code.
 *
 * Additionally, the scene shares some common functionality as
 * GameManager, in that it incorporates escape menu and collectible
 * menu.
 *
 * Student code is not executed within a layer manager as
 * there are features that do not work well with container
 * e.g. mask, animations.
 *
 * Hence, student code will be executed and added to the scene
 * as per normal. Meanwhile, UI parts of this scene will still
 * make use of the layer manager; separate from student code.
 */
export default class RoomPreview extends Phaser.Scene {
  private layerManager?: GameLayerManager;
  private inputManager?: GameInputManager;
  private phaseManager?: GamePhaseManager;
  private escapeManager?: GameEscapeManager;
  private awardManager?: GameAwardsManager;

  private studentCode: string;
  private preloadImageMap: Map<string, string>;
  private preloadSoundMap: Map<string, string>;
  private preloadSpritesheetMap: Map<string, [string, object]>;

  private verifCont: Phaser.GameObjects.Container | undefined;

  private context?: Context;

  constructor() {
    super('RoomPreview');
    this.preloadImageMap = new Map<string, string>();
    this.preloadSoundMap = new Map<string, string>();
    this.preloadSpritesheetMap = new Map<string, [string, object]>();
    this.studentCode = roomDefaultCode;
  }

  public init() {
    SourceAcademyGame.getInstance().setCurrentSceneRef(this);
    this.studentCode = SourceAcademyGame.getInstance().getRoomCode();
    this.createContext();
  }

  public preload() {
    addLoadingScreen(this);

    // Initialise one verified tag to be used throughout the CMR
    this.verifCont = createVerifiedHoverContainer(this);
  }

  public async create() {
    // Run student code once to update the context
    await this.eval(this.studentCode);

    this.renderDefaultBackground();

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
    await Promise.all(
      Array.from(this.preloadSpritesheetMap).map(async ([key, [path, config]]) => {
        await loadSpritesheet(this, key, path, config);
      })
    );

    // Execute create
    await this.eval(`create();`);
    SourceAcademyGame.getInstance().getSoundManager().playBgMusic(Constants.nullInteractionId);

    // Initialise managers after students `create()`
    // This is primarily to ensure layer manager's layer
    // are on top of the displayed room objects
    this.initialiseManagers();

    // Binding keyboard triggers require managers to be initialised
    this.bindKeyboardTriggers();

    // Add verified tag
    this.getLayerManager().addToLayer(Layer.UI, this.getVerifCont());
  }

  public update() {
    /**
     * runInContext appends new frame everytime it is run,
     * which leads to out of memory error when we run
     * runInContext as often as FPS of the game for `update()`.
     *
     * Hence, we replace the scope instead of appending
     * new one each time.
     */
    this.context!.nativeStorage.globals = this.context!.nativeStorage.globals!.previousScope;
    this.eval(`update();`);
  }

  public createContext() {
    this.context = createContext(4, [], {}, 'gpu', {
      scene: this,
      phaser: Phaser,
      preloadImageMap: this.preloadImageMap,
      preloadSoundMap: this.preloadSoundMap,
      preloadSpritesheetMap: this.preloadSpritesheetMap,
      remotePath: Constants.assetsFolder,
      screenSize: screenSize,
      createAward: (x: number, y: number, key: ItemId) => this.createAward(x, y, key)
    });
    this.context.externalContext = 'playground';
  }

  private async eval(code: string) {
    // runInContext also automatically updates the context
    await runInContext(code, this.context!);
  }

  /**
   * Bind the escape menu and awards menu to keyboard keys.
   */
  private bindKeyboardTriggers() {
    // Bind escape menu
    this.getInputManager().registerKeyboardListener(
      Phaser.Input.Keyboard.KeyCodes.ESC,
      'up',
      async () => {
        if (this.getPhaseManager().isCurrentPhase(GamePhaseType.EscapeMenu)) {
          await this.getPhaseManager().popPhase();
        } else {
          await this.getPhaseManager().pushPhase(GamePhaseType.EscapeMenu);
        }
      }
    );
    // Bind award menu
    this.getInputManager().registerKeyboardListener(
      Phaser.Input.Keyboard.KeyCodes.TAB,
      'up',
      async () => {
        if (this.getPhaseManager().isCurrentPhase(GamePhaseType.AwardMenu)) {
          await this.getPhaseManager().popPhase();
        } else {
          await this.getPhaseManager().pushPhase(GamePhaseType.AwardMenu);
        }
      }
    );
  }

  /**
   * Clean up on related managers
   */
  public cleanUp() {
    this.getInputManager().clearListeners();
    this.getLayerManager().clearAllLayers();
  }

  /**
   * Create an award based on the given award key.
   * The award key is associated with an awardProperty,
   * which in turn will be used as the source of information for
   * the award.
   *
   * If the award is a valid key and the student already has
   * the award, the resulting object will have a verification
   * tag that pops up when student hovers over it.
   *
   * Else, we return a default image of a cookie; without
   * the verification tag.
   *
   * @param x x position of the award
   * @param y y position of the award
   * @param awardKey key associated with the award
   */
  private createAward(x: number, y: number, awardKey: ItemId) {
    const achievements = this.getUserStateManager().getAchievements();
    const collectibles = this.getUserStateManager().getCollectibles();
    if (achievements.includes(awardKey) || collectibles.includes(awardKey)) {
      const awardProp = getAwardProp(awardKey);
      const award = new Phaser.GameObjects.Sprite(this, x, y, awardProp.assetKey);
      return this.attachVerificationTag(award);
    }
    return new Phaser.GameObjects.Sprite(this, x, y, ImageAssets.cookies.key);
  }

  /**
   * Attach a verification tag to the sprite.
   * When user hovers on the sprite, a verification will appear
   * on the image.
   *
   * Used to verify autheticity of the award.
   *
   * @param sprite sprite to attach the verification tag to
   */
  private attachVerificationTag(sprite: Phaser.GameObjects.Sprite) {
    const verifCont = this.getVerifCont();

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
      }
    );
    return sprite;
  }

  /**
   * Render starting background for the room.
   */
  private renderDefaultBackground() {
    const backgroundAsset = new Phaser.GameObjects.Image(
      this,
      screenCenter.x,
      screenCenter.y,
      this.getDefaultBackgroundKey()
    );
    resizeOverflow(backgroundAsset, screenSize.x, screenSize.y);

    // Don't use layer manager because it does not exist at this point
    this.add.existing(backgroundAsset);
  }

  /**
   * Returns the background key to be used, based on the user's assessment
   * progression.
   */
  private getDefaultBackgroundKey() {
    // Once reversed, the first element is the submitted assessment with the most recent close date
    const completedAssessmentIds = this.getUserStateManager().getAssessments().reverse();
    const backgroundMapping = SourceAcademyGame.getInstance().getRoomPreviewMapping();

    // Iterative search for assessment with valid mapping
    for (let i = 0; i < completedAssessmentIds.length; i++) {
      if (backgroundMapping.has(completedAssessmentIds[i])) {
        return completedAssessmentIds[i];
      }
    }

    // If there is no valid mapping, we use default background image
    return ImageAssets.sourceCrashedPod.key;
  }

  /**
   * Construct the necessary managers for this scene
   */
  private initialiseManagers() {
    this.layerManager = new GameLayerManager(this);
    this.inputManager = new GameInputManager(this);
    this.phaseManager = new GamePhaseManager(createCMRGamePhases(), this.inputManager);
    this.escapeManager = new GameEscapeManager(this);
    this.awardManager = new GameAwardsManager(this);
  }

  private getVerifCont = () => mandatory(this.verifCont);
  private getUserStateManager = () => SourceAcademyGame.getInstance().getUserStateManager();

  public getInputManager = () => mandatory(this.inputManager);
  public getLayerManager = () => mandatory(this.layerManager);
  public getPhaseManager = () => mandatory(this.phaseManager);
  public getEscapeManager = () => mandatory(this.escapeManager);
  public getAwardManager = () => mandatory(this.awardManager);
}
