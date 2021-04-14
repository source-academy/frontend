import React from 'react';
import { Group, Line } from 'react-konva';

import { Config } from '../Config';

type ArrowConfig = { from: { x: number; y: number }; to: { x: number; y: number } };

/**
 * Represents an arrow used to connect a parent node and a child node.
 *
 * Used with FunctionDrawable and PairDrawable.
 */
export abstract class ArrowDrawable extends React.PureComponent<ArrowConfig> {
  render() {
    const parentXOffset = this.props.from.x - this.props.to.x;
    const parentYOffset = this.props.from.y - this.props.to.y;

    // Starting point at parent
    let start: { x: number; y: number };
    if (parentXOffset > 0) {
      start = { x: parentXOffset + Config.BoxWidth / 2, y: parentYOffset + Config.BoxHeight / 2 };
    } else {
      start = {
        x: parentXOffset + 3 * Config.BoxHeight / 4,
        y: parentYOffset + Config.BoxHeight / 2
      };
    }

    // End point at child
    const end = { x: Config.BoxWidth / 4, y: -Config.ArrowSpace };

    const pointer = (
      <Line
        points={[start.x, start.y, end.x, end.y]}
        strokeWidth={Config.StrokeWidth}
        stroke={Config.Stroke}
      />
    );

    // the angle of the incoming arrow
    const deltaX = end.x - start.x;
    const deltaY = end.y - start.y;
    let angle = Math.atan(deltaY / deltaX);
    angle = deltaX < 0 ? 2 * Math.PI + angle : angle;

    // left and right part of an arrow head, rotated to the calculated angle
    let left: { x: number; y: number }, right: { x: number; y: number };
    if (deltaX < 0) {
      left = {
        x: end.x + Math.cos(angle + Config.ArrowAngle) * Config.ArrowLength,
        y: end.y + Math.sin(angle + Config.ArrowAngle) * Config.ArrowLength
      };
      right = {
        x: end.x + Math.cos(angle - Config.ArrowAngle) * Config.ArrowLength,
        y: end.y + Math.sin(angle - Config.ArrowAngle) * Config.ArrowLength
      };
    } else {
      left = {
        x: end.x - Math.cos(angle + Config.ArrowAngle) * Config.ArrowLength,
        y: end.y - Math.sin(angle + Config.ArrowAngle) * Config.ArrowLength
      };
      right = {
        x: end.x - Math.cos(angle - Config.ArrowAngle) * Config.ArrowLength,
        y: end.y - Math.sin(angle - Config.ArrowAngle) * Config.ArrowLength
      };
    }
    const arrow = (
      <Line
        points={[left.x, left.y, end.x, end.y, right.x, right.y]}
        strokeWidth={Config.StrokeWidth}
        stroke={Config.Stroke}
      />
    );

    return (
      <Group>
        {pointer}
        {arrow}
      </Group>
    );
  }
}
