import { Keys as k } from '../utils/constants';
import {
  isPartLabel,
  isGotoLabel,
  getPartToJump,
  isSpeaker,
  getSpeakerDetails,
  strip
} from './DialogueHelper';
import { DialogueObject, SpeakerDetail, DialogueString } from './DialogueTypes';

export function parseDialogue(text: string) {
  const dialogueObject = {};
  var currPart = '';
  text
    .split('\n')
    .map(line => line.trim())
    .filter(line => line !== '')
    .forEach(message => {
      if (isPartLabel(message)) {
        currPart = strip(message);
        dialogueObject[currPart] = [];
      } else {
        dialogueObject[currPart].push(message);
      }
    });
  return dialogueObject;
}

export function dialogueGenerator(dialogueObject: DialogueObject) {
  let currPartNum = k.initialPart;
  let currLineNum = -1;
  function generateDialogue(): [SpeakerDetail | null, DialogueString] {
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
  }
  return generateDialogue;
}
