import { screenSize, GameImage, GameButton } from '../../commons/CommonsTypes';

export const talkButtonYSpace = screenSize.y * 0.7;

export const talkEntryTweenProps = {
  y: 0,
  duration: 800,
  ease: 'Power2'
};

export const talkExitTweenProps = {
  y: -screenSize.y,
  duration: 500,
  ease: 'Power2'
};

export const talkButtonStyle = {
  fontFamily: 'Helvetica',
  fontSize: '35px',
  fill: '#abd4c6'
};

export const talkOptButton: GameImage = {
  key: 'talk-opt-button',
  path: '../assets/talkOptButton.png',
  xPos: screenSize.x / 2,
  yPos: screenSize.y / 2,
  imageWidth: screenSize.x,
  imageHeight: screenSize.y
};

export const talkOptCheck: GameImage = {
  key: 'talk-opt-check',
  path: '../assets/talkOptCheck.png',
  xPos: screenSize.x / 2,
  yPos: screenSize.y / 2,
  imageWidth: screenSize.x,
  imageHeight: screenSize.y
};

const talkUIAssets = [talkOptButton, talkOptCheck];

export enum TalkButtonType {
  Dialogue = 'Dialogue',
  Other = 'Other'
}

export type TalkButton = GameButton & {
  type: TalkButtonType;
};

export default talkUIAssets;
