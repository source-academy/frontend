import { DialogueLine, DialogueObject } from './GameDialogueTypes';

export default class DialogueGenerator {
  private currPart: string;
  private currLineNum: number;
  private dialogueContent: DialogueObject;

  public constructor(dialogueContent: DialogueObject) {
    this.dialogueContent = dialogueContent;
    this.currPart = dialogueContent.keys().next().value;
    this.currLineNum = 0;
  }

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
}
