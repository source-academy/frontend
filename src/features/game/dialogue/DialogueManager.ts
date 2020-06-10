import { Keys as k } from '../commons/CommonConstants';
import {
  isPartLabel,
  isGotoLabel,
  getPartToJump,
  isSpeaker,
  getSpeakerDetails,
  showDialogueError
} from './DialogueHelper';
import { DialogueObject, SpeakerDetail, DialogueString } from './DialogueTypes';
import { hasDevAccess } from '../utils/GameAccess';
import { splitToLines, mapByHeader } from '../utils/StringUtils';

// Split to line
export function parseDialogue(text: string): DialogueObject {
  const lines = splitToLines(text);
  return mapByHeader(lines, isPartLabel);
}

// Generates next line in dialogue based on Dialogue Object
export function dialogueGenerator(dialogueObject: DialogueObject) {
  let currPartNum = k.initialPart;
  let currLineNum = -1;
  function generateDialogue(): [SpeakerDetail | null, DialogueString] {
    try {
      currLineNum++;
      let line = dialogueObject[currPartNum][currLineNum];
      let speakerDetail = null;

      if (isGotoLabel(line)) {
        currPartNum = getPartToJump(line);
        currLineNum = 0;
        line = dialogueObject[currPartNum][currLineNum];
      }
      if (isSpeaker(line)) {
        speakerDetail = getSpeakerDetails(line);
        currLineNum++;
        line = dialogueObject[currPartNum][currLineNum];
      }

      return [speakerDetail, line];
    } catch (e) {
      if (hasDevAccess()) {
        showDialogueError(currPartNum, currLineNum);
      }
      return [null, ''];
    }
  }
  return generateDialogue;
}
