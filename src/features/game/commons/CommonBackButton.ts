import { screenCenter, screenSize } from './CommonConstants';
import { topButton } from './CommonAssets';
import { Color } from '../utils/StyleUtils';

const backText = 'Back';
const backTextYPos = screenSize.y * 0.012;
const backButtonStyle = {
  fontFamily: 'Helvetica',
  fontSize: '25px',
  fill: Color.darkBlue
};

class CommonBackButton extends Phaser.GameObjects.Container {
  constructor(scene: Phaser.Scene, callback: any, x?: number, y?: number) {
    super(scene, x, y);
    this.renderBackButton(callback);
  }

  private renderBackButton(callback: any) {
    const backButtonText = new Phaser.GameObjects.Text(
      this.scene,
      screenCenter.x,
      backTextYPos,
      backText,
      backButtonStyle
    ).setOrigin(0.5, 0.25);

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
