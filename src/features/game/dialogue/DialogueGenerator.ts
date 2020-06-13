import {
  isGotoLabel,
  getPartToJump,
  isSpeaker,
  getSpeakerDetails,
  showDialogueError
} from '../dialogue/DialogueHelper';
import { DialogueObject, SpeakerDetail, DialogueString } from './DialogueTypes';
import { hasDevAccess } from '../utils/GameAccess';

// Generates next line in dialogue based on Dialogue Object
export function DialogueGenerator(dialogueObject: DialogueObject) {
  let currPartNum = 'part0';
  let currLineNum = -1;
  function generateDialogue(): [SpeakerDetail | null, DialogueString] {
    try {
      currLineNum++;
      let line = dialogueObject.get(currPartNum)![currLineNum];
      let speakerDetail = null;

      if (isGotoLabel(line)) {
        currPartNum = getPartToJump(line);
        currLineNum = 0;
        line = dialogueObject.get(currPartNum)![currLineNum];
      }
      if (isSpeaker(line)) {
        speakerDetail = getSpeakerDetails(line);
        currLineNum++;
        line = dialogueObject.get(currPartNum)![currLineNum];
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
