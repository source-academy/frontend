import { BitmapFontStyle } from '../commons/CommonTypes';
import { zektonFont } from '../commons/CommonFontAssets';
import { HexColor } from '../utils/StyleUtils';

export const SampleUserState = {
  collectibles: ['cookies', 'rat'],
  achievements: ['trophy', 'coolbeans guy']
};

export const emptyUserState = {
  collectibles: [],
  assessments: []
};

export const userStateStyle: BitmapFontStyle = {
  key: zektonFont.key,
  size: 35,
  fill: HexColor.lightBlue,
  align: Phaser.GameObjects.BitmapText.ALIGN_CENTER
};
