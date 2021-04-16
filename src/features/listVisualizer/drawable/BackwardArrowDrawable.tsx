import React, { PureComponent } from "react";
import { Arrow } from "react-konva";

import { Config } from "../Config";

type ArrowConfig = { from: { x: number; y: number }; to: { x: number; y: number } };

/**
 * Represents an arrow used to connect a parent node and a child node that has been drawn before,
 * that is positioned to the top left of the parent node.
 *
 */
export class BackwardArrowDrawable extends PureComponent<ArrowConfig> {
  /**
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
   render() {

    // The starting coordinate is the centre of the starting box
    // The ending coordinate is along the top edge of the ending box, and Config.ArrowSpaceHorizontal pixels from the left edge
    const bottomY = this.props.from.y + Config.BoxHeight / 2 + Config.ArrowMarginBottom;

    // The x coordinate of the left most part of the backward arrow
    const leftX = this.props.to.x - Config.ArrowSpaceHorizontal - Config.ArrowMarginHorizontal;

    // The y coordinate of the top most part of the backward arrow
    const topY = this.props.to.y - Config.ArrowMarginTop;

    const path = [
      this.props.from.x,
      this.props.from.y,
      this.props.from.x,
      bottomY,
      leftX,
      bottomY,
      leftX,
      topY,
      this.props.to.x,
      topY,
      this.props.to.x,
      this.props.to.y,
    ];
    return <Arrow
      key={this.props + ""}
      points={path}
      stroke={Config.Stroke}
      fill={Config.Fill}
      strokeWidth={Config.StrokeWidth}
      pointerLength={Config.ArrowPointerSize}
      pointerWidth={Config.ArrowPointerSize}>
    </Arrow>
  }
}