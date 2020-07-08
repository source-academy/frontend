import * as _ from 'lodash';
import { AssetKey, BitmapFontStyle } from '../commons/CommonTypes';
import { Constants } from '../commons/CommonConstants';

export const Color = {
  navy: '#03092c',
  lightBlue: '#ece1fb',
  white: '#ffffff',
  darkGrey: '#333333',
  lightGrey: '#555555',
  blue: '#1133ff',
  darkBlue: '#0d2440',
  orange: '#ff9933',
  yellow: '#ffee33',
  red: '0#ff0000',
  maroon: '#142B2E',
  black: '#000000',
  purple: '#dd33dd'
};

const hex = (str: string) => parseInt(str.slice(1), 16);
export const HexColor = _.mapValues(Color, hex);

type ButtonConfig = { x: number; y: number; fontSize?: number };

export function createButton(
  scene: Phaser.Scene,
  message: string,
  callback: () => void,
  assetKey: AssetKey,
  { x, y }: ButtonConfig,
  originX?: number,
  originY?: number,
  bitMapTextStyle?: BitmapFontStyle
) {
  const container = new Phaser.GameObjects.Container(scene, x, y);
  const button = new Phaser.GameObjects.Image(scene, 0, 0, assetKey);
  button.setInteractive({ pixelPerfect: true, useHandCursor: true });
  button.addListener(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, callback);

  const style = bitMapTextStyle ? bitMapTextStyle : Constants.defaultFontStyle;
  const text = new Phaser.GameObjects.BitmapText(
    scene,
    0,
    0,
    style.key,
    message,
    style.size,
    style.align
  ).setTintFill(style.fill);
  const oriX = originX ? originX : 0.25;
  const oriY = originY ? originY : 0.7;
  text.setOrigin(oriX, oriY);

  container.add([button, text]);

  return container;
}
