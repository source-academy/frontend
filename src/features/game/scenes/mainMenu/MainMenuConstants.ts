import { screenSize, screenCenter } from '../../commons/CommonConstants';

const playText = 'Play';
const continueText = 'Continue';
const studentRoomText = 'Go to My Room';
const chapterSelectText = 'Select Chapter';

export const optionsText = {
  play: playText,
  continue: continueText,
  chapterSelect: chapterSelectText,
  studentRoom: studentRoomText
};

export const mainMenuYSpace = screenSize.y * 0.7;
export const textXOffset = 80;

export const bannerHide = 300;
export const bannerShow = 200;

export const mainMenuStyle = {
  fontFamily: 'Helvetica',
  fontSize: '35px',
  fill: '#abd4c6'
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
