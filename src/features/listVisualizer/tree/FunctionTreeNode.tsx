import { Group } from "react-konva";

import { FunctionDrawable } from "../drawable/FunctionDrawable";
import { DrawableTreeNode } from "./DrawableTreeNode";

export class FunctionTreeNode extends DrawableTreeNode {
    getDrawable(x: number, y: number, parentX: number, parentY: number): JSX.Element {
        const circle: FunctionDrawable = new FunctionDrawable({});

        this._drawable = <Group
            x={x}
            y={y}>
            {circle}
            {parentX !== x && circle.makeArrowFrom(parentX - x, parentY - y)}
        </Group>;

        this.drawableX = x;
        this.drawableY = y;

        return this._drawable;
    }
}