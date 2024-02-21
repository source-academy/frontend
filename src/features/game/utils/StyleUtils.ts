import _ from 'lodash';

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
  direction?: Direction;
  numOfItems: number;
  maxXSpace?: number;
  maxYSpace?: number;
  numItemLimit?: number;
  redistributeLast?: boolean;
};

export enum Direction {
  Row = 'Row',
  Column = 'Column'
}

/**
 * Calculate x,y positions using a table format: mimic table-like
 * positions, with rows and columns.
 *
 * The positions will be ordered from LEFT to RIGHT before
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
  direction = Direction.Row,
  numOfItems,
  maxXSpace = screenSize.x,
  maxYSpace = screenSize.y,
  numItemLimit = 0,
  redistributeLast = true
}: TableFormatPosConfig): Array<[number, number]> {
  let itemsPerList = numItemLimit || numOfItems;
  const numOfLists = Math.ceil(numOfItems / itemsPerList);

  return _.times(numOfItems, itemNumber => {
    const itemIndexInList = itemNumber % itemsPerList;
    const listIndex = Math.floor(itemNumber / itemsPerList);

    if (redistributeLast && listIndex === numOfLists - 1) {
      itemsPerList = numOfItems % numOfLists || itemsPerList;
    }

    return direction === Direction.Row
      ? [
          indexToCoordinate(screenSize.x, maxXSpace, itemIndexInList, itemsPerList),
          indexToCoordinate(screenSize.y, maxYSpace, listIndex, numOfLists)
        ]
      : [
          indexToCoordinate(screenSize.x, maxXSpace, listIndex, numOfLists),
          indexToCoordinate(screenSize.y, maxYSpace, itemIndexInList, itemsPerList)
        ];
  });
}

function indexToCoordinate(
  screenSpace: number,
  listSpace: number,
  index: number,
  maxItems: number
) {
  const partitionSpace = listSpace / maxItems;
  return (screenSpace - listSpace + partitionSpace) / 2 + partitionSpace * index;
}

type ListFormatPos = {
  numOfItems: number;
  xSpacing: number;
  ySpacing: number;
};

/**
 * Calculate x,y positions using a list format: mimic list-like
 * positions, ordered sequentially.
 *
 * Each item will be offset by xSpaing and ySpacing.
 *
 * The first item will start at [0, 0] (top left) position.
 *
 * @param numOfItems total number of items
 * @param xSpacing horizontal spacing between items
 * @param ySpacing vertical spacing between items
 * @returns {Array<[number, number]>} array of positions, in the format of
 *                                 [[xPos0, yPos0], [xPos1, yPos1]...]
 */
export function calcListFormatPos({ numOfItems, xSpacing = 30, ySpacing = 30 }: ListFormatPos) {
  const pos = new Array<[number, number]>();

  for (let i = 0; i < numOfItems; i++) {
    pos.push([i * xSpacing, i * ySpacing]);
  }

  return pos;
}
