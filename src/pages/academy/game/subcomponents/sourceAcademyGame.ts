import * as Phaser from 'phaser';
import { AwardProperty } from 'src/features/game/awards/GameAwardsTypes';
import { Constants, screenSize } from 'src/features/game/commons/CommonConstants';
import { ItemId } from 'src/features/game/commons/CommonTypes';
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

export type AccountInfo = {
  accessToken: string;
  refreshToken: string;
  role: string;
  name: string;
};

type GlobalGameProps = {
  accountInfo: AccountInfo | undefined;
  setStorySimState: (value: React.SetStateAction<string>) => void;
  awardsMapping: Map<ItemId, AwardProperty>;
  currentSceneRef?: Phaser.Scene;
  soundManager?: GameSoundManager;
};

export default class SourceAcademyGame extends Phaser.Game {
  protected global: GlobalGameProps;
  static instance: SourceAcademyGame;

  constructor(config: Phaser.Types.Core.GameConfig) {
    super(config);
    this.global = {
      awardsMapping: new Map<ItemId, AwardProperty>(),
      accountInfo: undefined,
      setStorySimState: Constants.nullFunction,
      currentSceneRef: undefined
    };
    SourceAcademyGame.instance = this;
  }

  static getInstance = () => mandatory(SourceAcademyGame.instance);

  public init() {
    this.global.soundManager = new GameSoundManager();
  }

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
  public getCurrentSceneRef = () => mandatory(this.global.currentSceneRef);

  public setStorySimStateSetter(setStorySimState: (value: React.SetStateAction<string>) => void) {
    this.setStorySimState = setStorySimState;
  }

  public setStorySimState(state: StorySimState) {
    this.global.setStorySimState(state);
  }

  public setCurrentSceneRef(scene: Phaser.Scene) {
    this.global.currentSceneRef = scene;
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
  const game = new SourceAcademyGame(config);
  game.init();
  return game;
};
