import FontAssets from '../assets/FontAssets';
import ImageAssets from '../assets/ImageAssets';
import GameSoundManager from '../sound/GameSoundManager';
import { createButton } from '../utils/ButtonUtils';
import { HexColor } from '../utils/StyleUtils';
import { screenCenter } from './CommonConstants';
import { BitmapFontStyle } from './CommonTypes';

const backText = 'Back';
const backTextYPos = -screenCenter.y * 0.975;
const backButtonStyle: BitmapFontStyle = {
  key: FontAssets.zektonFont.key,
  size: 25,
  fill: HexColor.darkBlue,
  align: Phaser.GameObjects.BitmapText.ALIGN_CENTER
};

/**
 * This class renders the back button onto the scene.
 * @scene scene to render on
 * @callback onUp specifies what happens when button is clicked
 * @x x coordinate of button
 * @y y coordinate of button
 * @soundManager reference to soundManager to play sounds when clicked
 */
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
