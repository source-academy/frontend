import Parser from './Parser';
import StringUtils from '../utils/StringUtils';
import ActionParser from './ActionParser';
import { mapValues } from '../utils/GameUtils';
import { GameLocationAttr } from '../location/GameMapTypes';
import { DialogueLine, Dialogue, PartName } from '../dialogue/GameDialogueTypes';
import SpeakerParser from './SpeakerParser';

export default class DialogueParser {
  public static parse(dialoguesBody: string[]) {
    const dialoguesParagraphs = StringUtils.splitToParagraph(dialoguesBody);

    dialoguesParagraphs.forEach(([dialogueDetails, dialogueBody]: [string, string[]]) => {
      if (dialogueBody.length === 0) {
        console.error('No dialogue found for dialogueId');
        return;
      }
      this.parseDialogue(dialogueDetails, dialogueBody);
    });
  }

  public static parseDialogue(dialogueDetails: string, dialogueBody: string[]) {
    const [dialogueId, title] = StringUtils.splitByChar(dialogueDetails, ',', 1);
    const content = this.parseDialogueContent(dialogueBody);
    const dialogue: Dialogue = { title, content };

    Parser.checkpoint.map.addItemToMap(GameLocationAttr.talkTopics, dialogueId, dialogue);
  }

  public static parseDialogueContent(dialogueBody: string[]) {
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

  public static createDialogueLines(lines: string[]): DialogueLine[] {
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
