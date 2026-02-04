/**
 * Generates a tween configuration for making objects open like a scroll,
 * ie stretch open downwards from zero-height to full height.
 *
 * @param targets - an array of game objects that you want to enter via scroll effect
 * @param duration - the duration of the scroll animation
 * @returns {Phaser.Types.Tweens.TweenDataConfig} - the tween config for the scroll in animation
 */
export const scrollEntry = (targets: Phaser.GameObjects.GameObject[], duration = 500) => ({
  scaleY: 1,
  targets,
  duration,
  ease: 'Power1'
});

/**
 * Generates a tween configuration for making objects close like a scroll,
 * ie compress upwards from full height to zero height
 *
 * @param targets - an array of game objects that you want to exit via scroll effect
 * @param duration - the duration of the fascrollde animation
 * @returns {Phaser.Types.Tweens.TweenDataConfig} - the tween config for the scroll in animation
 */
export const scrollExit = (targets: Phaser.GameObjects.GameObject[], duration = 500) => ({
  scaleY: 0,
  targets,
  duration,
  ease: 'Power1'
});
