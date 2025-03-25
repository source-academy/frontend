import GameActionConditionChecker from '../action/GameActionConditionChecker';
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
    this.currPart = dialogueContent.keys().next().value || '';
    this.currLineNum = 0;
  }

  /**
   * @returns {Promise<DialogueLine>} returns the dialgoueLine that is played next,
   * based on what is dictated by the dialogueContent
   */
  public async generateNextLine(): Promise<DialogueLine> {
    const dialogueLine = this.dialogueContent.get(this.currPart)![this.currLineNum];
    if (!dialogueLine || !dialogueLine.line) {
      return { line: '' };
    }

    if (dialogueLine.goto) {
      let currPart: string | null = dialogueLine.goto.part;
      const conditionCheck = await GameActionConditionChecker.checkAllConditionsSatisfied(
        dialogueLine.goto.conditions
      );
      if (!conditionCheck) {
        currPart = dialogueLine.goto.altPart;
      }

      if (!currPart) {
        this.currLineNum++;
      } else if (this.dialogueContent.get(currPart)) {
        this.currPart = currPart;
        this.currLineNum = 0;
      } else {
        return { line: '' };
      }
    } else {
      this.currLineNum++;
    }
    return dialogueLine;
  }

  /**
   * @param goto new PartName to change currPart to
   */
  public updateCurrPart(goto: PartName) {
    this.currPart = goto;
    this.currLineNum = 0;
  }
}
