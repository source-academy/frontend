import React from 'react';
import { Arrow } from 'react-konva';

import { Config } from '../Config';

type ArrowConfig = { from: { x: number; y: number }; to: { x: number; y: number } };

/**
 * Represents an arrow used to connect a parent node and a child node.
 *
 * Used with ArrayDrawable and FunctionDrawable.
 */
export class ArrowDrawable extends React.PureComponent<ArrowConfig> {
  render() {
    return (
      <Arrow
        key={this.props + ''}
        points={[this.props.from.x, this.props.from.y, this.props.to.x + Config.ArrowPointerOffsetHorizontal, this.props.to.y + Config.ArrowPointerOffsetVertical]}
        pointerWidth={Config.ArrowPointerSize}
        pointerLength={Config.ArrowPointerSize}
        fill={Config.Fill}
        stroke={Config.Stroke}
        strokeWidth={Config.StrokeWidth}
      ></Arrow>
    );
  }
}
