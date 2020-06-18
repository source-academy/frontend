import * as Phaser from 'phaser';
import { screenSize } from '../../../../features/game/commons/CommonConstants';
import { AssetKey } from 'src/features/game/commons/CommonsTypes';
import MainMenu from 'src/features/game/scenes/mainMenu/MainMenu';
import ChapterSelect from 'src/features/game/scenes/chapterSelect/ChapterSelect';
import GameManager from 'src/features/game/scenes/gameManager/GameManager';
// import ChapterSelect from 'src/features/game/scenes/chapterSelect/ChapterSelect';
// import MainMenu from 'src/features/game/scenes/mainMenu/MainMenu';
// import GameManager from 'src/features/game/scenes/gameManager/GameManager';

export type AccountInfo = {
  accessToken: string;
  refreshToken: string;
};

type GlobalGameProps = {
  currBgMusicKey: AssetKey | undefined;
  accountInfo: AccountInfo | undefined;
};

class SourceAcademyGame extends Phaser.Game {
  protected global: GlobalGameProps;

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
    return this.global.accountInfo;
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
  scene: [MainMenu, ChapterSelect, GameManager]
};

const phaserGame = new SourceAcademyGame(config);

export default phaserGame;
