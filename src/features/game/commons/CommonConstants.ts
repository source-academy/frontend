import { Links } from 'src/commons/utils/Constants';

import FontAssets from '../assets/FontAssets';

export const Constants = {
  assetsFolder: Links.sourceAcademyAssets,
  fadeDuration: 600,
  nullFunction: () => {},
  nullInteractionId: '',
  nullSequenceNumber: -1,
  popUpDuration: 1000,
  defaultAssetPath: '/ui/wristDeviceButton.png',
  defaultFontStyle: {
    key: FontAssets.zektonFont.key,
    size: 30,
    align: Phaser.GameObjects.BitmapText.ALIGN_CENTER
  },
  defaultCursor: ''
};

export const screenSize = {
  x: 1920,
  y: 1080
};

export const screenCenter = {
  x: screenSize.x / 2,
  y: screenSize.y / 2
};

export const keyboardShortcuts = {
  dashboard: Phaser.Input.Keyboard.KeyCodes.TAB,
  escapeMenu: Phaser.Input.Keyboard.KeyCodes.ESC,
  nextDialogue: Phaser.Input.Keyboard.KeyCodes.SPACE,
  dissolveNotification: Phaser.Input.Keyboard.KeyCodes.SPACE,
  explore: Phaser.Input.Keyboard.KeyCodes.E,
  move: Phaser.Input.Keyboard.KeyCodes.V,
  talk: Phaser.Input.Keyboard.KeyCodes.T,
  options: [
    Phaser.Input.Keyboard.KeyCodes.ONE,
    Phaser.Input.Keyboard.KeyCodes.TWO,
    Phaser.Input.Keyboard.KeyCodes.THREE,
    Phaser.Input.Keyboard.KeyCodes.FOUR
  ]
}
