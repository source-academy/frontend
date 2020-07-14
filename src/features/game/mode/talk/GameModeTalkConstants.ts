import FontAssets from '../../assets/FontAssets';
import { screenSize } from '../../commons/CommonConstants';
import { BitmapFontStyle } from '../../commons/CommonTypes';
import { HexColor } from '../../utils/StyleUtils';

export const talkButtonYSpace = screenSize.y * 0.7;

export const talkButtonStyle: BitmapFontStyle = {
  key: FontAssets.zektonFont.key,
  size: 30,
  fill: HexColor.lightBlue,
  align: Phaser.GameObjects.BitmapText.ALIGN_CENTER
};
