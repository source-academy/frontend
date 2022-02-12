import { KonvaEventObject } from 'konva/lib/Node';
import { Arrow as KonvaArrow, Group as KonvaGroup, Path as KonvaPath } from 'react-konva';

import { Config, ShapeDefaultProps } from '../../EnvVisualizerConfig';
import { Layout } from '../../EnvVisualizerLayout';
import { Hoverable, StepsArray, Visible } from '../../EnvVisualizerTypes';
import { setHoveredStyle, setUnhoveredStyle } from '../../EnvVisualizerUtils';

/** this class encapsulates an arrow to be drawn between 2 points */
export class GenericArrow implements Visible, Hoverable {
  private _x: number;
  private _y: number;
  private _height: number = 0;
  private _width: number = 0;
  points: number[] = [];
  from: Visible;
  target: Visible | undefined;

  constructor(from: Visible) {
    this.from = from;
    this._x = from.x();
    this._y = from.y();
  }

  x(): number {
    return this._x;
  }
  y(): number {
    return this._y;
  }
  height(): number {
    return this._height;
  }
  width(): number {
    return this._width;
  }

  to(to: Visible) {
    this.target = to;
    this._width = Math.abs(to.x() - this.from.x());
    this._height = Math.abs(to.y() - this.from.y());
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
    return [(x, y) => [to.x(), to.y()]];
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
      [this.from.x(), this.from.y()]
    );
    points.splice(0, 2);

    let path = '';
    // starting point
    path += `M ${points[0]} ${points[1]} `;
    if (points.length === 4) {
      // end the path if the line only has starting and ending coordinates
      path += `L ${points[2]} ${points[3]} `;
    } else {
      let n = 0;
      while (n < points.length - 4) {
        const [xa, ya, xb, yb, xc, yc] = points.slice(n, n + 6);
        const dx1 = xb - xa;
        const dx2 = xc - xb;
        const dy1 = yb - ya;
        const dy2 = yc - yb;
        const br = Math.min(
          Config.ArrowCornerRadius,
          Math.max(Math.abs(dx1), Math.abs(dy1)) / 2,
          Math.max(Math.abs(dx2), Math.abs(dy2)) / 2
        );
        const x1 = xb - br * Math.sign(dx1);
        const y1 = yb - br * Math.sign(dy1);
        const x2 = xb + br * Math.sign(dx2);
        const y2 = yb + br * Math.sign(dy2);

        // draw quadratic curves over corners
        path += `L ${x1} ${y1} Q ${xb} ${yb} ${x2} ${y2}`;
        n += 2;
      }
    }
    // end path
    path += `L ${points[points.length - 2]} ${points[points.length - 1]} `;
    return (
      <KonvaGroup
        key={Layout.key++}
        onMouseEnter={this.onMouseEnter}
        onMouseLeave={this.onMouseLeave}
      >
        <KonvaPath
          {...ShapeDefaultProps}
          stroke={Config.SA_WHITE.toString()}
          strokeWidth={Number(Config.ArrowStrokeWidth)}
          hitStrokeWidth={Number(Config.ArrowHitStrokeWidth)}
          data={path}
          key={Layout.key++}
        />
        <KonvaArrow
          {...ShapeDefaultProps}
          points={points.slice(points.length - 4)}
          fill={Config.SA_WHITE.toString()}
          strokeEnabled={false}
          pointerWidth={Number(Config.ArrowHeadSize)}
          key={Layout.key++}
        />
      </KonvaGroup>
    );
  }
}
