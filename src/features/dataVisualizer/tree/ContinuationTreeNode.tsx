import { Group } from 'react-konva';

import { Config } from '../Config';
import { ArrowDrawable, ContinuationDrawable } from '../drawable/Drawable';
import { DrawableTreeNode } from './DrawableTreeNode';

/**
 * Represents a node corresponding to a Scheme Continuation.
 */
export class ContinuationTreeNode extends DrawableTreeNode {
  createDrawable(x: number, y: number, parentX: number, parentY: number): JSX.Element {
    this._drawable = (
      <Group key={x + ', ' + y}>
        <ContinuationDrawable {...{ x, y }}></ContinuationDrawable>
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
