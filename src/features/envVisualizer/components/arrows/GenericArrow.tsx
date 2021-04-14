import { KonvaEventObject } from 'konva/types/Node';
import { Arrow as KonvaArrow } from 'react-konva';

import { Config, ShapeDefaultProps } from '../../EnvVisualizerConfig';
import { Layout } from '../../EnvVisualizerLayout';
import { Hoverable, Visible } from '../../EnvVisualizerTypes';
import { setHoveredStyle, setUnhoveredStyle } from '../../EnvVisualizerUtils';

/** this class encapsulates an arrow to be drawn between 2 points */
export class GenericArrow implements Visible, Hoverable {
  readonly x: number;
  readonly y: number;
  height: number = 0;
  width: number = 0;
  points: number[] = [];
  from: Visible;
  target: Visible | undefined;

  constructor(from: Visible) {
    this.from = from;
    this.x = from.x;
    this.y = from.y;
  }

  to(to: Visible) {
    this.target = to;
    this.width = Math.abs(to.x - this.from.x);
    this.height = Math.abs(to.y - this.from.y);
    return this;
  }

  /** subclasses will override this with specific calculations */
  protected calculatePoints() {
    const from = this.from;
    const to = this.target;
    if (!to) return [];
    return [from.x, from.y, to.x, to.y];
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
        {...ShapeDefaultProps}
        points={this.calculatePoints()}
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
