import { Group } from 'react-konva';

import { Config } from '../Config';
import { ArrayDrawable, ArrowDrawable } from '../drawable/Drawable';
import { DrawableTreeNode } from './DrawableTreeNode';

/**
 * Represents a node corresponding to a Source pair or array.
 */
export class ArrayTreeNode extends DrawableTreeNode {
  createDrawable(x: number, y: number, parentX: number, parentY: number): JSX.Element {
    const arrayProps = { nodes: this.children ?? [], x, y };
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
