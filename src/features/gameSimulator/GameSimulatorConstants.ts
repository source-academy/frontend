import * as Phaser from 'phaser';
import FontAssets from 'src/features/game/assets/FontAssets';
import { screenSize } from 'src/features/game/commons/CommonConstants';
import { BitmapFontStyle } from 'src/features/game/commons/CommonTypes';

import { dateOneYearFromNow } from './GameSimulatorUtils';

export const gameSimulatorConfig = {
  debug: true,
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
  }
};

export const gameSimulatorMenuOptStyle: BitmapFontStyle = {
  key: FontAssets.zektonDarkFont.key,
  size: 35,
  align: Phaser.GameObjects.BitmapText.ALIGN_CENTER
};

export const gameSimulatorMenuConstants = {
  maxOptButtonsRow: 2,
  optButton: { xSpace: screenSize.x * 0.9, ySpace: screenSize.y * 0.5 },
  gameTxtStorageName: {
    defaultChapter: 'defaultChapter',
    checkpointTxt: 'checkpointTxt'
  }
};

export const defaultChapter = {
  id: -1,
  title: '',
  imageUrl: '/locations/spaceshipBackground.png',
  openAt: new Date().toISOString(),
  closeAt: dateOneYearFromNow(new Date()).toISOString(),
  isPublished: false,
  filenames: []
};
