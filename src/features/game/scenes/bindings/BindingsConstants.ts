import FontAssets from '../../assets/FontAssets';
import { screenCenter } from '../../commons/CommonConstants';
import { BitmapFontStyle } from '../../commons/CommonTypes';
import { HexColor } from '../../utils/StyleUtils';

export const BindingConstants = {
  keyTextConfig: { x: screenCenter.x - 100, y: 0, oriX: 0.5, oriY: 0.5 },
  keyDescTextConfig: { x: screenCenter.x + 100, y: 0, oriX: 0.5, oriY: 0.5 },
  key: { yStart: screenCenter.y * 0.9, yInterval: 150 },
  icon: { x: screenCenter.x - 100 }
};

export const keyStyle: BitmapFontStyle = {
  key: FontAssets.zektonFont.key,
  size: 30,
  fill: HexColor.lightBlue,
  align: Phaser.GameObjects.BitmapText.ALIGN_CENTER
};

export const keyDescStyle: BitmapFontStyle = {
  key: FontAssets.zektonFont.key,
  size: 25,
  fill: HexColor.lightBlue,
  align: Phaser.GameObjects.BitmapText.ALIGN_CENTER
};
