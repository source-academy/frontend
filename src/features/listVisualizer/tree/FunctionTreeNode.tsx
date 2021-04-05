import { Group } from "react-konva";

import { ArrowDrawable, FunctionDrawable } from "../drawable/Drawable";
import { DrawableTreeNode } from "./DrawableTreeNode";

/**
 * Represents a node corresponding to a Source (and Javascript) function.
 */
export class FunctionTreeNode extends DrawableTreeNode {
    createDrawable(x: number, y: number, parentX: number, parentY: number): JSX.Element {
        this._drawable = <Group
            x={x}
            y={y}>
            <FunctionDrawable></FunctionDrawable>
            {
                parentX !== x && <ArrowDrawable
                    {...{
                        from: {
                            x: parentX,
                            y: parentY,
                        },
                        to: {
                            x, y,
                        },
                    }}
                >
                </ArrowDrawable>
            }
        </Group>;

        this.drawableX = x;
        this.drawableY = y;

        return this._drawable;
    }
}