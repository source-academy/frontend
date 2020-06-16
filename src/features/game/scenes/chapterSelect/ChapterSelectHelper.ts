import { imageRect, blackTintAlpha, chapterSelectStyle, imageDist } from './ChapterSelectConstants';
import ChapterSelect from './ChapterSelect';
import { fadeOut } from '../../effects/FadeEffect';
import { screenCenter, Constants } from 'src/features/game/commons/CommonConstants';
import { ChapterDetail } from './ChapterSelectTypes';

export function createChapter(
  scene: ChapterSelect,
  { title, fileName }: ChapterDetail,
  index: number
) {
  const [x, y] = getCoorByChapter(index);
  const image = new Phaser.GameObjects.Image(scene, 0, 0, `chapterImage${index}`).setDisplaySize(
    imageRect.width,
    imageRect.height
  );
  const blackTint = new Phaser.GameObjects.Rectangle(
    scene,
    0,
    0,
    imageRect.width,
    imageRect.height,
    0
  ).setAlpha(blackTintAlpha);

  const chapterText = `Chapter ${index}\n${title}`;
  const text = new Phaser.GameObjects.Text(scene, 0, 0, chapterText, chapterSelectStyle).setOrigin(
    0.5
  );
  const container = new Phaser.GameObjects.Container(scene, x, y, [image, blackTint, text]);
  container.setSize(imageRect.width, imageRect.height);
  container.setInteractive({
    useHandCursor: true
  });

  container.on('pointerover', () => {
    scene.add.tween(fadeOut([blackTint], Constants.fadeDuration * 2));
  });

  container.on('pointerout', () => {
    scene.add.tween({
      alpha: blackTintAlpha,
      targets: blackTint,
      duration: Constants.fadeDuration * 2
    });
  });

  container.on('pointerdown', () => {
    scene.loadFile(fileName);
  });

  return container;
}

export function getCoorByChapter(chapterNum: number) {
  const x = screenCenter.x + imageDist * chapterNum;
  const y = screenCenter.y;
  return [x, y];
}
