import { GameButton, ImageAsset } from '../../commons/CommonsTypes';
import { screenSize } from '../../commons/CommonConstants';

export const talkButtonYSpace = screenSize.y * 0.7;

export const talkButtonStyle = {
  fontFamily: 'Helvetica',
  fontSize: '35px',
  fill: '#abd4c6'
};

export const talkOptButton: ImageAsset = {
  key: 'talk-opt-button',
  path: '../assets/talkOptButton.png'
};

export const talkOptCheck: ImageAsset = {
  key: 'talk-opt-check',
  path: '../assets/talkOptCheck.png'
};

export const dialogueBox: ImageAsset = {
  key: 'speechBox',
  path: '../assets/speechbox.png'
};

export enum TalkButtonType {
  Dialogue = 'Dialogue',
  Other = 'Other'
}

export type TalkButton = GameButton & {
  type: TalkButtonType;
};

const talkUIAssets = [talkOptButton, talkOptCheck, dialogueBox];

export default talkUIAssets;
