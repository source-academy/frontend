import { HexColor } from '../../utils/StyleUtils';
import { BitmapFontStyle } from '../../commons/CommonTypes';
import { alienCowsFont } from '../../commons/CommonFontAssets';

export const chapterTransitionText = 'Chapter completed.';
export const checkpointTransitionText = 'Checkpoint reached.';

export const transitionTextStyle: BitmapFontStyle = {
  key: alienCowsFont.key,
  size: 80,
  fill: HexColor.lightBlue,
  align: Phaser.GameObjects.BitmapText.ALIGN_CENTER
};

export const transitionDuration = 1500;

export const transitionEntryTween = {
  alpha: 1,
  duration: transitionDuration,
  ease: 'Power2'
};

export const transitionExitTween = {
  alpha: 0,
  duration: transitionDuration,
  ease: 'Power2'
};
