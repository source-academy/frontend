import React from 'react';
import { Circle, Group } from 'react-konva';

import { Config } from '../Config';

type FunctionProps = {
  x: number;
  y: number;
};

/**
 * Represents a function object drawn using two circles.
 */
class FunctionDrawable extends React.PureComponent<FunctionProps> {
  render() {
    return (
      <Group {...this.props}>
        {/* Left circle */}
        <Circle
          radius={Config.CircleRadiusLarge}
          strokeWidth={Config.StrokeWidth}
          stroke={Config.Stroke}
          x={Config.CircleRadiusLarge}
          y={Config.CircleRadiusLarge}
          preventDefault={false}
        />

        {/* Right circle */}
        <Circle
          radius={Config.CircleRadiusLarge}
          strokeWidth={Config.StrokeWidth}
          stroke={Config.Stroke}
          x={Config.CircleRadiusLarge * 3 + Config.StrokeWidth}
          y={Config.CircleRadiusLarge}
          preventDefault={false}
        />

        {/* Left dot */}
        <Circle
          radius={Config.CircleRadiusSmall}
          strokeWidth={Config.StrokeWidth}
          stroke={Config.Fill}
          fill={Config.Fill}
          x={Config.CircleRadiusLarge}
          y={Config.CircleRadiusLarge}
          preventDefault={false}
        />

        {/* Right dot */}
        <Circle
          radius={Config.CircleRadiusSmall}
          strokeWidth={Config.StrokeWidth}
          stroke={Config.Stroke}
          fill={Config.Fill}
          x={Config.CircleRadiusLarge * 3 + Config.StrokeWidth}
          y={Config.CircleRadiusLarge}
          preventDefault={false}
        />
      </Group>
    );
  }
}

export default FunctionDrawable;
