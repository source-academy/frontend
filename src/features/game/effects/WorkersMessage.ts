import { Constants, screenCenter } from '../commons/CommonConstants';
import { ILayeredScene } from '../commons/CommonTypes';
import { Layer } from '../layer/GameLayerTypes';
import { sleep } from '../utils/GameUtils';
import { calcListFormatPos } from '../utils/StyleUtils';
import { blackScreen, fadeAndDestroy, fadeIn } from './FadeEffect';
import { addGlitchText } from './Glitch';

const workerALines = [
  'Clang. Thud. One hit to the wall, one hit to my flesh.',
  'They told me I was to be the pillar of this',
  'spaceship - who knew they meant it literally?',
  '- A. Halim'
];

const workerTLines = [
  'I blink synchronously with the screen;',
  'I breathe as the machine steams on and off.',
  '',
  'Behind this closed space, as my very blood fuels',
  'these engines - waiting for you to find me.',
  '- T. S. Chong'
];

const WorkerConstants = {
  yInterval: 80,
  messageDuration: 5000
};

export function showWorkerAMessage(scene: ILayeredScene) {
  showLines(scene, workerALines);
}

export function showWorkerTMessage(scene: ILayeredScene) {
  showLines(scene, workerTLines);
}

async function showLines(scene: ILayeredScene, lines: string[]) {
  const container = new Phaser.GameObjects.Container(scene, 0, 0);
  const blackOverlay = blackScreen(scene);

  container.add(blackOverlay);
  scene.getLayerManager().addToLayer(Layer.Effects, container);
  scene.add.tween(fadeIn([container], Constants.fadeDuration * 2));

  const linesPos = calcListFormatPos({
    numOfItems: lines.length,
    xSpacing: 0,
    ySpacing: WorkerConstants.yInterval
  });

  await sleep(Constants.fadeDuration * 2);

  const textConfig = { x: screenCenter.x, y: 0, oriX: 0.5, oriY: 0.5 };
  const yStartPos = screenCenter.y - lines.length * WorkerConstants.yInterval * 0.5;

  lines.forEach((line, index) => {
    const textFrames = addGlitchText(scene, line, {
      ...textConfig,
      y: linesPos[index][1] + yStartPos
    });
    setTimeout(() => textFrames.forEach(frame => frame.destroy()), WorkerConstants.messageDuration);
  });

  await sleep(WorkerConstants.messageDuration);

  fadeAndDestroy(scene, container);
}
