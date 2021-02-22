import FontAssets from '../assets/FontAssets';
import ImageAssets from '../assets/ImageAssets';
import { createButton } from '../utils/ButtonUtils';
import { screenCenter } from './CommonConstants';
import { BitmapFontStyle } from './CommonTypes';

const backText = 'Back';
const backTextYPos = -screenCenter.y * 0.975;
const backButtonStyle: BitmapFontStyle = {
  key: FontAssets.zektonDarkFont.key,
  size: 25,
  align: Phaser.GameObjects.BitmapText.ALIGN_CENTER
};

/**
 * A container that is a back button that is located
 * at the top, center of the screen.
 *
 * The style and colours are fixed.
 * It is not recommended to change the position of the container.
 */
class CommonBackButton extends Phaser.GameObjects.Container {
  /**
   * @param scene scene for the button to be attached to
   * @param callback callback to be executed on onClick
   */
  constructor(scene: Phaser.Scene, callback: any) {
    super(scene, 0, 0);
    this.renderBackButton(callback);
  }

  private renderBackButton(callback: any) {
    const backButton = createButton(this.scene, {
      assetKey: ImageAssets.topButton.key,
      message: backText,
      textConfig: { x: 0, y: backTextYPos, oriX: 0.5, oriY: 0.25 },
      bitMapTextStyle: backButtonStyle,
      onUp: callback
    }).setPosition(screenCenter.x, screenCenter.y);
    this.add(backButton);
  }
}

export default CommonBackButton;
