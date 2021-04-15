import React, { PureComponent } from "react";
import { Arrow } from "react-konva";

import { Config } from "../Config";

type ArrowConfig = { from: { x: number; y: number }; to: { x: number; y: number } };

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
    const startX = this.props.from.x;
    const startY = this.props.from.y;
    const downX = this.props.from.x;
    const downY = this.props.from.y + Config.BoxHeight / 2 + Config.ArrowMarginBottom;

    // Segment 2 : Path to end (Path starts at Segment 1 end)
      // lower right to upper left
    const path = [
      //x1 + tcon.boxWidth/4, y1 + tcon.boxHeight/2,
      startX,
      startY,
      downX,
      downY,
      this.props.to.x - Config.ArrowMarginHorizontal,
      downY,
      this.props.to.x - Config.ArrowMarginHorizontal,
      this.props.to.y - Config.ArrowMarginTop,
      this.props.to.x + Config.BoxWidth / 2 - Config.ArrowSpaceH,
      this.props.to.y - Config.ArrowMarginTop,
      this.props.to.x + Config.BoxWidth / 2 - Config.ArrowSpaceH,
      this.props.to.y - Config.ArrowSpace,
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
    // TODO: Fix this
    // pointer.moveToBottom();
  }
}