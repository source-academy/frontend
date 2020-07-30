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

const MainMenuConstants = {
  text: {
    chapterSelect: 'Play Chapter',
    studentRoom: 'Go to My Room',
    awards: 'Awards Hall',
    settings: 'Settings',
    bindings: 'Key Bindings'
  },
  button: { ySpace: screenSize.y * 0.5 },
  buttonTextConfig: { x: 600, y: 0, oriX: 1.0, oriY: 0.1 },
  banner: { xHide: bannerHide },
  onFocusTween: {
    x: screenCenter.x + bannerShow,
    duration: 200,
    ease: 'Power2'
  },
  outFocusTween: {
    x: screenCenter.x + bannerHide,
    duration: 200,
    ease: 'Power2'
  }
};

export default MainMenuConstants;
