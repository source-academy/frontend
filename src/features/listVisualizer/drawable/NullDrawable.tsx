import React from 'react';
import { Line } from 'react-konva'

import { Config } from '../Config'

/**
 *  Represents the diagonal line drawn over the tail of a pair
 *  when the tail is an empty box.
 * 
 *  Used in conjunction with PairDrawable.
 */
export class NullDrawable extends React.Component {
    private x: number;
    private y: number;


    /**
     * Constructs a new NullDrawable at the given position.
     * @param props Props containing the position of the drawable.
     */
    constructor(props: { x: number, y: number }) {
        super(props);
        this.x = props.x;
        this.y = props.y;
    }

    render() {
        return <Line
            x={this.x}
            y={this.y}
            points={[
                Config.BoxWidth * Config.VertBarPos,
                Config.BoxHeight,
                Config.BoxWidth * Config.VertBarPos,
                0,
                Config.BoxWidth,
                0,
                Config.BoxWidth * Config.VertBarPos,
                Config.BoxHeight,
                Config.BoxWidth,
                Config.BoxHeight,
                Config.BoxWidth,
                0
            ]}
            strokeWidth={Config.StrokeWidth - 1}
            stroke={Config.Stroke}
        />
    }
}