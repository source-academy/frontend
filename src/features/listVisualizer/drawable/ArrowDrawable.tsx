import React from 'react';
import { Arrow } from 'react-konva';

import { Config } from '../Config';

type ArrowConfig = { from: { x: number; y: number }; to: { x: number; y: number } };

/**
 * Represents an arrow used to connect a parent node and a child node.
 *
 * Used with FunctionDrawable and PairDrawable.
 */
export class ArrowDrawable extends React.PureComponent<ArrowConfig> {
  render() {
    const parentXOffset = this.props.from.x - this.props.to.x;
    const parentYOffset = this.props.from.y - this.props.to.y;
    
    const start = { x: parentXOffset + Config.BoxWidth / 2, y: parentYOffset + Config.BoxHeight / 2 };
    const end = { x: Config.BoxWidth / 4, y: -Config.ArrowSpace };

    return <Arrow
        key={this.props + ""}
        points={[
          start.x,
          start.y,
          end.x,
          end.y,
        ]}
        pointerWidth={Config.ArrowPointerSize}
        pointerLength={Config.ArrowPointerSize}
        fill={Config.Fill}
        stroke={Config.Stroke}
        strokeWidth={Config.StrokeWidth}>
      </Arrow>;
  }
}
