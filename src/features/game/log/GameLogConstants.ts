import FontAssets from '../assets/FontAssets';
import { screenCenter, screenSize } from '../commons/CommonConstants';
import { BitmapFontStyle } from '../commons/CommonTypes';
import { GamePosition } from '../commons/CommonTypes';
import { DialogueLine } from '../dialogue/GameDialogueTypes';

export const headerTextStyle: BitmapFontStyle = {
  key: FontAssets.zektonFont.key,
  size: 50,
  align: Phaser.GameObjects.BitmapText.ALIGN_CENTER
};

export const logTextStyle: BitmapFontStyle = {
  key: FontAssets.zektonFont.key,
  size: 25,
  align: Phaser.GameObjects.BitmapText.ALIGN_LEFT
};

export const LogMocks: DialogueLine[] = [
  {
    line: 'Testing...',
    speakerDetail: {
      speakerId: 'scottie',
      expression: '',
      speakerPosition: GamePosition.Middle
    }
  },
  {
    line: 'Testing...',
    speakerDetail: {
      speakerId: 'pixel',
      expression: '',
      speakerPosition: GamePosition.Middle
    }
  }
];

const LogConstants = {
  headerTextConfig: { x: screenSize.x * 0.44, y: screenCenter.y * 0.25, oriX: 0.0, oriY: 0.5 },
  logTextConfig: { x: screenSize.x * 0.1, oriX: 0.0, oriY: 0.5 }
};

export default LogConstants;
