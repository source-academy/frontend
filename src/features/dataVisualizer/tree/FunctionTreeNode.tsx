import { Group } from 'react-konva';

import { Config } from '../Config';
import { ArrowDrawable, FunctionDrawable } from '../drawable/Drawable';
import { DrawableTreeNode } from './DrawableTreeNode';

/**
 * Represents a node corresponding to a Source (and Javascript) function.
 */
export class FunctionTreeNode extends DrawableTreeNode {
  createDrawable(
    x: number,
    y: number,
    parentX: number,
    parentY: number,
    colorIndex: number,
  ): React.ReactElement {
    this._drawable = (
      <Group key={x + ', ' + y}>
        <FunctionDrawable {...{ x, y }} />
        {(parentX !== x || parentY !== y) && (
          <ArrowDrawable
            {...{
              from: {
                x: parentX + Config.BoxWidth / 2,
                y: parentY + Config.BoxHeight / 2,
              },
              to: {
                x,
                y,
              },
            }}
           />
        )}
      </Group>
    );

    this.drawableX = x;
    this.drawableY = y;

    return this._drawable;
  }
}
