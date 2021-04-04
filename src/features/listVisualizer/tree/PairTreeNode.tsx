import React from 'react';

import { Group } from 'react-konva';
import { PairDrawable } from '../drawable/Drawables'
import { DataTreeNode, DrawableTreeNode } from './TreeNode';

/**
    A node in a binary tree.
    left : pointer to the left subtree
    right: pointer to the right subtree
*/
export class PairTreeNode extends DrawableTreeNode {
    // Return a Konva Group containing the pair
    getDrawable(x: number, y: number, parentX: number, parentY: number): JSX.Element {
        const leftData = this.left instanceof DataTreeNode ? this.left : null;
        const rightData = this.right instanceof DataTreeNode ? this.right : null;
        
        const pairProps = {leftData: leftData, rightData: rightData}
        const pairDrawable: PairDrawable = new PairDrawable(pairProps);

        this._drawable = <Group
            x={x}
            y={y}>
            {pairDrawable}
            {parentX !== x && pairDrawable.makeArrowFrom(parentX - x, parentY - y)}
        </Group>

        this.drawableX = x;
        this.drawableY = y;

        return this._drawable;
    }
}