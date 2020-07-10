import * as _ from 'lodash';

export const Color = {
  navy: '#03092c',
  lightBlue: '#ece1fb',
  offWhite: '#bbc1c9',
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
  purple: '#dd33dd',
  paleYellow: '#f6ffbd'
};

const hex = (str: string) => parseInt(str.slice(1), 16);
export const HexColor = _.mapValues(Color, hex);
