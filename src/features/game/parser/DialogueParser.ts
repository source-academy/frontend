import { mapByHeader, stripEnclosingChars, splitToLines } from './ParserHelper';
import { GameChapter } from '../chapter/GameChapterTypes';
import { GameItemTypeDetails } from '../location/GameMapConstants';
import { DialogueLine, Dialogue } from '../dialogue/GameDialogueTypes';
import { mapValues } from '../utils/GameUtils';
import ActionParser from './ActionParser';

export default function DialogueParser(
  chapter: GameChapter,
  fileName: string,
  fileContent: string
) {
  if (fileName === 'dialogueLocation') {
    splitToLines(fileContent).forEach(line => {
      const [locationId, dialogueIds] = line.split(': ');

      dialogueIds.split(', ').forEach(dialogueId => {
        chapter.map.setItemAt(locationId, GameItemTypeDetails.Dialogue, dialogueId);
      });
    });
    return;
  }

  const lines = splitToLines(fileContent);
  const [titleWithLabel, ...restOfLines] = lines;
  const [, title] = titleWithLabel.split(': ');
  const dialogueId = fileName;

  const partToRawDialogueLines = mapByHeader(restOfLines, isPartLabel);
  const dialogueObject = mapValues(partToRawDialogueLines, createDialogueLines);
  const dialogue: Dialogue = { title: title, content: dialogueObject };

  chapter.map.addItemToMap(GameItemTypeDetails.Dialogue, dialogueId, dialogue);
}

function createDialogueLines(lines: string[]): DialogueLine[] {
  const dialogueLines: DialogueLine[] = [];

  let currLinePointer = 0;

  while (currLinePointer !== lines.length) {
    const line = lines[currLinePointer];
    switch (true) {
      case isGotoLabel(line):
        if (!dialogueLines.length) {
          dialogueLines.push({ line: '' });
        }
        const partToGoTo = stripEnclosingChars(line);
        dialogueLines[dialogueLines.length - 1].goto = partToGoTo;
        break;
      case isActionLabel(line):
        if (!dialogueLines.length) {
          dialogueLines.push({ line: '' });
        }
        const action = stripEnclosingChars(line);
        dialogueLines[dialogueLines.length - 1].actions = ActionParser(action);
        break;
      case isSpeaker(line):
        break;
      default:
        dialogueLines.push({ line: line });
        break;
    }
    currLinePointer++;
  }
  console.log(dialogueLines);

  return dialogueLines;
}

export const isActionLabel = (line: string) => line && line[0] === '#';
export const isPartLabel = (line: string) => new RegExp(/\[part[0-9]+\]/).test(line);
export const isGotoLabel = (line: string) => new RegExp(/\[Goto part[0-9]+\]/).test(line);
export const getPartToJump = (line: string) => line.match(/\[Goto (part[0-9]+)\]/)![1];
export const isSpeaker = (line: string) => line && line[0] === '$';
