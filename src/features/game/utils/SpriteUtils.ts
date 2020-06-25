export function resize(
  obj: Phaser.GameObjects.Image | Phaser.GameObjects.Rectangle,
  width: number,
  height?: number
) {
  const ratio = obj.displayHeight / obj.displayWidth;
  if (!width) {
    obj.displayWidth = height! / ratio;
    obj.displayHeight = height!;
  } else {
    obj.displayWidth = width;
    obj.displayHeight = height || width * ratio;
  }
}

export function resizeSquare(
  obj: Phaser.GameObjects.Image | Phaser.GameObjects.Rectangle,
  width: number,
  height?: number
) {
  obj.displayWidth = width;
  obj.displayHeight = height || width;
}

export function multiplyDimensions(
  obj: Phaser.GameObjects.Image | Phaser.GameObjects.Rectangle,
  factor: number
) {
  obj.displayWidth *= factor;
  obj.displayHeight *= factor;
}
