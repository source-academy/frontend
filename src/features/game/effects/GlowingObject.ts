import { resize } from '../utils/SpriteUtils';
import { HexColor } from '../utils/StyleUtils';
import { blink } from './FadeEffect';

/**
 * Augments the Phaser.GameObjects.Image to enable glow effect
 * for an image. Glow effect enables an image to blink with a tint of yellow
 *
 * This is for the make_object_glow action
 */
export default class GlowingImage {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private imageGlow: Phaser.GameObjects.Image;
  private clickArea: Phaser.GameObjects.Image;
  private glowClearer?: () => void;

  /**
   * Constructor for a GlowingImage
   *
   * @param scene - the scene in which to add this object to
   * @param x - the x coordinate of the center of the object
   * @param y - the y coordinate of the center of the object
   * @param assetKey - the asset key of the image to render this object
   * @param width - optional display width of the object
   * @param height - optional displayheight of the object
   */
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
    const image = new Phaser.GameObjects.Image(scene, 0, 0, assetKey);
    this.imageGlow = new Phaser.GameObjects.Image(scene, 0, 0, assetKey)
      .setAlpha(0)
      .setTint(HexColor.yellow);
    this.clickArea = new Phaser.GameObjects.Image(scene, 0, 0, assetKey)
      .setAlpha(0.01)
      .setInteractive({ pixelPerfect: true });

    if (width) {
      resize(image, width, height);
      resize(this.imageGlow, width, height);
      resize(this.clickArea, width, height);
    }

    this.container.add([image, this.imageGlow, this.clickArea]);
  }

  public startGlow() {
    this.imageGlow.setAlpha(1);
    this.glowClearer && this.glowClearer();
    this.glowClearer = blink(this.scene, this.imageGlow);
  }

  public clearGlow() {
    this.imageGlow.setAlpha(0);
    this.glowClearer && this.glowClearer();
  }

  public getContainer() {
    return this.container;
  }

  public getClickArea() {
    return this.clickArea;
  }
}
