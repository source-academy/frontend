import { isSpeaker, avatarKey, avatarAssetPath, getSpeakerDetails } from './DialogueHelper';
import { Constants as c } from '../utils/constants';

export async function preloadDialogue(scene: Phaser.Scene, url: string) {
  scene.load.text('dialogueText', url);
  scene.load.image('speechBox', c.speechBoxPath);
  scene.load.audio('typeSound', c.typeSoundPath);
  scene.load.once('filecomplete', (key: string) => loadAssets(scene, key));
}

function loadAssets(scene: Phaser.Scene, key: string) {
  if (key !== 'dialogueText') return;
  const text = scene.cache.text.get('dialogueText');
  text
    .split('\n')
    .map((line: string) => line.trim())
    .filter((line: string) => line !== '')
    .filter(isSpeaker)
    .forEach(loadAvatar(scene));
}

const loadAvatar = (scene: Phaser.Scene) => (line: string) => {
  const [speaker, expression] = getSpeakerDetails(line);
  scene.load.image(avatarKey(speaker, expression), avatarAssetPath(speaker, expression));
};
