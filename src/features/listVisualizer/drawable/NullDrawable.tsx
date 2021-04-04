import React from 'react';
import { Line } from 'react-konva'

import { Config } from '../Config'
import { NodeDrawable } from './NodeDrawable';

/**
 *  Complements a NodeBox when the tail is an empty box.
 */
export class NullDrawable extends NodeDrawable {
    private x: number;
    private y: number;

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