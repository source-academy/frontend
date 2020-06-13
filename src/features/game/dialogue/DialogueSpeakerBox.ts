import { SpeakerDetail } from './DialogueTypes';
import { Color } from '../utils/styles';
import { speechBox } from '../commons/CommonAssets';
import { caps } from './DialogueHelper';

const textPadding = 10;

const speakerRect = {
  x: 220,
  y: 750,
  width: 300,
  height: 50
};

const speakerTextStyle = {
  fontFamily: 'Arial',
  fontSize: '36px',
  fill: Color.white,
  align: 'left',
  lineSpacing: 10
};

type SpeakerChangeFn = (speakerDetail: SpeakerDetail | null) => void;

export function DialogueSpeakerBox(
  scene: Phaser.Scene
): [Phaser.GameObjects.Container, SpeakerChangeFn] {
  const container = new Phaser.GameObjects.Container(scene, 0, 0);

  const rectangle = new Phaser.GameObjects.Image(scene, speakerRect.x, speakerRect.y, speechBox.key)
    .setDisplaySize(speakerRect.width, speakerRect.height)
    .setAlpha(0.8);

  const speakerText = new Phaser.GameObjects.Text(
    scene,
    speakerRect.x + textPadding,
    speakerRect.y + textPadding,
    '',
    speakerTextStyle
  ).setOrigin(0.5);

  container.add([rectangle, speakerText]);

  function changeSpeaker(speakerDetail: SpeakerDetail | null) {
    if (!speakerDetail) {
      return;
    }
    speakerText.text = caps(speakerDetail[0]);
  }

  return [container, changeSpeaker];
}
