import { screenSize, screenCenter } from '../../commons/CommonConstants';
import { BitmapFontStyle } from '../../commons/CommonTypes';
import { zektonFont } from '../../commons/CommonFontAssets';
import { HexColor } from '../../utils/StyleUtils';

const studentRoomText = 'Go to My Room';
const chapterSelectText = 'Play Chapter';
const settingsText = 'Settings';

export const optionsText = {
  chapterSelect: chapterSelectText,
  studentRoom: studentRoomText,
  settings: settingsText
};

export const mainMenuYSpace = screenSize.y * 0.5;
export const textXOffset = 80;

export const bannerHide = 300;
export const bannerShow = 200;

export const mainMenuStyle: BitmapFontStyle = {
  key: zektonFont.key,
  size: 30,
  fill: HexColor.lightBlue,
  align: Phaser.GameObjects.BitmapText.ALIGN_RIGHT
};

export const onFocusOptTween = {
  x: screenCenter.x + bannerShow,
  duration: 200,
  ease: 'Power2'
};

export const outFocusOptTween = {
  x: screenCenter.x + bannerHide,
  duration: 200,
  ease: 'Power2'
};
