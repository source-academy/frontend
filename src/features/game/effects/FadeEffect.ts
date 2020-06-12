import GameManager from 'src/pages/academy/game/subcomponents/GameManager';
import { Layer } from '../layer/LayerTypes';
import { sleep } from '../utils/GameUtils';
import { screenSize, screenCenter, Constants } from '../commons/CommonConstants';

export const fadeOut = (targets: Phaser.GameObjects.GameObject[], duration: number) => ({
  alpha: 0,
  targets,
  duration,
  ease: 'Power2'
});

export const fadeIn = (targets: Phaser.GameObjects.GameObject[], duration: number) => ({
  alpha: 1,
  targets,
  duration,
  ease: 'Power2'
});

type FadeProps = {
  fadeDuration?: number;
};

export function fadeAndDestroy(
  scene: Phaser.Scene,
  object: Phaser.GameObjects.GameObject | null,
  { fadeDuration }: FadeProps = {}
) {
  if (!object) return;
  scene.add.tween(fadeOut([object], fadeDuration || Constants.fadeDuration));
  setTimeout(() => object.destroy(), fadeDuration || Constants.fadeDuration);
}

function blackScreen(scene: Phaser.Scene) {
  return new Phaser.GameObjects.Rectangle(
    scene,
    screenCenter.x,
    screenCenter.y,
    screenSize.x,
    screenSize.y,
    0
  );
}

export function blackFadeIn(gameManager: GameManager, { fadeDuration }: FadeProps = {}) {
  const fadeBlack = blackScreen(gameManager);
  gameManager.layerManager.addToLayer(Layer.Effects, fadeBlack);
  fadeAndDestroy(gameManager, fadeBlack, { fadeDuration });
}

export const blackFade = async (
  gameManager: GameManager,
  fadeDuration: number,
  delay: number,
  callback: any
) => {
  const fadeBlack = blackScreen(gameManager);
  gameManager.layerManager.addToLayer(Layer.Effects, fadeBlack);

  fadeBlack.setAlpha(0);
  gameManager.tweens.add(fadeIn([fadeBlack], fadeDuration));
  await sleep(fadeDuration);

  callback();
  await sleep(delay);

  fadeBlack.setAlpha(1);
  gameManager.tweens.add(fadeOut([fadeBlack], fadeDuration));
  await sleep(fadeDuration);

  fadeBlack.destroy();
};
