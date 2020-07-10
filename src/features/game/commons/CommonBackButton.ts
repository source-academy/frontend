import { screenCenter } from './CommonConstants';
import { HexColor } from '../utils/StyleUtils';
import { BitmapFontStyle } from './CommonTypes';
import ImageAssets from '../assets/ImageAssets';
import FontAssets from '../assets/FontAssets';
import { createButton } from '../utils/ButtonUtils';
import GameSoundManager from '../sound/GameSoundManager';

const backText = 'Back';
const backTextYPos = -screenCenter.y * 0.975;
const backButtonStyle: BitmapFontStyle = {
  key: FontAssets.zektonFont.key,
  size: 25,
  fill: HexColor.darkBlue,
  align: Phaser.GameObjects.BitmapText.ALIGN_CENTER
};

class CommonBackButton extends Phaser.GameObjects.Container {
  constructor(
    scene: Phaser.Scene,
    callback: any,
    x?: number,
    y?: number,
    soundManager?: GameSoundManager
  ) {
    super(scene, x, y);
    this.renderBackButton(callback, soundManager);
  }

  private renderBackButton(callback: any, soundManager?: GameSoundManager) {
    const backButton = createButton(
      this.scene,
      {
        assetKey: ImageAssets.topButton.key,
        message: backText,
        textConfig: { x: 0, y: backTextYPos, oriX: 0.5, oriY: 0.25 },
        bitMapTextStyle: backButtonStyle,
        onUp: callback
      },
      soundManager
    ).setPosition(screenCenter.x, screenCenter.y);
    this.add(backButton);
  }
}

export default CommonBackButton;
