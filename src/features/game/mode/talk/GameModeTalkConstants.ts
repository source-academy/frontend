import { screenSize } from '../../commons/CommonConstants';
import { BitmapFontStyle } from '../../commons/CommonTypes';
import { zektonFont } from '../../commons/CommonFontAssets';
import { HexColor } from '../../utils/StyleUtils';

export const talkButtonYSpace = screenSize.y * 0.7;

export const talkButtonStyle: BitmapFontStyle = {
  key: zektonFont.key,
  size: 35,
  fill: HexColor.lightBlue,
  align: Phaser.GameObjects.BitmapText.ALIGN_CENTER
};
