import { KonvaEventObject } from 'konva/types/Node';
import React from 'react';
import { Shape } from 'react-konva';

import { ShapeDefaultProps } from '../../EnvVisualizerConfig';

interface Props {
  x: number;
  y: number;
  width: number;
  height: number;
  cornerRadius: { upperLeft: number; lowerLeft: number; upperRight: number; lowerRight: number };
  stroke: string;
  fillEnabled: boolean;
  hitStrokeWidth: number;
  onMouseEnter: ({ currentTarget }: KonvaEventObject<MouseEvent>) => void;
  onMouseLeave: ({ currentTarget }: KonvaEventObject<MouseEvent>) => void;
}

export const RoundedRect: React.FC<Props> = ({ x, y, width, height, cornerRadius, ...props }) => {
  return (
    <Shape
      sceneFunc={(context, shape) => {
        const { upperLeft, lowerLeft, upperRight, lowerRight } = cornerRadius;
        context.beginPath();
        context.moveTo(x + upperLeft, y);
        context.lineTo(x + width - upperRight, y);
        context.quadraticCurveTo(x + width, y, x + width, y + upperRight);
        context.lineTo(x + width, y + height - lowerRight);
        context.quadraticCurveTo(x + width, y + height, x + width - lowerRight, y + height);
        context.lineTo(x + lowerLeft, y + height);
        context.quadraticCurveTo(x, y + height, x, y + height - lowerLeft);
        context.lineTo(x, y + upperLeft);
        context.quadraticCurveTo(x, y, x + upperLeft, y);
        context.closePath();
        // (!) Konva specific method, it is very important
        context.fillStrokeShape(shape);
      }}
      {...ShapeDefaultProps}
      {...props}
    />
  );
};
