import { Constants, screenCenter } from '../commons/CommonConstants';
import { ILayeredScene } from '../commons/CommonTypes';
import { Layer } from '../layer/GameLayerTypes';
import { sleep } from '../utils/GameUtils';
import { calcListFormatPos } from '../utils/StyleUtils';
import { blackScreen, fadeAndDestroy, fadeIn } from './FadeEffect';
import { addGlitchText } from './Glitch';

const workerALines = [
  'Clang. Thud. One hit to the wall, one hit to my flesh.',
  '',
  'They told me I was to be the pillar of this',
  'spaceship - who knew they meant it literally?',
  '- A. Halim'
];

const workerTLines = [
  'I blink synchronously with the screen;',
  'I breathe as the machine steams on and off.',
  '',
  'Behind this closed space, my very blood fuels',
  'these engines - hoping for you to find me.',
  '- T. C. Sia'
];

const WorkerConstants = {
  yInterval: 80,
  messageDuration: 5000
};

export function putWorkerMessage(
  scene: ILayeredScene,
  workerId: string,
  x: number,
  y: number,
  width: number = 50,
  height: number = 50
) {
  const rect = new Phaser.GameObjects.Rectangle(scene, x, y, width, height, 0, 0);
  const lines = workerId === 'A' ? workerALines : workerTLines;

  rect.setInteractive({ useHandCursor: true });
  rect.addListener(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => showLines(scene, lines));

  scene.getLayerManager().addToLayer(Layer.UI, rect);
}

async function showLines(scene: ILayeredScene, lines: string[]) {
  const blackOverlay = blackScreen(scene).setInteractive().setAlpha(0);

  const linesPos = calcListFormatPos({
    numOfItems: lines.length,
    xSpacing: 0,
    ySpacing: WorkerConstants.yInterval
  });

  const textConfig = { x: screenCenter.x, y: 0, oriX: 0.5, oriY: 0.5 };
  const yStartPos = screenCenter.y - lines.length * WorkerConstants.yInterval * 0.5;

  scene.getLayerManager().addToLayer(Layer.Effects, blackOverlay);
  scene.add.tween(fadeIn([blackOverlay], Constants.fadeDuration));

  await sleep(Constants.fadeDuration);

  lines.forEach((line, index) => {
    const textFrames = addGlitchText(scene, line, {
      ...textConfig,
      y: linesPos[index][1] + yStartPos
    });
    setTimeout(() => textFrames.forEach(frame => frame.destroy()), WorkerConstants.messageDuration);
  });

  await sleep(WorkerConstants.messageDuration);

  fadeAndDestroy(scene, blackOverlay);
}
