import FontAssets from '../../assets/FontAssets';
import { screenSize } from '../../commons/CommonConstants';
import { BitmapFontStyle } from '../../commons/CommonTypes';

export const talkButtonStyle: BitmapFontStyle = {
  key: FontAssets.zektonFont.key,
  size: 30,
  align: Phaser.GameObjects.BitmapText.ALIGN_CENTER
};

const TalkModeConstants = {
  button: { ySpace: screenSize.y * 0.7 }
};

export default TalkModeConstants;
