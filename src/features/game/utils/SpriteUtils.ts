/**
 * Resize a displayed object to given width and height
 * if both dimensions are specified.
 *
 * If either one of width or height is zero/undefined,
 * then only the given dimension will be used to scale the image
 * proportionally according to aspect-ratio
 *
 * @param obj object to be resized
 * @param width desired width of object
 * @param height desired height of object
 */
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

/**
 * Resize the obj display size such that the shorter side fits
 * the width/height i.e. the other dimension will overflow.
 *
 * @param obj obj to be resized
 * @param width width
 * @param height height
 */
export function resizeOverflow(
  obj: Phaser.GameObjects.Image | Phaser.GameObjects.Rectangle,
  width: number,
  height: number
) {
  if (obj.displayWidth > obj.displayHeight) {
    resize(obj, 0, height);
  } else {
    resize(obj, width);
  }
}

/**
 * Resize the obj display size such that the longer side fits
 * the width/height i.e. the other dimension will underflow.
 *
 * @param obj obj to be resized
 * @param width width
 * @param height height
 */
export function resizeUnderflow(
  obj: Phaser.GameObjects.Image | Phaser.GameObjects.Rectangle,
  width: number,
  height: number
) {
  if (obj.displayWidth > obj.displayHeight) {
    resize(obj, width);
  } else {
    resize(obj, 0, height);
  }
}

/**
 * Multiplies sprite dimension by factor
 *
 * @param obj obj to be resized
 * @param factor number of times to multiply the object's width and height by.
 */
export function multiplyDimensions(
  obj: Phaser.GameObjects.Image | Phaser.GameObjects.Rectangle,
  factor: number
) {
  obj.displayWidth *= factor;
  obj.displayHeight *= factor;
}
