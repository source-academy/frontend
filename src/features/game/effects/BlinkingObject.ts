import { blink } from './FadeEffect';
import { hex, Color } from '../utils/StyleUtils';
import { resize } from '../utils/SpriteUtils';

export class BlinkingObject {
  private container: Phaser.GameObjects.Container;
  private image: Phaser.GameObjects.Image;
  private imageGlow: Phaser.GameObjects.Image;
  private scene: Phaser.Scene;
  private blinkClearer?: () => void;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    assetKey: string,
    width?: number,
    height?: number
  ) {
    this.scene = scene;
    this.container = new Phaser.GameObjects.Container(scene, x, y);
    this.image = new Phaser.GameObjects.Image(scene, 0, 0, assetKey).setInteractive();
    this.imageGlow = new Phaser.GameObjects.Image(scene, 0, 0, assetKey)
      .setAlpha(0)
      .setInteractive();

    this.imageGlow.setTint(hex(Color.yellow));
    if (width) {
      resize(this.image, width, height);
      resize(this.imageGlow, width, height);
    }

    this.container.add([this.image, this.imageGlow]);
  }

  public startBlink() {
    this.imageGlow.setAlpha(1);
    this.blinkClearer && this.blinkClearer();
    this.blinkClearer = blink(this.scene, this.imageGlow);
  }

  public clearBlink() {
    this.imageGlow.setAlpha(0);
    this.blinkClearer && this.blinkClearer();
  }

  public getContainer() {
    return this.container;
  }

  public setOnClick(onClick: () => Promise<void> | void) {
    [this.image, this.imageGlow].forEach(image => image.on('pointerup', onClick));
  }

  public setOnHover(onHover: () => void) {
    [this.image, this.imageGlow].forEach(image => image.on('pointerover', onHover));
  }

  public setOnPointerout(onPointerout: () => void) {
    [this.image, this.imageGlow].forEach(image => image.on('pointerout', onPointerout));
  }

  public disable() {
    [this.image, this.imageGlow].forEach(image => {
      image.off('pointerup');
      image.off('pointerover');
      image.off('pointerout');
    });
  }
}
