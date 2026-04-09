import type { JSX } from 'react';
import { Group } from 'react-konva';

import { Config } from '../Config';
import { ArrayDrawable, ArrowDrawable } from '../drawable/Drawable';
import { DrawableTreeNode } from './DrawableTreeNode';

/**
 * Represents a node corresponding to a Source pair or array.
 */
export class ArrayTreeNode extends DrawableTreeNode {
  Colors: string[] = ['#d81d1d', '#e46510', '#25a232', '#0d54ed', '#e6148f', '#ad0ede'];
  createDrawable(
    x: number,
    y: number,
    parentX: number,
    parentY: number,
    colorIndex: number
  ): JSX.Element {
    let color = '';
    color = colorIndex === -1 ? 'black' : this.Colors[colorIndex % this.Colors.length];
    const arrayProps = { nodes: this.children ?? [], x, y, color };
    const arrayDrawable = <ArrayDrawable {...arrayProps}></ArrayDrawable>;

    this._drawable = (
      <Group key={x + ', ' + y}>
        {arrayDrawable}
        {(parentX !== x || parentY !== y) && (
          <ArrowDrawable
            {...{
              from: {
                x: parentX + Config.BoxWidth / 2,
                y: parentY + Config.BoxHeight / 2
              },
              to: {
                x,
                y
              }
            }}
          ></ArrowDrawable>
        )}
      </Group>
    );
    this.drawableX = x;
    this.drawableY = y;
    return this._drawable;
  }
}
