import * as Phaser from 'phaser';
import { screenSize } from '../../../../features/game/commons/CommonConstants';
import { AssetKey } from 'src/features/game/commons/CommonsTypes';
import MainMenu from 'src/features/game/scenes/mainMenu/MainMenu';
import ChapterSelect from 'src/features/game/scenes/chapterSelect/ChapterSelect';
import GameManager from 'src/features/game/scenes/gameManager/GameManager';
import Settings from 'src/features/game/scenes/settings/Settings';
import CheckpointTransition from 'src/features/game/scenes/checkpointTransition/CheckpointTransition';
import MyRoom from 'src/features/game/scenes/myRoom/MyRoom';

export type AccountInfo = {
  accessToken: string;
  refreshToken: string;
  role: string;
  name: string;
};

type StorySimulatorProps = {
  setStorySimState: (value: React.SetStateAction<string>) => void;
};

type GlobalGameProps = {
  currBgMusicKey: AssetKey | undefined;
  accountInfo: AccountInfo | undefined;
  storySimulatorProps?: StorySimulatorProps;
};

export class SourceAcademyGame extends Phaser.Game {
  public global: GlobalGameProps;

  constructor(config: Phaser.Types.Core.GameConfig) {
    super(config);
    this.global = {
      currBgMusicKey: undefined,
      accountInfo: undefined
    };
  }

  public setCurrBgMusicKey(key: AssetKey | undefined) {
    this.global.currBgMusicKey = key;
  }

  public getCurrBgMusicKey() {
    return this.global.currBgMusicKey;
  }

  public setAccountInfo(acc: AccountInfo | undefined) {
    this.global.accountInfo = acc;
  }

  public getAccountInfo() {
    if (!this.global.accountInfo) {
      throw new Error('No account info');
    }
    return this.global.accountInfo;
  }

  public setStorySimProps(storySimulatorProps: StorySimulatorProps) {
    this.global.storySimulatorProps = {
      ...this.global.storySimulatorProps,
      ...storySimulatorProps
    };
  }

  public getStorySimProps(key: string) {
    const storySimProps = this.global.storySimulatorProps;
    if (!storySimProps || !storySimProps[key]) {
      throw new Error('Story Sim property not found');
    }
    return storySimProps[key];
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
  scene: [MainMenu, Settings, ChapterSelect, GameManager, CheckpointTransition, MyRoom]
};

let sourceAcademyGame: SourceAcademyGame;
export const getSourceAcademyGame = () => {
  return sourceAcademyGame;
};

export const createSourceAcademyGame = () => {
  sourceAcademyGame = new SourceAcademyGame(config);
};
