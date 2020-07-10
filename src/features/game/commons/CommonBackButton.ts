import { screenCenter, screenSize } from './CommonConstants';
import { HexColor } from '../utils/StyleUtils';
import { BitmapFontStyle } from './CommonTypes';
import { zektonFont } from './CommonFontAssets';
import { createBitmapText } from '../utils/TextUtils';
import ImageAssets from '../assets/ImageAssets';

const backText = 'Back';
const backTextYPos = screenSize.y * 0.012;
const backButtonStyle: BitmapFontStyle = {
  key: zektonFont.key,
  size: 25,
  fill: HexColor.darkBlue,
  align: Phaser.GameObjects.BitmapText.ALIGN_CENTER
};

class CommonBackButton extends Phaser.GameObjects.Container {
  constructor(scene: Phaser.Scene, callback: any, x?: number, y?: number) {
    super(scene, x, y);
    this.renderBackButton(callback);
  }

  private renderBackButton(callback: any) {
    const backButtonText = createBitmapText(
      this.scene,
      backText,
      screenCenter.x,
      backTextYPos,
      backButtonStyle
    ).setOrigin(0.5, 0.25);

    const backButtonSprite = new Phaser.GameObjects.Sprite(
      this.scene,
      screenCenter.x,
      screenCenter.y,
      ImageAssets.topButton.key
    );

    backButtonSprite.setInteractive({ pixelPerfect: true, useHandCursor: true });
    backButtonSprite.addListener(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, callback);

    this.add(backButtonSprite);
    this.add(backButtonText);
  }
}

export default CommonBackButton;
