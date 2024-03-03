import { KonvaEventObject } from 'konva/lib/Node';
import React, { RefObject } from 'react';
import { Shape } from 'react-konva';

import { ShapeDefaultProps } from '../../CseMachineConfig';

interface Props {
  x: number;
  y: number;
  width: number;
  height: number;
  cornerRadius: { upperLeft: number; lowerLeft: number; upperRight: number; lowerRight: number };
  stroke: string;
  fillEnabled: boolean;
  hitStrokeWidth: number;
  forwardRef: RefObject<any>;
  onMouseEnter?: ({ currentTarget }: KonvaEventObject<MouseEvent>) => void;
  onMouseLeave?: ({ currentTarget }: KonvaEventObject<MouseEvent>) => void;
  onClick?: ({ currentTarget }: KonvaEventObject<MouseEvent>) => void;
}

/**
 * Represents Rectangle with rounded corners, for boundary of arrays (compact and non-compact).
 */
export const RoundedRect: React.FC<Props> = ({
  x,
  y,
  width,
  height,
  cornerRadius,
  forwardRef,
  ...props
}) => {
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
      ref={forwardRef}
      {...props}
    />
  );
};
