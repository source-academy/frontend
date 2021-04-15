import React from 'react';
import { Circle, Group } from 'react-konva';

import { Config } from '../Config';

/**
 * Represents a function object drawn using two circles.
 */
export class FunctionDrawable extends React.PureComponent {
  render() {
    return (
      <Group>
        {/* Left circle */}
        <Circle
          radius={15}
          strokeWidth={Config.StrokeWidth}
          stroke={Config.Stroke}
          x={Config.BoxWidth / 2 - 20} // 25
          y={Config.BoxHeight / 2}
        />

        {/* Right circle */}
        <Circle
          radius={15}
          strokeWidth={Config.StrokeWidth}
          stroke={Config.Stroke}
          x={Config.BoxWidth / 2 + 10} // 55
          y={Config.BoxHeight / 2}
        />

        {/* Left dot */}
        <Circle
          radius={4}
          strokeWidth={Config.StrokeWidth}
          stroke={Config.Fill}
          fill={Config.Fill}
          x={Config.BoxWidth / 2 - 20}
          y={Config.BoxHeight / 2}
        />

        {/* Right dot */}
        <Circle
          radius={4}
          strokeWidth={Config.StrokeWidth}
          stroke={Config.Stroke}
          fill={Config.Fill}
          x={Config.BoxWidth / 2 + 10}
          y={Config.BoxHeight / 2}
        />
      </Group>
    );
  }
}
