import { screenCenter, screenSize } from './CommonConstants';
import { topButton } from './CommonAssets';
import { HexColor } from '../utils/StyleUtils';
import { BitmapFontStyle } from './CommonTypes';
import { zektonFont } from './CommonFontAssets';

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
    const backButtonText = new Phaser.GameObjects.BitmapText(
      this.scene,
      screenCenter.x,
      backTextYPos,
      backButtonStyle.key,
      backText,
      backButtonStyle.size,
      backButtonStyle.align
    )
      .setTintFill(backButtonStyle.fill)
      .setOrigin(0.5, 0.25);

    const backButtonSprite = new Phaser.GameObjects.Sprite(
      this.scene,
      screenCenter.x,
      screenCenter.y,
      topButton.key
    );

    backButtonSprite.setInteractive({ pixelPerfect: true, useHandCursor: true });
    backButtonSprite.addListener(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, callback);

    this.add(backButtonSprite);
    this.add(backButtonText);
  }
}

export default CommonBackButton;
