import { DialogueLine, DialogueObject, PartName } from './GameDialogueTypes';

/**
 * Class for keeping track of which line, action, and speaker has to be shown next
 */
export default class DialogueGenerator {
  private currPart: string;
  private currLineNum: number;
  private dialogueContent: DialogueObject;

  /**
   * @param dialogueContent the dialogue to keep track of and to play
   */
  public constructor(dialogueContent: DialogueObject) {
    this.dialogueContent = dialogueContent;
    this.currPart = dialogueContent.keys().next().value;
    this.currLineNum = 0;
  }

  /**
   * @returns {DialogueLine} returns the dialgoueLine that is played next,
   * based on what is dictated by the dialogueContent
   */
  public generateNextLine(): DialogueLine {
    const dialogueLine = this.dialogueContent.get(this.currPart)![this.currLineNum];
    if (!dialogueLine || !dialogueLine.line) {
      return { line: '' };
    }

    if (dialogueLine.goto) {
      if (this.dialogueContent.get(dialogueLine.goto)) {
        this.currPart = dialogueLine.goto;
        this.currLineNum = 0;
      } else {
        return { line: '' };
      }
    } else {
      this.currLineNum++;
    }
    return dialogueLine;
  }

  public updateGoto(goto: PartName) {
    this.currPart = goto;
    this.currLineNum = 0;
  }
}
