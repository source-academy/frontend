import SoundAssets from '../assets/SoundAssets';
import { Constants, screenCenter } from '../commons/CommonConstants';
import { ILayeredScene } from '../commons/CommonTypes';
import { Layer } from '../layer/GameLayerTypes';
import SourceAcademyGame from '../SourceAcademyGame';
import { sleep } from '../utils/GameUtils';
import { calcListFormatPos } from '../utils/StyleUtils';
import { blackScreen, fadeAndDestroy, fadeIn } from './FadeEffect';
import { createGlitchBitmapText } from './Glitch';

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
  '- T. S. Chong'
];

const WorkerConstants = {
  yInterval: 80,
  messageDuration: 5000
};

/**
 * Create a hidden interactive box that shows
 * the worker message when interacted with.
 *
 * Also adds it to the scene.
 *
 * @param scene scene for the box to be attached to
 * @param workerId either string 'A' or any other letter, represent which message to show
 * @param x top left hand corner of the hidden box
 * @param y top left hand corner of the hidden box
 * @param width width ot the box
 * @param height height of the box
 */
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

/**
 * Takes array of strings, and format them line by line on the screen.
 * Automatically fade in with a black screen, add glitch effect
 * to the text, followed by fade and destroy of all the objects created.
 *
 * @param scene scene to be attached to
 * @param lines lines to show on the screen, glitched
 */
async function showLines(scene: ILayeredScene, lines: string[]) {
  // Set interactive to block mouse inputs on the screen
  const blackOverlay = blackScreen(scene).setInteractive().setAlpha(0);

  const linesPos = calcListFormatPos({
    numOfItems: lines.length,
    xSpacing: 0,
    ySpacing: WorkerConstants.yInterval
  });

  // Each line has different Y position
  const textConfig = { x: screenCenter.x, y: 0, oriX: 0.5, oriY: 0.5 };
  const yStartPos = screenCenter.y - lines.length * WorkerConstants.yInterval * 0.5;

  scene.getLayerManager().addToLayer(Layer.WorkerMessage, blackOverlay);
  scene.add.tween(fadeIn([blackOverlay], Constants.fadeDuration));

  // Play SFX
  SourceAcademyGame.getInstance().getSoundManager().playSound(SoundAssets.radioStatic.key);

  await sleep(Constants.fadeDuration);

  // Create and add the texts, line by line
  lines.forEach((line, index) => {
    const textFrames = createGlitchBitmapText(scene, line, {
      ...textConfig,
      y: linesPos[index][1] + yStartPos
    });
    textFrames.forEach(frame => scene.getLayerManager().addToLayer(Layer.WorkerMessage, frame));
    setTimeout(() => textFrames.forEach(frame => frame.destroy()), WorkerConstants.messageDuration);
  });

  await sleep(WorkerConstants.messageDuration);

  fadeAndDestroy(scene, blackOverlay);
}
