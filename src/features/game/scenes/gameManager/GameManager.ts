import Parser from 'src/features/game/parser/Parser';
import GameActionManager from '../../action/GameActionManager';
import GameLayerManager from 'src/features/game/layer/GameLayerManager';
import GameCharacterManager from 'src/features/game/character/GameCharacterManager';
import GameDialogueManager from 'src/features/game/dialogue/GameDialogueManager';
import GameStateManager from 'src/features/game/state/GameStateManager';
import GameObjectManager from 'src/features/game/objects/GameObjectManager';
import GameActionExecuter from 'src/features/game/action/GameActionExecuter';
import GameUserStateManager from 'src/features/game/state/GameUserStateManager';
import GameEscapeManager from '../../escape/GameEscapeManager';
import GamePhaseManager from '../../phase/GamePhaseManager';
import GameBBoxManager from 'src/features/game/boundingBoxes/GameBoundingBoxManager';
import GamePopUpManager from 'src/features/game/popUp/GamePopUpManager';
import GameSoundManager from '../../sound/GameSoundManager';
import GameSaveManager from '../../save/GameSaveManager';
import GameBackgroundManager from '../../background/GameBackgroundManager';

import LocationSelectChapter from '../LocationSelectChapter';
import commonAssets from 'src/features/game/commons/CommonAssets';
import { GameChapter } from 'src/features/game/chapter/GameChapterTypes';
import { LocationId } from 'src/features/game/location/GameMapTypes';
import { blackFade } from 'src/features/game/effects/FadeEffect';
import { addLoadingScreen } from 'src/features/game/effects/LoadingScreen';
import game, { AccountInfo } from 'src/pages/academy/game/subcomponents/phaserGame';
import { GamePhaseType } from '../../phase/GamePhaseTypes';

type GameManagerProps = {
  accountInfo: AccountInfo;
  text: string;
  continueGame: boolean;
  chapterNum: number;
};

class GameManager extends Phaser.Scene {
  public currentChapter: GameChapter;
  public currentLocationId: LocationId;

  public layerManager: GameLayerManager;
  public stateManager: GameStateManager;
  public objectManager: GameObjectManager;
  public characterManager: GameCharacterManager;
  public dialogueManager: GameDialogueManager;
  public actionExecuter: GameActionExecuter;
  public userStateManager: GameUserStateManager;
  public boundingBoxManager: GameBBoxManager;
  public popUpManager: GamePopUpManager;
  public saveManager: GameSaveManager;
  public soundManager: GameSoundManager;
  public escapeManager: GameEscapeManager;
  public phaseManager: GamePhaseManager;
  public backgroundManager: GameBackgroundManager;

  constructor() {
    super('GameManager');

    this.currentChapter = LocationSelectChapter;
    this.currentLocationId = this.currentChapter.startingLoc;

    this.layerManager = new GameLayerManager();
    this.stateManager = new GameStateManager();
    this.characterManager = new GameCharacterManager();
    this.objectManager = new GameObjectManager();
    this.dialogueManager = new GameDialogueManager();
    this.actionExecuter = new GameActionExecuter();
    this.userStateManager = new GameUserStateManager();
    this.boundingBoxManager = new GameBBoxManager();
    this.popUpManager = new GamePopUpManager();
    this.saveManager = new GameSaveManager();
    this.soundManager = new GameSoundManager();
    this.escapeManager = new GameEscapeManager();
    this.phaseManager = new GamePhaseManager();
    this.backgroundManager = new GameBackgroundManager();

    GameActionManager.getInstance().setGameManager(this);
  }

  async init({ text, continueGame, chapterNum }: GameManagerProps) {
    this.currentChapter = Parser.parse(text);
    await this.loadGameState(continueGame, chapterNum);

    this.soundManager.initialise(this);
    this.dialogueManager.initialise(this.currentChapter.map.getDialogues());
    this.characterManager.initialise(this.currentChapter.map.getCharacters());
    this.actionExecuter.initialise(this.currentChapter.map.getActions());
    this.boundingBoxManager.initialise();
    this.objectManager.initialise();
    this.layerManager.initialiseMainLayer(this);
    this.soundManager.loadSounds(this.currentChapter.map.getSoundAssets());
    this.bindEscapeMenu();
  }

  public async loadGameState(continueGame: boolean, chapterNum: number) {
    const accountInfo = game.getAccountInfo();
    if (accountInfo) {
      await this.saveManager.initialise(accountInfo, chapterNum);
      this.userStateManager.initialise(this.saveManager.getLoadedUserState());
    }
    const startingGameState =
      continueGame && accountInfo ? this.saveManager.getLoadedGameStoryState() : undefined;
    this.stateManager.initialise(this.currentChapter, startingGameState);
  }

  //////////////////////
  //    Preload       //
  //////////////////////

  public preload() {
    addLoadingScreen(this);
    this.preloadLocationsAssets(this.currentChapter);
    this.preloadBaseAssets();
  }

  private preloadBaseAssets() {
    commonAssets.forEach(asset => {
      this.load.image(asset.key, asset.path);
    });
  }

  private preloadLocationsAssets(chapter: GameChapter) {
    chapter.map.getMapAssets().forEach((assetPath, assetKey) => {
      this.load.image(assetKey, assetPath);
    });
  }

  //////////////////////
  // Location Helpers //
  //////////////////////

  public async create() {
    this.changeLocationTo(this.currentChapter.startingLoc);
    await GameActionManager.getInstance().saveGame();
  }

  private async renderLocation(locationId: LocationId) {
    // draw layers
    this.soundManager.renderBackgroundMusic(locationId);
    this.backgroundManager.renderBackgroundLayerContainer(locationId);
    this.objectManager.renderObjectsLayerContainer(locationId);
    this.boundingBoxManager.renderBBoxLayerContainer(locationId);
    this.characterManager.renderCharacterLayerContainer(locationId);

    // Notify players that location is not yet visited/has new update
    if (!this.stateManager.hasTriggeredInteraction(locationId)) {
      const locationName = this.currentChapter.map.getLocationAtId(locationId).name;
      await this.phaseManager.pushPhase(GamePhaseType.Notification, { id: locationName });
    } else {
      await this.phaseManager.refreshPhase(GamePhaseType.Menu);
    }
  }

  public async changeLocationTo(locationId: LocationId) {
    this.currentLocationId = locationId;

    await blackFade(this, 300, 300, () => {
      this.layerManager.clearAllLayers();
      this.renderLocation(locationId);
    });

    // Update state after location is fully rendered
    this.stateManager.triggerInteraction(locationId);
  }

  private bindEscapeMenu() {
    const escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    escKey.on('up', () => {
      if (this.phaseManager.isCurrentPhase(GamePhaseType.EscapeMenu)) {
        this.phaseManager.popPhase();
      } else {
        this.phaseManager.pushPhase(GamePhaseType.EscapeMenu);
      }
    });
  }
}

export default GameManager;
