import { Group } from 'react-konva';

import { PairDrawable } from '../drawable/Drawable'
import { DataTreeNode } from './DataTreeNode';
import { DrawableTreeNode } from './DrawableTreeNode';

/**
    A node in a binary tree.
    left : pointer to the left subtree
    right: pointer to the right subtree
*/
export class PairTreeNode extends DrawableTreeNode {
    // Return a Konva Group containing the pair
    getDrawable(x: number, y: number, parentX: number, parentY: number): JSX.Element {
        const leftNode = this.left instanceof DataTreeNode ? this.left : null;
        const rightNode = this.right instanceof DataTreeNode ? this.right : null;
        const pairProps = {leftNode: leftNode, rightNode: rightNode}
        const pairDrawable: JSX.Element = <PairDrawable {...pairProps}></PairDrawable>;

        this._drawable = <Group
            x={x}
            y={y}>
            {pairDrawable}
            {parentX !== x && new PairDrawable(pairProps).makeArrowFrom(parentX - x, parentY - y)}
        </Group>

        this.drawableX = x;
        this.drawableY = y;

        return this._drawable;
    }
}