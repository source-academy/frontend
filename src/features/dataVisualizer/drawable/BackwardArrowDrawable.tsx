import React from 'react';
import { Arrow } from 'react-konva';

import { Config } from '../Config';

type Props = {
  from: { x: number; y: number };
  to: { x: number; y: number };
};

/**
 * Represents an arrow used to connect a parent node and a child node that has been drawn before,
 * that is positioned to the top left of the parent node.
 */
const BackwardArrowDrawable: React.FC<Props> = ({ from, to }) => {
  /*
   *  Connects a box to a previously known box, the arrow path is more complicated.
   *
   *  After coming out of the starting box, it moves to the left,
   *  Then goes to the correct y-value and turns to reach the top of the end box.
   *  It then directly points to the end box. All turnings are 90 degress.
   *
   *        │
   *  ▲     │
   *  └─────┘
   */

  // The starting coordinate is the centre of the starting box
  // The ending coordinate is along the top edge of the ending box, and Config.ArrowSpaceHorizontal pixels from the left edge
  const bottomY = from.y + Config.BoxHeight / 2 + Config.ArrowMarginBottom;

  /** The x coordinate of the left most part of the backward arrow */
  const leftX = to.x - Config.ArrowMarginHorizontal;

  /** The y coordinate of the top most part of the backward arrow */
  const topY = to.y - Config.ArrowMarginTop;

  const path = [
    from.x,
    from.y,
    from.x,
    bottomY,
    leftX,
    bottomY,
    leftX,
    topY,
    to.x + Config.ArrowPointerOffsetHorizontal,
    topY,
    to.x + Config.ArrowPointerOffsetHorizontal,
    to.y + Config.ArrowPointerOffsetVertical
  ];

  return (
    <Arrow
      points={path}
      pointerLength={Config.ArrowPointerSize}
      pointerWidth={Config.ArrowPointerSize}
      fill={Config.Fill}
      stroke={Config.Stroke}
      strokeWidth={Config.StrokeWidth}
      preventDefault={false}
    />
  );
};

export default React.memo(BackwardArrowDrawable);
