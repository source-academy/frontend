import { Group } from 'react-konva';

import { ArrowDrawable, PairDrawable } from '../drawable/Drawable';
import { DataTreeNode } from './DataTreeNode';
import { DrawableTreeNode } from './DrawableTreeNode';

/**
 * Represents a node corresponding to a Source pair.
 */
export class PairTreeNode extends DrawableTreeNode {
  createDrawable(x: number, y: number, parentX: number, parentY: number): JSX.Element {
    const leftNode = this.left instanceof DataTreeNode ? this.left : null;
    const rightNode = this.right instanceof DataTreeNode ? this.right : null;
    const pairProps = { leftNode: leftNode, rightNode: rightNode };
    const pairDrawable = <PairDrawable {...pairProps}></PairDrawable>;

    this._drawable = (
      <Group x={x} y={y}>
        {pairDrawable}
        {parentX !== x && (
          <ArrowDrawable
            {...{
              from: {
                x: parentX,
                y: parentY
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
