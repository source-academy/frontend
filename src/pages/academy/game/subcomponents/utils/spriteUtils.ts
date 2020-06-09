type Image = Phaser.GameObjects.Image;

export function resize(obj: Image, width: number, height?: number) {
  const ratio = obj.displayHeight / obj.displayWidth;
  obj.displayWidth = width;
  obj.displayHeight = height || width * ratio;
  return obj;
}

export function resizeSquare(obj: Image, width: number, height?: number) {
  obj.displayWidth = width;
  obj.displayHeight = height || width;
  return obj;
}
