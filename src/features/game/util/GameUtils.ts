export function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function resize(img: Phaser.GameObjects.Image, width: number, height?: number) {
  const ratio = img.displayHeight / img.displayWidth;
  if (!width) {
    img.displayWidth = height! / ratio;
    img.displayHeight = height!;
    return img;
  } else {
    img.displayWidth = width;
    img.displayHeight = height || width * ratio;
    return img;
  }
}
