import GameActionManager from '../action/GameActionManager';
import { createDialogueBox, createTypewriter } from './GameDialogueHelper';

class DialogueRenderer {
  private typewriter: any;
  private dialogueBox: Phaser.GameObjects.Image;

  constructor(typewriterStyle: Phaser.Types.GameObjects.Text.TextStyle) {
    const gameManager = GameActionManager.getInstance().getGameManager();
    this.dialogueBox = createDialogueBox(gameManager);
    this.typewriter = createTypewriter(gameManager, typewriterStyle);
  }

  public getDialogueContainer() {
    const gameManager = GameActionManager.getInstance().getGameManager();
    const container = new Phaser.GameObjects.Container(gameManager, 0, 0).setAlpha(0);
    container.add([this.dialogueBox, this.typewriter.container]);
    return container;
  }

  public getDialogueBox() {
    return this.dialogueBox;
  }

  public changeText(message: string) {
    this.typewriter.changeLine(message);
  }
}

export default DialogueRenderer;
