import { mapByHeader, stripEnclosingChars, splitToLines, splitByChar } from './ParserHelper';
import { GameChapter } from '../chapter/GameChapterTypes';
import { GameItemTypeDetails } from '../location/GameMapConstants';
import { DialogueLine, Dialogue } from '../dialogue/GameDialogueTypes';
import { mapValues } from '../utils/GameUtils';
import ActionParser from './ActionParser';
import { SpeakerDetail, CharacterPosition } from '../character/GameCharacterTypes';

export default function DialogueParser(
  chapter: GameChapter,
  fileName: string,
  fileContent: string
) {
  // Parse locations per dialogue
  if (fileName === 'dialogueLocation') {
    splitToLines(fileContent).forEach(line => {
      const [locationId, dialogueIds] = line.split(': ');

      dialogueIds.split(', ').forEach(dialogueId => {
        if (dialogueId[0] === '+') {
          chapter.map.setItemAt(locationId, GameItemTypeDetails.Dialogue, dialogueId.slice(1));
        }
      });
    });
    return;
  }

  const lines = splitToLines(fileContent);
  const [titleWithLabel, ...restOfLines] = lines;
  const [, title] = splitByChar(titleWithLabel, ':');
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
    const rawStr = lines[currLinePointer];
    switch (true) {
      case isGotoLabel(rawStr):
        dialogueLines[dialogueLines.length - 1].goto = stripEnclosingChars(rawStr);
        break;
      case isActionLabel(rawStr):
        dialogueLines[dialogueLines.length - 1].actions = ActionParser(rawStr.slice(1));
        break;
      case isSpeaker(rawStr):
        currLinePointer++;
        const nextLine = lines[currLinePointer];
        if (!nextLine) {
          throw new Error('Parsing error: Cannot change speaker without next line');
        }
        dialogueLines.push({ line: nextLine });
        dialogueLines[dialogueLines.length - 1].speakerDetail = parserSpeaker(rawStr);
        break;
      default:
        dialogueLines.push({ line: rawStr });
        break;
    }
    currLinePointer++;
  }

  return dialogueLines;
}

function parserSpeaker(rawStr: string): SpeakerDetail {
  const [speakerId, expression, speakerPositionStr] = splitByChar(rawStr.slice(1), ',');
  const speakerPosition = characterPositionMap[speakerPositionStr];

  return {
    speakerId,
    expression,
    speakerPosition
  };
}

export const characterPositionMap = {
  left: CharacterPosition.Left,
  middle: CharacterPosition.Middle,
  right: CharacterPosition.Right
};

export const isActionLabel = (line: string) => line && line[0] === '#';
export const isPartLabel = (line: string) => new RegExp(/\[part[0-9]+\]/).test(line);
export const isGotoLabel = (line: string) => new RegExp(/\[Goto part[0-9]+\]/).test(line);
export const getPartToJump = (line: string) => line.match(/\[Goto (part[0-9]+)\]/)![1];
export const isSpeaker = (line: string) => line && line[0] === '$';
