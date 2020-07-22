import { Dialogue, DialogueLine, PartName } from '../dialogue/GameDialogueTypes';
import { GameItemType } from '../location/GameMapTypes';
import { mapValues } from '../utils/GameUtils';
import StringUtils from '../utils/StringUtils';
import ActionParser from './ActionParser';
import Parser from './Parser';
import SpeakerParser from './SpeakerParser';

/**
 * This class parses dialogues and creates
 * Dialogue Objects which can be read by the
 * Dialogue Generator
 */
export default class DialogueParser {
  /**
   * This function reads the entire text under the "dialogue" heading,
   * converts dialogues listed underneath into Dialogue entities,
   * and stores these dialogues in the game map.
   *
   * @param dialogueText the entire dialogue text beneath Dialogue
   */
  public static parse(dialogueText: string[]) {
    const dialoguesParagraphs = StringUtils.splitToParagraph(dialogueText);

    dialoguesParagraphs.forEach(([dialogueDetails, dialogueBody]: [string, string[]]) => {
      if (dialogueBody.length === 0) {
        console.error('No dialogue found for dialogueId');
        return;
      }
      this.parseDialogue(dialogueDetails, dialogueBody);
    });
  }

  /**
   * This function parses one dialogue and stores it into the game map
   *
   * @param dialogueDetails the string containing dialogue Id and/or dialouge title
   * @param dialogueBody the body of the dialogue containing its contents
   */
  private static parseDialogue(dialogueDetails: string, dialogueBody: string[]) {
    const [dialogueId, title] = StringUtils.splitByChar(dialogueDetails, ',', 1);
    const content = this.parseDialogueContent(dialogueBody);
    const dialogue: Dialogue = { title, content };

    // Add fallback title
    if (!dialogue.title) {
      dialogue.title = StringUtils.toCapitalizedWords(dialogueId);
    }

    Parser.checkpoint.map.setItemInMap(GameItemType.dialogues, dialogueId, dialogue);
  }

  /**
   * This function parses the dialogue's body and
   * converts each into a Dialogue object.
   *
   * This function's main task is to separate a dialogue into
   * parts (or part if just one), and then uses  createDialogueLines to parse each part.
   *
   * @param dialogueBody The entire dialogue body
   */
  private static parseDialogueContent(dialogueBody: string[]) {
    const rawDialogueContent: Map<PartName, string[]> = StringUtils.mapByHeader(
      dialogueBody,
      isInteger
    );

    const dialogueObject: Map<PartName, DialogueLine[]> = mapValues(
      rawDialogueContent,
      this.createDialogueLines
    );
    return dialogueObject;
  }

  /**
   * This function parses one "part" of a dialogue,
   * and converts them into a series of DialogueLine's,
   * where DialogueLine encapsulates data on the text,
   * (as well as speaker change, actions and gotos if any)
   *
   * @param {Array<string>} lines the lines inside one part of a dialogue
   * @returns {Array<DialogueLine>}
   */
  private static createDialogueLines(lines: string[]): DialogueLine[] {
    const dialogueLines: DialogueLine[] = [];
    let currIndex = 0;

    while (currIndex !== lines.length) {
      const rawStr = lines[currIndex];
      switch (true) {
        case isGotoLabel(rawStr):
          dialogueLines[dialogueLines.length - 1].goto = rawStr.split(' ')[1];
          break;
        case isActionLabel(rawStr):
          const lastLine = dialogueLines[dialogueLines.length - 1];
          !lastLine.actionIds && (lastLine.actionIds = []);
          lastLine.actionIds.push(ActionParser.parseAction(rawStr));
          break;
        case isSpeaker(rawStr):
          currIndex++;
          const nextLine = lines[currIndex];
          if (!nextLine) {
            throw new Error('Parsing error: Cannot change speaker without next line');
          }
          dialogueLines.push({ line: nextLine });
          dialogueLines[dialogueLines.length - 1].speakerDetail = SpeakerParser.parse(rawStr);
          break;
        default:
          dialogueLines.push({ line: rawStr });
          break;
      }
      currIndex++;
    }
    return dialogueLines;
  }
}

const isInteger = (line: string) => new RegExp(/^[0-9]+$/).test(line);
const isGotoLabel = (line: string) => new RegExp(/^goto [0-9]+$/).test(line);
const isActionLabel = (line: string) => line && (line[0] === '\t' || line.slice(0, 4) === '    ');
const isSpeaker = (line: string) => line && line[0] === '@';
