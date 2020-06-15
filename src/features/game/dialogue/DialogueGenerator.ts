import { DialogueLine, Dialogue } from './GameDialogueTypes';

// Generates next line in dialogue based on Dialogue Object
function dialogueGenerator(dialogue: Dialogue) {
  const { content } = dialogue;

  // first item in the map
  let currPart = content.keys().next().value;
  let currLineNum = 0;

  function generateDialogue(): DialogueLine {
    // Get line
    const dialogueLine = content.get(currPart)![currLineNum];

    if (!dialogueLine.line) {
      return { line: '' };
    }

    // Advance pointer for next line
    if (dialogueLine.goto) {
      if (content.get(dialogueLine.goto)) {
        currPart = dialogueLine.goto;
        currLineNum = 0;
      } else {
        return { line: '' };
      }
    } else {
      currLineNum++;
    }

    return dialogueLine;
  }
  return generateDialogue;
}

export default dialogueGenerator;
