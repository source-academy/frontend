export function resize(obj: Phaser.GameObjects.Image, width: number, height?: number) {
  const ratio = obj.displayHeight / obj.displayWidth;
  if (!width) {
    obj.displayWidth = height! / ratio;
    obj.displayHeight = height!;
    return obj;
  } else {
    obj.displayWidth = width;
    obj.displayHeight = height || width * ratio;
    return obj;
  }
}

export function resizeRect(obj: Phaser.GameObjects.Rectangle, width: number, height?: number) {
  const ratio = obj.displayHeight / obj.displayWidth;
  if (!width) {
    obj.displayWidth = height! / ratio;
    obj.displayHeight = height!;
    return obj;
  } else {
    obj.displayWidth = width;
    obj.displayHeight = height || width * ratio;
    return obj;
  }
}

export function resizeSquare(obj: Phaser.GameObjects.Image, width: number, height?: number) {
  obj.displayWidth = width;
  obj.displayHeight = height || width;
  return obj;
}

export function multiplyDimensions(
  obj: Phaser.GameObjects.Image | Phaser.GameObjects.Rectangle,
  factor: number
) {
  obj.displayWidth *= factor;
  obj.displayHeight *= factor;
}
