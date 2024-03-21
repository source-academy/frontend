import React from 'react';
import { Arrow } from 'react-konva';

import { Config } from '../Config';

type Props = {
  from: { x: number; y: number };
  to: { x: number; y: number };
};

/**
 * Represents an arrow used to connect a parent node and a child node.
 *
 * Used with ArrayDrawable and FunctionDrawable.
 */
const ArrowDrawable: React.FC<Props> = props => {
  return (
    <Arrow
      key={props + ''}
      points={[
        props.from.x,
        props.from.y,
        props.to.x + Config.ArrowPointerOffsetHorizontal,
        props.to.y + Config.ArrowPointerOffsetVertical
      ]}
      pointerWidth={Config.ArrowPointerSize}
      pointerLength={Config.ArrowPointerSize}
      fill={Config.Fill}
      stroke={Config.Stroke}
      strokeWidth={Config.StrokeWidth}
      preventDefault={false}
    ></Arrow>
  );
};

export default React.memo(ArrowDrawable);
