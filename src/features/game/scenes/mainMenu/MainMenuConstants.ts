import { screenSize, screenCenter } from '../../commons/CommonConstants';
import { BitmapFontStyle } from '../../commons/CommonTypes';
import { HexColor } from '../../utils/StyleUtils';
import FontAssets from '../../assets/FontAssets';

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
    settings: 'Settings'
  },
  buttonYSpace: screenSize.y * 0.5,
  textXOffset: 80,
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
