import { GameImage, screenSize, longButton } from '../../commons/CommonsTypes';

export const backText = 'Back';
export const moveButtonYSpace = screenSize.y * 0.8;
export const moveButtonXPos = screenSize.x * 0.75;
export const previewFrameXPos = screenSize.x * 0.3;
export const previewWidth = screenSize.x * 0.473;
export const previewHeight = screenSize.y * 0.56;
export const previewXPos = screenSize.x * 0.3125;
export const previewYPos = screenSize.y * 0.515;

export const moveEntryTweenProps = {
  y: 0,
  duration: 800,
  ease: 'Power2'
};

export const moveExitTweenProps = {
  y: -screenSize.y,
  duration: 500,
  ease: 'Power2'
};

export const moveButtonStyle = {
  fontFamily: 'Helvetica',
  fontSize: '35px',
  fill: '#abd4c6'
};

export const defaultLocationImg: GameImage = {
  key: 'loc-default',
  path: '../assets/defaultLocation.jpg',
  xPos: screenSize.x / 2,
  yPos: screenSize.y / 2,
  imageWidth: screenSize.x,
  imageHeight: screenSize.y
};

export const locationPreviewFrame: GameImage = {
  key: 'loc-preview-frame',
  path: '../assets/locationPreviewFrame.png',
  xPos: screenSize.x / 2,
  yPos: screenSize.y / 2,
  imageWidth: screenSize.x,
  imageHeight: screenSize.y
};

export const locationPreviewFill: GameImage = {
  key: 'loc-preview-fill',
  path: '../assets/locationPreviewFill.png',
  xPos: screenSize.x / 2,
  yPos: screenSize.y / 2,
  imageWidth: screenSize.x,
  imageHeight: screenSize.y
};

const moveUIAssets = [defaultLocationImg, longButton, locationPreviewFrame, locationPreviewFill];

export default moveUIAssets;
