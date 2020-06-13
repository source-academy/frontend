import { mapByHeader } from './StringUtils';
import { DialogueObject } from '../dialogue/DialogueTypes';

import { splitToLines } from './StringUtils';

// Split to line
export function parseDialogue(text: string): DialogueObject {
  const lines = splitToLines(text);
  return mapByHeader(lines, isPartLabel);
}

export function loadDialogueAssetsFromText(scene: Phaser.Scene, text: string) {
  splitToLines(text)
    .filter(isSpeaker)
    .forEach(line => loadAvatar(scene, line));
}

const loadAvatar = (scene: Phaser.Scene, line: string) => {
  const [speaker, expression] = getSpeakerDetails(line);
  scene.load.image(avatarKey(speaker, expression), avatarAssetPath(speaker, expression));
};
