export const scrollEntry = (targets: Phaser.GameObjects.GameObject[], duration = 500) => ({
  scaleY: 1,
  targets,
  duration,
  ease: 'Power1'
});

export const scrollExit = (targets: Phaser.GameObjects.GameObject[], duration = 500) => ({
  scaleY: 0,
  targets,
  duration,
  ease: 'Power1'
});
