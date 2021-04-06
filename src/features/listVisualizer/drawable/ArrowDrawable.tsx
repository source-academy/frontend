import React from 'react';
import { Group, Line } from 'react-konva'

import { Config } from '../Config'

type ArrowConfig = { from: { x: number, y: number }, to: { x: number, y: number } };

/**
 * Represents an arrow used to connect a parent node and a child node.
 * 
 * Used in with FunctionDrawable and PairDrawable.
 */
export abstract class ArrowDrawable extends React.Component {
    private config: ArrowConfig;

    constructor(props: ArrowConfig) {
        super(props);
        this.config = props;
    }

    render() {
        const parentXOffset = this.config.from.x - this.config.to.x;
        const parentYOffset = this.config.from.y - this.config.to.y;

        // Starting point
        const start = { x: Config.BoxWidth / 4, y: -Config.ArrowSpace };

        // End point
        let end: { x: number, y: number };
        if (parentXOffset > 0) {
            end = { x: parentXOffset + Config.BoxWidth / 4, y: parentYOffset + Config.BoxHeight / 2 };
        } else {
            end = { x: parentXOffset + Config.BoxWidth * 3 / 4, y: parentYOffset + Config.BoxHeight / 2 };
        }

        const pointer = <Line
            points={[start.x, start.y, end.x, end.y]}
            strokeWidth={Config.StrokeWidth}
            stroke={Config.Stroke} />
        // the angle of the incoming arrow
        const angle = Math.atan((end.y - start.y) / (end.x - start.x));

        // left and right part of an arrow head, rotated to the calculated angle
        let left: { x: number, y: number }, right: { x: number, y: number };
        if (parentXOffset > 0) {
            left = {
                x: start.x + Math.cos(angle + Config.ArrowAngle) * Config.ArrowLength,
                y: start.y + Math.sin(angle + Config.ArrowAngle) * Config.ArrowLength
            };
            right = {
                x: start.x + Math.cos(angle - Config.ArrowAngle) * Config.ArrowLength,
                y: start.y + Math.sin(angle - Config.ArrowAngle) * Config.ArrowLength
            };
        } else {
            left = {
                x: start.x - Math.cos(angle + Config.ArrowAngle) * Config.ArrowLength,
                y: start.y - Math.sin(angle + Config.ArrowAngle) * Config.ArrowLength
            };
            right = {
                x: start.x - Math.cos(angle - Config.ArrowAngle) * Config.ArrowLength,
                y: start.y - Math.sin(angle - Config.ArrowAngle) * Config.ArrowLength
            };
        }

        const arrow = <Line
            points={[left.x, left.y, start.x, start.y, right.x, right.y]}
            strokeWidth={Config.StrokeWidth}
            stroke={Config.Stroke} />

        return <Group>
            {pointer}
            {arrow}
        </Group>;
    }
}