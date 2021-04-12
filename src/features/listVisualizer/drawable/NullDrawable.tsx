import React from 'react';
import { Line } from 'react-konva';

import { Config } from '../Config';

type NullProps = {
  x: number;
  y: number;
};

/**
 *  Represents the diagonal line drawn over the tail of a pair
 *  when the tail is an empty box.
 *
 *  Used in conjunction with PairDrawable.
 */
export class NullDrawable extends React.PureComponent<NullProps> {
  render() {
    return (
      <Line
        x={this.props.x}
        y={this.props.y}
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
    );
  }
}
