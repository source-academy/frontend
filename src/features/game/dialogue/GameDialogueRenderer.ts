import GameGlobalAPI from '../scenes/gameManager/GameGlobalAPI';
import { createDialogueBox, createTypewriter } from './GameDialogueHelper';
import GameManager from '../scenes/gameManager/GameManager';
import { screenSize } from '../commons/CommonConstants';
import dialogueConstants from './GameDialogueConstants';
import { blink, fadeAndDestroy } from '../effects/FadeEffect';
import ImageAssets from '../assets/ImageAssets';

class DialogueRenderer {
  private typewriter: any;
  private dialogueBox: Phaser.GameObjects.Image;
  private blinkingDiamond: any;

  constructor(typewriterStyle: Phaser.Types.GameObjects.Text.TextStyle) {
    const gameManager = GameGlobalAPI.getInstance().getGameManager();
    this.dialogueBox = createDialogueBox(gameManager).setInteractive({
      useHandCursor: true,
      pixelPerfect: true
    });
    this.typewriter = createTypewriter(gameManager, typewriterStyle);
    this.blinkingDiamond = this.drawDiamond(gameManager);
  }

  public getDialogueContainer() {
    const gameManager = GameGlobalAPI.getInstance().getGameManager();
    const container = new Phaser.GameObjects.Container(gameManager, 0, 0).setAlpha(0);
    container.add([this.dialogueBox, this.blinkingDiamond.container, this.typewriter.container]);
    return container;
  }

  private drawDiamond(gameManager: GameManager) {
    const diamondSprite = new Phaser.GameObjects.Image(
      gameManager,
      screenSize.x - dialogueConstants.promptSize.x - dialogueConstants.promptPadding.x,
      screenSize.y - dialogueConstants.promptSize.y - dialogueConstants.promptPadding.y,
      ImageAssets.diamond.key
    ).setDisplaySize(dialogueConstants.promptSize.x, dialogueConstants.promptSize.y);

    return { container: diamondSprite, clearBlink: blink(gameManager, diamondSprite) };
  }

  public getDialogueBox() {
    return this.dialogueBox;
  }

  public destroy() {
    const gameManager = GameGlobalAPI.getInstance().getGameManager();
    this.blinkingDiamond.clearBlink();
    this.getDialogueBox().off(Phaser.Input.Events.GAMEOBJECT_POINTER_UP);
    fadeAndDestroy(gameManager, this.getDialogueContainer());
  }

  public changeText(message: string) {
    this.typewriter.changeLine(message);
  }
}

export default DialogueRenderer;
