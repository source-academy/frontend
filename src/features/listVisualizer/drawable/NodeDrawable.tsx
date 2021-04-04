import React from 'react';
import { Line } from 'react-konva'

import { Config } from '../Config'

export abstract class NodeDrawable extends React.Component {
    /**
     *  Connects a NodeDrawable to its parent at x, y by using line segments with arrow head
     */
    makeArrowFrom(x: number, y: number): JSX.Element[] {
        // starting point
        const start = { x: Config.BoxWidth / 4, y: -Config.ArrowSpace };

        // end point
        let end;
        if (x > 0) {
            end = { x: x + Config.BoxWidth / 4, y: y + Config.BoxHeight / 2 };
        } else {
            end = { x: x + Config.BoxWidth * 3 / 4, y: y + Config.BoxHeight / 2 };
        }

        const pointer = <Line
            points={[start.x, start.y, end.x, end.y]}
            strokeWidth={Config.StrokeWidth}
            stroke={Config.Stroke} />
        // the angle of the incoming arrow
        const angle = Math.atan((end.y - start.y) / (end.x - start.x));

        // left and right part of an arrow head, rotated to the calculated angle
        let left, right;
        if (x > 0) {
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

        return [
            pointer,
            arrow,
        ]
    }
}