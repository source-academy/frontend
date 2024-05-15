import * as Phaser from 'phaser';
import { AssetMap, AssetType, ImageAsset } from 'src/features/game/assets/AssetsTypes';
import FontAssets from 'src/features/game/assets/FontAssets';
import { screenSize } from 'src/features/game/commons/CommonConstants';
import { BitmapFontStyle } from 'src/features/game/commons/CommonTypes';

import CheckpointTransition from '../game/scenes/checkpointTransition/CheckpointTransition';
import GameManager from '../game/scenes/gameManager/GameManager';
import GameSimulatorMenu from './GameSimulatorMenu';
import { dateOneYearFromNow } from './GameSimulatorUtils';

export const gameSimulatorConfig: Phaser.Types.Core.GameConfig = {
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
  scene: [GameSimulatorMenu, GameManager, CheckpointTransition]
};

export const gameSimulatorMenuAssets: AssetMap<ImageAsset> = {
  gameSimBg: {
    type: AssetType.Image,
    key: 'student-room',
    path: '/locations/deathCube_ext/shields-down.png'
  },
  shortButton: { type: AssetType.Image, key: 'short-button', path: '/ui/shortButton.png' },
  invertedButton: {
    type: AssetType.Image,
    key: 'inverted-button',
    path: '/ui/invertedColorButton.png'
  },
  blueUnderlay: { type: AssetType.Image, key: 'blue-underlay', path: '/ui/blueUnderlay.png' },
  topButton: { type: AssetType.Image, key: 'top-button', path: '/ui/topButton.png' },
  colorIcon: { type: AssetType.Image, key: 'color-icon', path: '/ui/colorIcon.png' },
  imageIcon: { type: AssetType.Image, key: 'image-icon', path: '/ui/imageIcon.png' },
  bboxIcon: { type: AssetType.Image, key: 'bbox-icon', path: '/ui/bboxIcon.png' },
  handIcon: { type: AssetType.Image, key: 'hand-icon', path: '/ui/handIcon.png' },
  listIcon: { type: AssetType.Image, key: 'list-icon', path: '/ui/listIcon.png' },
  eraseIcon: { type: AssetType.Image, key: 'erase-icon', path: '/ui/eraserIcon.png' },
  iconBg: { type: AssetType.Image, key: 'icon-bg', path: '/ui/modeIconBg.png' }
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
