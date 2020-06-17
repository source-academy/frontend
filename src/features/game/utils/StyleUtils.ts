import { shortButton } from '../commons/CommonAssets';

export const Color = {
  navy: '#03092c',
  lightBlue: '#ece1fb',
  white: '#ffffff',
  darkGrey: '#333333',
  lightGrey: '#555555',
  darkBlue: '#1133ff',
  orange: '#ff9933',
  yellow: '#ffee33',
  red: '0#ff0000',
  maroon: '#142B2E',
  black: '#000000',
  purple: '#dd33dd'
};

type ButtonConfig = { x: number; y: number; fontSize?: number };

export function createButton(
  scene: Phaser.Scene,
  message: string,
  callback: () => void,
  { x, y }: ButtonConfig
) {
  const container = new Phaser.GameObjects.Container(scene, x, y);
  const button = new Phaser.GameObjects.Image(scene, 0, 0, shortButton.key);
  button.setInteractive({ useHandCursor: true }).on('pointerdown', callback);

  const text = new Phaser.GameObjects.Text(scene, 0, 0, message, {});

  container.add([button, text]);

  return container;
}

export const hex = (str: string) => parseInt(str.slice(1), 16);
