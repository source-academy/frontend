import { DialogueLine, Dialogue } from './GameDialogueTypes';

// Generates next line in dialogue based on Dialogue Object
function dialogueGenerator(dialogue: Dialogue) {
  const { content, startPart } = dialogue;
  let currPart = startPart;
  let currLineNum = 0;
  function generateDialogue(): DialogueLine {
    // Get line
    const line = content.get(currPart)![currLineNum];

    if (!line) {
      return { line: '' };
    }

    // Advance pointer for next line
    if (line.goto) {
      if (content.get(line.goto)) {
        currPart = line.goto;
        currLineNum = 0;
      } else {
        return { line: '' };
      }
    } else {
      currLineNum++;
    }

    return line;
  }
  return generateDialogue;
}

export default dialogueGenerator;
