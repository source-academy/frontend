import React from 'react';
import { Circle, Group } from 'react-konva';

import { Config } from '../Config';

type ContinuationProps = {
  x: number;
  y: number;
};

/**
 * Represents a continuation object drawn using three circles.
 */
class ContinuationDrawable extends React.PureComponent<ContinuationProps> {
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

        {/* Middle circle */}
        <Circle
          radius={Config.CircleRadiusLarge}
          strokeWidth={Config.StrokeWidth}
          stroke={Config.Stroke}
          x={Config.CircleRadiusLarge * 3 + Config.StrokeWidth}
          y={Config.CircleRadiusLarge}
          preventDefault={false}
        />

        {/* Right circle */}
        <Circle
          radius={Config.CircleRadiusLarge}
          strokeWidth={Config.StrokeWidth}
          stroke={Config.Stroke}
          x={Config.CircleRadiusLarge * 6 + Config.StrokeWidth}
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

        {/* Middle dot */}
        <Circle
          radius={Config.CircleRadiusSmall}
          strokeWidth={Config.StrokeWidth}
          stroke={Config.Fill}
          fill={Config.Fill}
          x={Config.CircleRadiusLarge * 3 + Config.StrokeWidth}
          y={Config.CircleRadiusLarge}
          preventDefault={false}
        />

        {/* Right dot */}
        <Circle
          radius={Config.CircleRadiusSmall}
          strokeWidth={Config.StrokeWidth}
          stroke={Config.Stroke}
          fill={Config.Fill}
          x={Config.CircleRadiusLarge * 6 + Config.StrokeWidth}
          y={Config.CircleRadiusLarge}
          preventDefault={false}
        />
      </Group>
    );
  }
}

export default ContinuationDrawable;
