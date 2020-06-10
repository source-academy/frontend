import { Constants as c } from './constants';

type GameObject = Phaser.GameObjects.GameObject | Phaser.GameObjects.Text;

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

export function fadeAndDestroy(scene: Phaser.Scene, object: GameObject | null) {
  if (!object) return;
  scene.add.tween(fadeOut([object], c.fadeDuration));
  setTimeout(() => object.destroy(), c.fadeDuration);
}
