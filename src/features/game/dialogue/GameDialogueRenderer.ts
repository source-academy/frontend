import GameActionManager from '../action/GameActionManager';
import { createDialogueBox, createTypewriter } from './GameDialogueHelper';
import { diamond } from '../commons/CommonAssets';
import GameManager from '../scenes/gameManager/GameManager';
import { screenSize } from '../commons/CommonConstants';
import { diamondSize, diamondPadding } from './DialogueConstants';
import { blink, fadeAndDestroy } from '../effects/FadeEffect';

class DialogueRenderer {
  private typewriter: any;
  private dialogueBox: Phaser.GameObjects.Image;
  private blinkingDiamond: any;

  constructor(typewriterStyle: Phaser.Types.GameObjects.Text.TextStyle) {
    const gameManager = GameActionManager.getInstance().getGameManager();
    this.dialogueBox = createDialogueBox(gameManager).setInteractive({
      useHandCursor: true,
      pixelPerfect: true
    });
    this.typewriter = createTypewriter(gameManager, typewriterStyle);
    this.blinkingDiamond = this.drawDiamond(gameManager);
  }

  public getDialogueContainer() {
    const gameManager = GameActionManager.getInstance().getGameManager();
    const container = new Phaser.GameObjects.Container(gameManager, 0, 0).setAlpha(0);
    container.add([this.dialogueBox, this.blinkingDiamond.container, this.typewriter.container]);
    return container;
  }

  private drawDiamond(gameManager: GameManager) {
    const diamondSprite = new Phaser.GameObjects.Image(
      gameManager,
      screenSize.x - diamondSize.x - diamondPadding.x,
      screenSize.y - diamondSize.y - diamondPadding.y,
      diamond.key
    ).setDisplaySize(diamondSize.x, diamondSize.y);

    return { container: diamondSprite, clearBlink: blink(gameManager, diamondSprite) };
  }

  public getDialogueBox() {
    return this.dialogueBox;
  }

  public destroy() {
    const gameManager = GameActionManager.getInstance().getGameManager();
    this.blinkingDiamond.clearBlink();
    this.getDialogueBox().off(Phaser.Input.Events.GAMEOBJECT_POINTER_UP);
    fadeAndDestroy(gameManager, this.getDialogueContainer());
  }

  public changeText(message: string) {
    this.typewriter.changeLine(message);
  }
}

export default DialogueRenderer;
