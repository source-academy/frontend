import { KonvaEventObject } from 'konva/types/Node';
import { Arrow as KonvaArrow } from 'react-konva';

import { Config } from '../../../EnvVisualizerConfig';
import { Layout } from '../../../EnvVisualizerLayout';
import { Hoverable, Visible } from '../../../EnvVisualizerTypes';
import { setHoveredStyle, setUnhoveredStyle } from '../../../EnvVisualizerUtils';
import { ArrayUnit } from './ArrayUnit';
import { Frame } from './Frame';
import { Text } from './Text';
import { ArrayValue } from './values/ArrayValue';
import { FnValue } from './values/FnValue';
import { GlobalFnValue } from './values/GlobalFnValue';

/** this class encapsulates an arrow to be drawn between 2 points */
export class Arrow implements Visible, Hoverable {
  readonly x: number;
  readonly y: number;
  readonly height: number;
  readonly width: number;
  readonly points: number[];

  constructor(readonly from: Visible, readonly to: Visible) {
    this.x = from.x;
    this.y = from.y;

    if (from instanceof Frame) {
      if (to instanceof Frame) {
        this.points = [
          from.x + Config.FramePaddingX,
          from.y,
          from.x + Config.FramePaddingX,
          from.y - Config.FrameMarginY,
          to.x + Config.FramePaddingX,
          from.y - Config.FrameMarginY,
          to.x + Config.FramePaddingX,
          to.y + to.height
        ];
      } else {
        this.points = [
          from.x + Config.FramePaddingX,
          from.y,
          to.x + Config.FramePaddingX,
          to.y + to.height
        ];
      }
    } else if (from instanceof FnValue || from instanceof GlobalFnValue) {
      if (to.y < from.y && from.y < to.y + to.height) {
        if (from.x < to.x) {
          this.points = [
            from.x + Config.FnRadius * 3,
            from.y,
            from.x + Config.FnRadius * 3,
            from.y - Config.FnRadius * 2,
            to.x,
            from.y - Config.FnRadius * 2
          ];
        } else {
          this.points = [
            from.x + Config.FnRadius * 3,
            from.y,
            from.x + Config.FnRadius * 3,
            from.y - Config.FnRadius * 2,
            to.x + to.width,
            from.y - Config.FnRadius * 2
          ];
        }
      } else if (to.y < from.y) {
        this.points = [from.x + Config.FnRadius * 3, from.y, to.x + to.width / 2, to.y + to.height];
      } else {
        this.points = [from.x + Config.FnRadius * 3, from.y, to.x + to.width / 2, to.y];
      }
    } else if (from instanceof Text) {
      this.points = [from.x + from.width, from.y + from.height / 2];
      if (to instanceof ArrayValue) {
        this.points.push(to.x, to.y + Config.DataUnitHeight / 2);
      } else {
        this.points.push(to.x, to.y);
      }
    } else if (from instanceof ArrayUnit) {
      this.points = [from.x + Config.DataUnitWidth / 2, from.y + Config.DataUnitHeight / 2];
      if (to instanceof FnValue || to instanceof GlobalFnValue) {
        if (from.x < to.x) {
          this.points.push(to.x, to.y);
        } else {
          this.points.push(to.centerX, to.y);
        }
      } else if (to instanceof ArrayValue) {
        if (from.y === to.y && Math.abs(from.x - to.x) > Config.DataUnitWidth * 2) {
          this.points.push(
            from.x + Config.DataUnitWidth / 2,
            from.y - Config.DataUnitHeight / 2,
            to.x + Config.DataUnitWidth / 2,
            to.y - Config.DataUnitHeight / 2,
            to.x + Config.DataUnitWidth / 2,
            to.y
          );
        } else if (from.y < to.y) {
          this.points.push(to.x + Config.DataUnitWidth / 2, to.y);
        } else if (from.y > to.y) {
          this.points.push(to.x + Config.DataUnitWidth / 2, to.y + Config.DataUnitHeight);
        } else {
          this.points.push(to.x, to.y + Config.DataUnitHeight / 2);
        }
      } else {
        this.points.push(to.x, to.y);
      }
    } else {
      this.points = [from.x, from.y, to.x, to.y];
    }

    this.width = Math.abs(to.x - from.x);
    this.height = Math.abs(to.y - from.y);
  }

  onMouseEnter = ({ currentTarget }: KonvaEventObject<MouseEvent>) => {
    setHoveredStyle(currentTarget, {
      strokeWidth: Number(Config.ArrowHoveredStrokeWidth)
    });
  };

  onMouseLeave = ({ currentTarget }: KonvaEventObject<MouseEvent>) => {
    setUnhoveredStyle(currentTarget, {
      strokeWidth: Number(Config.ArrowStrokeWidth)
    });
  };

  draw() {
    return (
      <KonvaArrow
        points={this.points}
        fill={Config.SA_WHITE.toString()}
        stroke={Config.SA_WHITE.toString()}
        strokeWidth={Number(Config.ArrowStrokeWidth)}
        hitStrokeWidth={Number(Config.ArrowHitStrokeWidth)}
        key={Layout.key++}
        onMouseEnter={this.onMouseEnter}
        onMouseLeave={this.onMouseLeave}
      />
    );
  }
}
