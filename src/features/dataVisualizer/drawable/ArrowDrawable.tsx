import React from 'react';
import { Arrow } from 'react-konva';

import { Config } from '../Config';
import DataVisualizer from '../dataVisualizer';

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
  if (DataVisualizer.getBinTreeMode()) { // RenderBinaryTree
    return (
      <Arrow
        key={props + ''}
        points={[
          props.from.x,
          props.from.y,
          props.to.x,
          props.to.y
        ]}
        pointerWidth={Config.ArrowPointerSize}
        pointerLength={Config.ArrowPointerSize}
        fill={Config.Fill}
        stroke={Config.Stroke}
        strokeWidth={Config.StrokeWidth}
        preventDefault={false}
      ></Arrow>
    );
  }
  else if (DataVisualizer.getTreeMode()) { // RenderGeneralTree
    return (
      <Arrow
        key={props + ''}
        points={[
          props.from.x,
          props.from.y,
          props.to.x,
          props.to.y
        ]}
        pointerWidth={Config.ArrowPointerSize}
        pointerLength={Config.ArrowPointerSize}
        fill={Config.Fill}
        stroke={Config.Stroke}
        strokeWidth={Config.StrokeWidth}
        preventDefault={false}
      ></Arrow>
    );
  }
  else { // OriginalView
    return (
      <Arrow
        key={props + ''}
        points={[
          props.from.x,
          props.from.y,
          props.to.x + (Config.BoxWidth / 2),
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
  }
};

export default React.memo(ArrowDrawable);
