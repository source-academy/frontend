import { GameObject } from './types';
import { Constants as c } from './constants';
import { PhaserScene } from './extendedPhaser';

export const fadeOut = (targets: GameObject[], duration: number) => ({
  alpha: 0,
  targets,
  duration
});
export const fadeIn = (targets: GameObject[], duration: number) => ({
  alpha: 1,
  targets,
  duration
});

export function fadeAndDestroy(scene: PhaserScene, object: GameObject) {
  scene.add.tween(fadeOut([object], c.fadeDuration));
  setTimeout(() => object.destroy(), c.fadeDuration);
}
