import { mapByHeader, splitToLines } from './StringUtils';
import { isPartLabel } from '../dialogue/DialogueHelper';
import { DialogueObject } from '../dialogue/DialogueTypes';

// Split to line
export function parseDialogue(text: string): DialogueObject {
  const lines = splitToLines(text);
  return mapByHeader(lines, isPartLabel);
}
