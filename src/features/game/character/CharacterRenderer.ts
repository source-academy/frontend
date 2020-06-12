import { fadeIn, fadeAndDestroy } from '../effects/FadeEffect';
import { resize } from '../utils/SpriteUtils';
import { avatarKey } from '../parser/DialogueHelper';
import { screenSize, Constants } from '../commons/CommonConstants';
import { SpeakerDetail } from '../dialogue/DialogueTypes';

const avatarX = 350;
const avatarY = 800;
const avatarHeight = screenSize.y * 0.4;

export function CharacterManager(scene: Phaser.Scene) {
  let avatar: Phaser.GameObjects.Image | null;
  const container = new Phaser.GameObjects.Container(scene, 0, 0, []);

  const changeSpeaker = (speakerDetail: SpeakerDetail | null) => {
    if (!speakerDetail) return;
    fadeAndDestroy(scene, avatar);
    avatar = createAvatar(scene, speakerDetail);
    avatar && container.add(avatar);
  };
  return [changeSpeaker];
}

export function createAvatar(scene: Phaser.Scene, speakerDetail: SpeakerDetail) {
  const [speaker, expression] = speakerDetail;
  if (speaker === 'narrator') return null;

  const avatar = new Phaser.GameObjects.Image(
    scene,
    avatarX,
    avatarY,
    avatarKey(speaker, expression)
  )
    .setAlpha(0)
    .setOrigin(0.5, 1);

  resize(avatar, 0, avatarHeight);
  scene.add.tween(fadeIn([avatar], Constants.fadeDuration));
  return avatar;
}
