import * as Phaser from 'phaser';
import { AwardProperty } from 'src/features/game/awards/GameAwardsTypes';
import { Constants, screenSize } from 'src/features/game/commons/CommonConstants';
import { AssetPath, ItemId } from 'src/features/game/commons/CommonTypes';
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
import { GameSimulatorState } from 'src/features/gameSimulator/GameSimulatorTypes';

import { AchievementGoal, AchievementItem } from '../achievement/AchievementTypes';
import { fetchGameChapters } from './chapter/GameChapterHelpers';
import GameChapterMocks from './chapter/GameChapterMocks';
import { GameChapter } from './chapter/GameChapterTypes';
import Entry from './scenes/entry/Entry';
import { getRoomPreviewCode } from './scenes/roomPreview/RoomPreviewHelper';
import GameUserStateManager from './state/GameUserStateManager';

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
  achievements: AchievementItem[] | undefined;
  awardsMapping: Map<ItemId, AwardProperty>;
  currentSceneRef?: Phaser.Scene;
  gameChapters: GameChapter[];
  gameType: GameType;
  goals: AchievementGoal[] | undefined;
  isUsingMock: boolean;
  roomCode: string;
  roomPreviewMapping: Map<ItemId, AssetPath>;
  saveManager: GameSaveManager;
  setGameSimState: (value: React.SetStateAction<string>) => void;
  soundManager: GameSoundManager;
  ssChapterSimFilenames: string[];
  userStateManager: GameUserStateManager;
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
      achievements: undefined,
      currentSceneRef: undefined,
      gameChapters: [],
      gameType: gameType,
      goals: undefined,
      isUsingMock: false,
      roomCode: '',
      roomPreviewMapping: new Map<ItemId, AssetPath>(),
      saveManager: new GameSaveManager(),
      setGameSimState: Constants.nullFunction,
      soundManager: new GameSoundManager(),
      ssChapterSimFilenames: [],
      userStateManager: new GameUserStateManager()
    };
  }

  static getInstance = () => mandatory(SourceAcademyGame.instance);

  public stopAllSounds() {
    this.sound.stopAll();
  }

  public setAccountInfo(acc: AccountInfo | undefined) {
    this.global.accountInfo = acc;
  }

  public setAchievements(achievements: AchievementItem[]) {
    this.global.achievements = achievements;
  }

  public setAwardsMapping(awardsMapping: Map<ItemId, AwardProperty>) {
    this.global.awardsMapping = awardsMapping;
  }

  public addAwardMapping(awardId: ItemId, awardProp: AwardProperty) {
    this.global.awardsMapping.set(awardId, awardProp);
  }

  public setGoals(goals: AchievementGoal[]) {
    this.global.goals = goals;
  }

  public setGameSimStateSetter(setGameSimState: (value: React.SetStateAction<string>) => void) {
    this.setGameSimState = setGameSimState;
  }

  public setRoomPreviewMapping(mapping: Map<ItemId, AssetPath>) {
    this.global.roomPreviewMapping = mapping;
  }

  public async loadGameChapters() {
    this.global.gameChapters = await fetchGameChapters();
  }

  public async loadRoomCode() {
    this.global.roomCode = await getRoomPreviewCode();
  }

  public setGameSimState(state: GameSimulatorState) {
    this.global.setGameSimState(state);
  }

  public setCurrentSceneRef(scene: Phaser.Scene) {
    this.global.currentSceneRef = scene;
  }

  public toggleUsingMock(value?: boolean) {
    if (value === undefined) {
      this.global.isUsingMock = !this.global.isUsingMock;
    } else {
      this.global.isUsingMock = value;
    }
  }

  public setChapterSimStack(checkpointFilenames: string[]) {
    this.global.ssChapterSimFilenames = checkpointFilenames.reverse();
  }

  public getAwardsMapping = () => mandatory(this.global.awardsMapping);
  public getAccountInfo = () => mandatory(this.global.accountInfo);
  public getAchievements = () => mandatory(this.global.achievements);
  public getSoundManager = () => mandatory(this.global.soundManager);
  public getGoals = () => mandatory(this.global.goals);
  public getRoomPreviewMapping = () => mandatory(this.global.roomPreviewMapping);
  public getUserStateManager = () => mandatory(this.global.userStateManager);
  public getSaveManager = () => mandatory(this.global.saveManager);
  public getCurrentSceneRef = () => mandatory(this.global.currentSceneRef);
  public isGameType = (gameType: GameType) => this.global.gameType === gameType;
  public getSSChapterSimFilenames = () => this.global.ssChapterSimFilenames;
  public getIsUsingMock = () => this.global.isUsingMock;
  public getRoomCode = () => this.global.roomCode;
  public getGameChapters = () =>
    this.global.isUsingMock ? GameChapterMocks : this.global.gameChapters;
}

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.CANVAS,
  width: screenSize.x,
  height: screenSize.y,
  physics: {
    default: 'arcade'
  },
  scale: {
    mode: Phaser.Scale.FIT,
    parent: 'game-display'
  },
  fps: {
    target: 24
  },
  scene: [
    Entry,
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
