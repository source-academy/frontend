import { HexColor } from '../../utils/StyleUtils';
import { BitmapFontStyle } from '../../commons/CommonTypes';
import { alienCowsFont } from '../../commons/CommonFontAssets';

export const transitionTextStyle: BitmapFontStyle = {
  key: alienCowsFont.key,
  size: 80,
  fill: HexColor.lightBlue,
  align: Phaser.GameObjects.BitmapText.ALIGN_CENTER
};

const tweenDuration = 1500;

const checkpointConstants = {
  chapterText: 'Chapter completed.',
  checkpointText: 'Checkpoint reached.',
  tweenDuration: tweenDuration,
  entryTween: {
    alpha: 1,
    duration: tweenDuration,
    ease: 'Power2'
  },
  exitTween: {
    alpha: 0,
    duration: tweenDuration,
    ease: 'Power2'
  }
};

export default checkpointConstants;
