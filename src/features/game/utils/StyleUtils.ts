import * as _ from 'lodash';
import { screenSize } from '../commons/CommonConstants';

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

type TableFormatPosConfig = {
  numOfItems: number;
  maxXSpace?: number;
  maxYSpace?: number;
  numItemLimit?: number;
  redistributeLast?: boolean;
};

/**
 * Calculate x,y positions using a table format: mimic table-like
 * positions, with rows and columns.
 *
 * The positions will be ordered from left to right before
 * moving to the next row i.e. row-wise.
 *
 * @param numOfItems total number of items
 * @param maxXSpace maximum X space to be used, optional
 * @param maxYSpace maximum Y space to be used, optional
 * @param numItemLimit maximum number of item at a given row, optional
 * @param redistributeLast if true, items at the last row will have their location
 *                         calculated based on the number of items at the last row, optional
 * @returns {Array<[number, number]>} array of positions, in the format of
 *                                 [[xPos0, yPos0], [xPos1, yPos1]...]
 */
export function calcTableFormatPos({
  numOfItems,
  maxXSpace = screenSize.x,
  maxYSpace = screenSize.y,
  numItemLimit = 0,
  redistributeLast = true
}: TableFormatPosConfig): Array<[number, number]> {
  const pos = new Array<[number, number]>();
  const numOfRows = numItemLimit ? Math.ceil(numOfItems / numItemLimit) : 1;
  const numOfCols = numItemLimit ? numItemLimit : numOfItems;
  const numOfColsAtLastRow = numOfItems % numOfCols;

  // Calculate partition size
  const partitionXSpace = maxXSpace / numOfCols;
  const partitionYSpace = maxYSpace / numOfRows;
  const partitionLastXSpace = redistributeLast
    ? maxXSpace / (numOfColsAtLastRow || numOfCols)
    : partitionXSpace;

  for (let i = 0; i < numOfItems; i++) {
    // Get item position in terms of index
    const itemXIdx = i % numOfCols;
    const itemYIdx = Math.floor(i / numOfCols) % numOfRows;

    // Determine item final position
    const itemXPos =
      itemXIdx === numOfRows - 1
        ? (screenSize.x - maxXSpace + partitionLastXSpace) / 2 + itemXIdx * partitionLastXSpace
        : (screenSize.x - maxXSpace + partitionXSpace) / 2 + itemXIdx * partitionXSpace;
    const itemYPos = (screenSize.y - maxYSpace + partitionYSpace) / 2 + itemYIdx * partitionYSpace;

    // Update
    pos.push([itemXPos, itemYPos]);
  }
  return pos;
}
