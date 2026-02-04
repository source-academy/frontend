import { Constants, screenCenter, screenSize } from '../commons/CommonConstants';
import { IBaseScene } from '../commons/CommonTypes';
import { Layer } from '../layer/GameLayerTypes';
import { sleep } from '../utils/GameUtils';
import { HexColor } from '../utils/StyleUtils';

/**
 * Generates a tween configuration for making objects fade out of scene.
 *
 * @param targets - an array of game objects that you want to fade out
 * @param duration - the duration of the fade animation
 * @returns {Phaser.Types.Tweens.TweenDataConfig} - the tween config for the fadeout animation
 */
export const fadeOut = (
  targets: Phaser.GameObjects.GameObject[],
  duration = Constants.fadeDuration
) => ({
  alpha: 0,
  targets,
  duration,
  ease: 'Power2'
});

/**
 * Generates a tween configuration for making objects fade into scene.
 * Make sure the alpha of object is set to zero first.
 *
 * @param targets - an array of game objects that you want to fade in
 * @param duration - the duration of the fade animation
 * @returns {Phaser.Types.Tweens.TweenDataConfig} - the tween config for the fadein animation
 */
export const fadeIn = (
  targets: Phaser.GameObjects.GameObject[],
  duration = Constants.fadeDuration
) => ({
  alpha: 1,
  targets,
  duration,
  ease: 'Power2'
});

/**
 * Props to specify additional properties/configuration for a fade animation
 * @prop fadeDuration - how long to fade in and out
 */
type FadeProps = {
  fadeDuration?: number;
};

/**
 * Function that makes a game object fade out, and after the animation,
 * removes the game object from the scene.
 *
 * @param scene - scene where this should happen
 * @param object - the game object that should fade out and be destroyed
 * @param fadeProps - additional properties/configuration describing the fade animation
 */
export function fadeAndDestroy(
  scene: Phaser.Scene,
  object: Phaser.GameObjects.GameObject | null,
  { fadeDuration }: FadeProps = {}
) {
  if (!object) return;
  scene.add.tween(fadeOut([object], fadeDuration || Constants.fadeDuration));
  setTimeout(() => object.destroy(), fadeDuration || Constants.fadeDuration);
}

/**
 * A black screen that can be used in fade effects
 *
 * @param scene - the scene to add this screen to
 */
export function blackScreen(scene: Phaser.Scene) {
  return new Phaser.GameObjects.Rectangle(
    scene,
    screenCenter.x,
    screenCenter.y,
    screenSize.x,
    screenSize.y,
    0
  );
}

/**
 * A white screen that can be used in fade effects
 *
 * @param scene - the scene to add this screen to
 */
export function whiteScreen(scene: Phaser.Scene) {
  return new Phaser.GameObjects.Rectangle(
    scene,
    screenCenter.x,
    screenCenter.y,
    screenSize.x,
    screenSize.y,
    HexColor.white
  );
}

/**
 * Transitions two scenes using a black screen
 *
 * @param scene - the scene to add this screen to
 * @param fadeDuration - how long is the fading in and out of the scenes
 * @param delay - how long does the black screen remains on screen
 * @param callback - the function that is called during the transition
 */
export const blackFade = async (
  scene: IBaseScene,
  fadeDuration: number,
  delay: number,
  callback: any
) => {
  const fadeBlack = blackScreen(scene);
  scene.getLayerManager().addToLayer(Layer.Effects, fadeBlack);

  fadeBlack.setAlpha(0);
  scene.tweens.add(fadeIn([fadeBlack], fadeDuration));
  await sleep(fadeDuration);

  await callback();
  await sleep(delay);

  fadeBlack.setAlpha(1);
  scene.tweens.add(fadeOut([fadeBlack], fadeDuration));
  await sleep(fadeDuration);

  fadeBlack.destroy();
};

/**
 * Makes a game object object blink through fade ins and fade outs
 *
 * @param scene - the scene where you want to add this object to
 * @param gameObject - the gameObject which you want to add blinking effect on
 * @returns {() => void} - clearBlink is a function. When called, it stops the blinking.
 */
export function blink(
  scene: Phaser.Scene,
  gameObject: Phaser.GameObjects.Image | Phaser.GameObjects.Container
) {
  let i = 0;
  const blink = setInterval(() => {
    if (i % 2 !== 0) {
      gameObject.setAlpha(0);
      scene.tweens.add(fadeIn([gameObject], 250));
    } else {
      gameObject.setAlpha(1);
      scene.tweens.add(fadeOut([gameObject], 250));
    }
    i++;
  }, 500);
  function clearBlink() {
    i = 0;
    clearInterval(blink);
  }
  return clearBlink;
}
