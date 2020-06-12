import { isSpeaker, avatarKey, avatarAssetPath, getSpeakerDetails } from './DialogueHelper';
import { splitToLines } from './StringUtils';

export function loadDialogueAssetsFromText(scene: Phaser.Scene, text: string) {
  splitToLines(text)
    .filter(isSpeaker)
    .forEach(line => loadAvatar(scene, line));
}

const loadAvatar = (scene: Phaser.Scene, line: string) => {
  const [speaker, expression] = getSpeakerDetails(line);
  scene.load.image(avatarKey(speaker, expression), avatarAssetPath(speaker, expression));
};
