import * as Phaser from 'phaser';
import { SoundAsset } from 'src/features/game/assets/AssetsTypes';
import { AssetKey } from 'src/features/game/commons/CommonTypes';
import Achievements from 'src/features/game/scenes/achievements/Achievements';
import ChapterSelect from 'src/features/game/scenes/chapterSelect/ChapterSelect';
import CheckpointTransition from 'src/features/game/scenes/checkpointTransition/CheckpointTransition';
import GameManager from 'src/features/game/scenes/gameManager/GameManager';
import MainMenu from 'src/features/game/scenes/mainMenu/MainMenu';
import RoomPreview from 'src/features/game/scenes/roomPreview/RoomPreview';
import Settings from 'src/features/game/scenes/settings/Settings';
import { mandatory } from 'src/features/game/utils/GameUtils';
import StorySimMainMenu from 'src/features/storySimulator/scenes/mainMenu/MainMenu';
import { StorySimState } from 'src/features/storySimulator/StorySimulatorTypes';

import { screenSize } from '../../../../features/game/commons/CommonConstants';

export type AccountInfo = {
  accessToken: string;
  refreshToken: string;
  role: string;
  name: string;
};

type StorySimulatorProps = {
  setStorySimState: (value: React.SetStateAction<string>) => void;
  mainMenuRef: StorySimMainMenu;
};

type GlobalGameProps = {
  currBgMusicKey: AssetKey | undefined;
  soundAssetMap: Map<AssetKey, SoundAsset>;
  accountInfo: AccountInfo | undefined;
  storySimulatorProps?: StorySimulatorProps;
};

export class SourceAcademyGame extends Phaser.Game {
  public global: GlobalGameProps;

  constructor(config: Phaser.Types.Core.GameConfig) {
    super(config);
    this.global = {
      currBgMusicKey: undefined,
      soundAssetMap: new Map<AssetKey, SoundAsset>(),
      accountInfo: undefined
    };
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

  public getAccountInfo() {
    return mandatory(this.global.accountInfo) as AccountInfo;
  }

  public setStorySimProps(storySimulatorProps: any) {
    this.global.storySimulatorProps = {
      ...this.global.storySimulatorProps,
      ...storySimulatorProps
    };
  }

  public setStorySimState(state: StorySimState) {
    this.getStorySimProps().setStorySimState(state);
  }

  public getStorySimProps() {
    return mandatory(this.global.storySimulatorProps) as StorySimulatorProps;
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

let sourceAcademyGame: SourceAcademyGame;
export const getSourceAcademyGame = () => {
  return sourceAcademyGame;
};

export const createSourceAcademyGame = () => {
  sourceAcademyGame = new SourceAcademyGame(config);
};
