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
 *  Used in conjunction with ArrayDrawable.
 */
class NullDrawable extends React.PureComponent<NullProps> {
  render() {
    return (
      <Line
        x={this.props.x}
        y={this.props.y}
        points={[0, Config.BoxHeight, Config.BoxWidth, 0]}
        strokeWidth={Config.StrokeWidth - 1}
        stroke={Config.Stroke}
        preventDefault={false}
      />
    );
  }
}

export default NullDrawable;
