import { PhaserScene } from '../utils/extendedPhaser';

type ColorString = string;

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

export const styledText = (fill: ColorString, size = 32) => ({
  fontFamily: 'Abril Fatface',
  fontSize: `${size}px`,
  fill
});

export const funText = (fill: ColorString, size = 32) => ({
  fontFamily: 'Aclonica',
  fontSize: `${size}px`,
  fill
});

export function addText(
  scene: PhaserScene,
  x: number,
  y: number,
  message: string,
  fontSize: number,
  topColor: ColorString,
  bottomColor: ColorString
) {
  const shadow = scene.add.text(5, 5, message, funText(Color.black, fontSize)).setOrigin(0.5);
  const sprite = scene.add
    .text(0, 0, message, funText(topColor, fontSize))
    .setOrigin(0.5)
    .setTint(hex(Color.white), hex(Color.white), hex(bottomColor), hex(bottomColor));

  const text = scene.add.container(x, y, [shadow, sprite]);
  const setText = (text: string) => {
    shadow.setText(text);
    sprite.setText(text);
  };
  return [text, setText];
}

const borderSize = 10;
const origButtonW = 100;
const buttonH = 70;

type ButtonConfig = { x: number; y: number; fontSize?: number };

export function addButton(
  scene: PhaserScene,
  message: string,
  callback: () => void,
  { x, y, fontSize }: ButtonConfig
) {
  const buttonW = origButtonW + message.length * ((fontSize || 0) * 0.4 || 14);

  const frame = scene.add.rectangle(
    0,
    0,
    buttonW + borderSize * 2,
    buttonH + borderSize * 2,
    hex(Color.navy)
  );
  const shadow = scene.add.rectangle(1, 1, buttonW, buttonH, hex(Color.darkGrey));
  const main = scene.add.rectangle(-1, -1, buttonW, buttonH, hex(Color.lightBlue));
  const highlight = scene.add.rectangle(0, 0, buttonW, buttonH, hex(Color.white));

  const textShadow = scene.add
    .text(-1, -1, message.toUpperCase(), styledText(Color.black, fontSize))
    .setOrigin(0.5);
  const text = scene.add
    .text(0, 0, message.toUpperCase(), styledText(Color.maroon, fontSize))
    .setOrigin(0.5);

  const rect = scene.add
    .container(x, y, [frame, shadow, main, highlight, textShadow, text])
    .setSize(buttonW, buttonH);

  rect.setInteractive({ useHandCursor: true });

  highlight.alpha = 0;
  rect.on('pointerover', () => (highlight.alpha = 1));
  rect.on('pointerout', () => (highlight.alpha = 0));
  rect.on('pointerdown', callback);
  return rect;
}

export const serverStyle = {
  fontSize: '24px',
  'font-weight': 'bold',
  fill: '#ffffff',
  fontFamily: 'Arial'
};

export const hex = (str: string) => parseInt(str.slice(1), 16);
