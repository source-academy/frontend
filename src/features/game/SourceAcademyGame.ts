import * as Phaser from 'phaser';
import { AwardProperty } from 'src/features/game/awards/GameAwardsTypes';
import { Constants, screenSize } from 'src/features/game/commons/CommonConstants';
import { ItemId } from 'src/features/game/commons/CommonTypes';
import GameSaveManager from 'src/features/game/save/GameSaveManager';
import AwardsHall from 'src/features/game/scenes/awardsHall/AwardsHall';
import Bindings from 'src/features/game/scenes/bindings/Bindings';
import ChapterSelect from 'src/features/game/scenes/chapterSelect/ChapterSelect';
import CheckpointTransition from 'src/features/game/scenes/checkpointTransition/CheckpointTransition';
import GameManager from 'src/features/game/scenes/gameManager/GameManager';
import MainMenu from 'src/features/game/scenes/mainMenu/MainMenu';
import RoomPreview from 'src/features/game/scenes/roomPreview/RoomPreview';
import Settings from 'src/features/game/scenes/settings/Settings';
import GameSoundManager from 'src/features/game/sound/GameSoundManager';
import { mandatory } from 'src/features/game/utils/GameUtils';
import { StorySimState } from 'src/features/storySimulator/StorySimulatorTypes';

import { fetchChapters } from '../storySimulator/StorySimulatorService';
import { toTxtPath } from './assets/TextAssets';
import { GameChapter } from './chapter/GameChapterTypes';

export type AccountInfo = {
  accessToken: string;
  refreshToken: string;
  role: string;
  name: string;
};

export enum GameType {
  Simulator = 'Simulator',
  Game = 'Game'
}

type GlobalGameProps = {
  accountInfo: AccountInfo | undefined;
  setStorySimState: (value: React.SetStateAction<string>) => void;
  awardsMapping: Map<ItemId, AwardProperty>;
  currentSceneRef?: Phaser.Scene;
  soundManager: GameSoundManager;
  saveManager: GameSaveManager;
  gameType: GameType;
  gameChapters: GameChapter[];
  ssChapterSimFilenames: string[];
};

export default class SourceAcademyGame extends Phaser.Game {
  static instance: SourceAcademyGame;
  protected global: GlobalGameProps;
  public isMounted: boolean;

  constructor(config: Phaser.Types.Core.GameConfig, gameType: GameType) {
    super(config);
    SourceAcademyGame.instance = this;
    this.isMounted = true;
    this.global = {
      awardsMapping: new Map<ItemId, AwardProperty>(),
      accountInfo: undefined,
      setStorySimState: Constants.nullFunction,
      currentSceneRef: undefined,
      soundManager: new GameSoundManager(),
      saveManager: new GameSaveManager(),
      gameType,
      gameChapters: [],
      ssChapterSimFilenames: []
    };
  }

  static getInstance = () => mandatory(SourceAcademyGame.instance);

  public stopAllSounds() {
    this.sound.stopAll();
  }

  public setAccountInfo(acc: AccountInfo | undefined) {
    this.global.accountInfo = acc;
  }

  public setAwardsMapping(awardsMapping: Map<ItemId, AwardProperty>) {
    this.global.awardsMapping = awardsMapping;
  }

  public getAwardsMapping = () => mandatory(this.global.awardsMapping);
  public getAccountInfo = () => mandatory(this.global.accountInfo);
  public getSoundManager = () => mandatory(this.global.soundManager);
  public getSaveManager = () => mandatory(this.global.saveManager);
  public getCurrentSceneRef = () => mandatory(this.global.currentSceneRef);
  public isGameType = (gameType: GameType) => this.global.gameType === gameType;
  public getGameChapters = () => this.global.gameChapters;
  public getSSChapterSimFilenames = () => this.global.ssChapterSimFilenames;

  public setStorySimStateSetter(setStorySimState: (value: React.SetStateAction<string>) => void) {
    this.setStorySimState = setStorySimState;
  }

  public async loadGameChapters() {
    const chapters = await fetchChapters();
    chapters.forEach(chapter => (chapter.filenames = chapter.filenames.map(toTxtPath)));
    this.global.gameChapters = chapters;
    return chapters;
  }

  public setStorySimState(state: StorySimState) {
    this.global.setStorySimState(state);
  }

  public setCurrentSceneRef(scene: Phaser.Scene) {
    this.global.currentSceneRef = scene;
  }

  public setChapterSimStack(checkpointFilenames: string[]) {
    this.global.ssChapterSimFilenames = checkpointFilenames.reverse();
  }
}

const config = {
  debug: true,
  type: Phaser.WEBGL,
  width: screenSize.x,
  height: screenSize.y,
  physics: {
    default: 'arcade'
  },
  scale: {
    mode: Phaser.Scale.FIT,
    parent: 'game-display'
  },
  scene: [
    MainMenu,
    Settings,
    ChapterSelect,
    GameManager,
    CheckpointTransition,
    AwardsHall,
    RoomPreview,
    Bindings
  ]
};

export const createSourceAcademyGame = () => {
  return new SourceAcademyGame(config, GameType.Game);
};
