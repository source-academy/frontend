import FontAssets from '../../assets/FontAssets';
import { screenCenter, screenSize } from '../../commons/CommonConstants';
import { BitmapFontStyle } from '../../commons/CommonTypes';
import { HexColor } from '../../utils/StyleUtils';

export const mainMenuStyle: BitmapFontStyle = {
  key: FontAssets.zektonFont.key,
  size: 30,
  fill: HexColor.lightBlue,
  align: Phaser.GameObjects.BitmapText.ALIGN_RIGHT
};

const bannerShow = 200;
const bannerHide = 300;

const mainMenuConstants = {
  optionsText: {
    chapterSelect: 'Play Chapter',
    studentRoom: 'Go to My Room',
    awards: 'Awards Hall',
    settings: 'Settings',
    bindings: 'Key Bindings'
  },
  buttonYSpace: screenSize.y * 0.5,
  optXOffset: 80,
  textXOffset: 600,
  bannerHide: bannerHide,
  bannerShow: bannerShow,
  onFocusOptTween: {
    x: screenCenter.x + bannerShow,
    duration: 200,
    ease: 'Power2'
  },
  outFocusOptTween: {
    x: screenCenter.x + bannerHide,
    duration: 200,
    ease: 'Power2'
  }
};

export default mainMenuConstants;
