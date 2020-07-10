import { BitmapFontStyle } from '../commons/CommonTypes';
import { HexColor } from '../utils/StyleUtils';
import FontAssets from '../assets/FontAssets';

export const SampleUserState = {
  collectibles: ['cookies', 'rat'],
  achievements: ['trophy', 'coolbeans guy']
};

export const emptyUserState = {
  collectibles: [],
  assessments: []
};

export const userStateStyle: BitmapFontStyle = {
  key: FontAssets.zektonFont.key,
  size: 35,
  fill: HexColor.lightBlue,
  align: Phaser.GameObjects.BitmapText.ALIGN_CENTER
};
