import { KonvaEventObject } from 'konva/types/Node';
import { Arrow as KonvaArrow } from 'react-konva';

import { Config, ShapeDefaultProps } from '../../EnvVisualizerConfig';
import { Layout } from '../../EnvVisualizerLayout';
import { Hoverable, StepsArray, Visible } from '../../EnvVisualizerTypes';
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

  /**
   * Calculates the steps that this arrows takes.
   * The arrow is decomposed into numerous straight line segments, each of which we
   * can consider as a step of dx in the x direction and of dy in the y direction.
   * The line segment is thus defined by 2 points (x, y) and (x + dx, y + dy)
   * where (x, y) is the ending coordinate of the previous line segment.
   * This function returns an array of such steps, represented by an array of functions
   *  [ (x, y) => [x + dx1, y + dy1], (x, y) => [x + dx2, y + dy2], ... ].
   * From this, we can retrieve the points that make up the arrow as such:
   * (from.x from.y), (from.x + dx1, from.y + dy1), (from.x + dx1 + dx2, from.y + dy1 + dy2), ..
   *
   * Note that the functions need not be of the form (x, y) => [x + dx, y + dy];
   * (x, y) => [to.x, to.y] is valid as well, and is used to specify a step to the ending coordinates
   *
   * @return an array of steps represented by functions
   */
  protected calculateSteps(): StepsArray {
    const to = this.target;
    if (!to) return [];
    return [(x, y) => [to.x, to.y]];
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
    const points = this.calculateSteps().reduce<Array<number>>(
      (points, step) => [...points, ...step(points[points.length - 2], points[points.length - 1])],
      [this.from.x, this.from.y]
    );
    points.splice(0, 2);

    return (
      <KonvaArrow
        {...ShapeDefaultProps}
        points={points}
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
