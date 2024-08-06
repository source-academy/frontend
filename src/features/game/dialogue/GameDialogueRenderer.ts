import ImageAssets from '../assets/ImageAssets';
import { screenSize } from '../commons/CommonConstants';
import { blink, fadeAndDestroy } from '../effects/FadeEffect';
import GameGlobalAPI from '../scenes/gameManager/GameGlobalAPI';
import dialogueConstants from './GameDialogueConstants';
import { createDialogueBox, createTypewriter } from './GameDialogueHelper';

/**
 * Class that manages the appearance of the dialogue box, which includes
 * the box itself, the text animations as well as the blinking diamond click prompt
 */
class DialogueRenderer {
  private typewriter: any;
  private dialogueBox: Phaser.GameObjects.Image;
  private blinkingDiamond: any;

  /**
   * @param typewriterStyle the style of the typewriter you want to use
   */
  constructor(typewriterStyle: Phaser.Types.GameObjects.Text.TextStyle) {
    const gameManager = GameGlobalAPI.getInstance().getGameManager();
    this.dialogueBox = createDialogueBox(gameManager).setInteractive({
      useHandCursor: true,
      pixelPerfect: true
    });
    this.typewriter = createTypewriter(gameManager, typewriterStyle);
    this.blinkingDiamond = this.drawDiamond(gameManager);
  }

  /**
   * @returns {Phaser.GameObjects.Container} returns the entire dialogueBox container
   * which can be added to the scene
   */
  public getDialogueContainer() {
    const gameManager = GameGlobalAPI.getInstance().getGameManager();
    const container = new Phaser.GameObjects.Container(gameManager, 0, 0);
    container.add([this.dialogueBox, this.blinkingDiamond.container, this.typewriter.container]);
    return container;
  }

  private drawDiamond(scene: Phaser.Scene) {
    const diamondSprite = new Phaser.GameObjects.Image(
      scene,
      screenSize.x - dialogueConstants.prompt.x - dialogueConstants.prompt.xPad,
      screenSize.y - dialogueConstants.prompt.y - dialogueConstants.prompt.yPad,
      ImageAssets.diamond.key
    ).setDisplaySize(dialogueConstants.prompt.x, dialogueConstants.prompt.y);

    return { container: diamondSprite, clearBlink: blink(scene, diamondSprite) };
  }

  /**
   * Obtains the green dialogue box
   */
  public getDialogueBox() {
    return this.dialogueBox;
  }

  /**
   * Destroyer for the dialogue box elements and interactivity
   */
  public destroy() {
    const gameManager = GameGlobalAPI.getInstance().getGameManager();
    this.typewriter.clearTyping();
    this.blinkingDiamond.clearBlink();
    this.getDialogueBox().off(Phaser.Input.Events.GAMEOBJECT_POINTER_UP);
    fadeAndDestroy(gameManager, this.getDialogueContainer());
  }

  /**
   * Hide the dialoguebox
   */
  public async hide() {
    this.typewriter.container.setVisible(false);
    this.dialogueBox.setVisible(false);
    this.blinkingDiamond.container.setVisible(false);
  }

  /**
   * Make the dialoguebox visible
   */
  public async show() {
    this.typewriter.container.setVisible(true);
    this.dialogueBox.setVisible(true);
    this.blinkingDiamond.container.setVisible(true);
  }

  /**
   * Change the text written in the box
   */
  public changeText(message: string) {
    this.typewriter.changeLine(message);
  }
}

export default DialogueRenderer;
