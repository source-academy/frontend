import { createDialogueBox, createTypewriter } from './GameDialogueHelper';
import { diamond } from '../commons/CommonAssets';
import { screenSize } from '../commons/CommonConstants';
import { diamondSize, diamondPadding } from './DialogueConstants';
import { blink, fadeAndDestroy } from '../effects/FadeEffect';

class DialogueRenderer {
  private typewriter: any;
  private dialogueBox: Phaser.GameObjects.Image;
  private blinkingDiamond: any;
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene, typewriterStyle: Phaser.Types.GameObjects.Text.TextStyle) {
    this.scene = scene;
    this.dialogueBox = createDialogueBox(scene).setInteractive({
      useHandCursor: true,
      pixelPerfect: true
    });
    this.typewriter = createTypewriter(scene, typewriterStyle);
    this.blinkingDiamond = this.drawDiamond(scene);
  }

  public getDialogueContainer() {
    const container = new Phaser.GameObjects.Container(this.scene, 0, 0).setAlpha(0);
    container.add([this.dialogueBox, this.blinkingDiamond.container, this.typewriter.container]);
    return container;
  }

  private drawDiamond(scene: Phaser.Scene) {
    const diamondSprite = new Phaser.GameObjects.Image(
      scene,
      screenSize.x - diamondSize.x - diamondPadding.x,
      screenSize.y - diamondSize.y - diamondPadding.y,
      diamond.key
    ).setDisplaySize(diamondSize.x, diamondSize.y);

    return { container: diamondSprite, clearBlink: blink(scene, diamondSprite) };
  }

  public getDialogueBox() {
    return this.dialogueBox;
  }

  public destroy() {
    this.blinkingDiamond.clearBlink();
    this.getDialogueBox().off(Phaser.Input.Events.GAMEOBJECT_POINTER_UP);
    fadeAndDestroy(this.scene, this.getDialogueContainer());
  }

  public changeText(message: string) {
    this.typewriter.changeLine(message);
  }
}

export default DialogueRenderer;
