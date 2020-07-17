import * as Phaser from 'phaser';
import { SoundAsset } from 'src/features/game/assets/AssetsTypes';
import { AwardProperty } from 'src/features/game/award/AwardTypes';
import { Constants, screenSize } from 'src/features/game/commons/CommonConstants';
import { AssetKey, ItemId } from 'src/features/game/commons/CommonTypes';
import Achievements from 'src/features/game/scenes/achievements/Achievements';
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
  currBgMusicKey: AssetKey | undefined;
  soundAssetMap: Map<AssetKey, SoundAsset>;
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
      currBgMusicKey: undefined,
      soundAssetMap: new Map<AssetKey, SoundAsset>(),
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

  public setCurrBgMusicKey(key: AssetKey | undefined) {
    this.global.currBgMusicKey = key;
  }

  public getCurrBgMusicKey() {
    return this.global.currBgMusicKey;
  }

  public addSoundAsset(soundAsset: SoundAsset) {
    this.global.soundAssetMap.set(soundAsset.key, soundAsset);
  }

  public clearSoundAssetMap() {
    this.global.soundAssetMap.clear();
  }

  public getSoundAsset(key: AssetKey) {
    return this.global.soundAssetMap.get(key);
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
    Achievements,
    RoomPreview
  ]
};

export const createSourceAcademyGame = () => {
  const game = new SourceAcademyGame(config);
  game.init();
  return game;
};
