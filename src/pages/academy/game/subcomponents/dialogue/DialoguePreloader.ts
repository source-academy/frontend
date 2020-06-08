import { PhaserScene } from '../utils/extendedPhaser';
import { isSpeaker, avatarKey, avatarAssetPath, getSpeakerDetails } from './DialogueHelper';

export function preloadDialogue(scene: PhaserScene, text: string) {
  text
    .split('\n')
    .map(line => line.trim())
    .filter(line => line !== '')
    .filter(isSpeaker)
    .forEach(loadAvatar(scene));
}

const loadAvatar = (scene: PhaserScene) => (line: string) => {
  const [speaker, expression] = getSpeakerDetails(line);
  scene.load.image(avatarKey(speaker, expression), avatarAssetPath(speaker, expression));
};
