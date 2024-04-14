import { Arrow as KonvaArrow, Group as KonvaGroup, Path as KonvaPath } from 'react-konva';

import { Config, ShapeDefaultProps } from '../../CseMachineConfig';
import { Layout } from '../../CseMachineLayout';
import { IVisible, StepsArray } from '../../CseMachineTypes';
import { defaultStrokeColor, fadedStrokeColor } from '../../CseMachineUtils';
import { Visible } from '../Visible';

/** this class encapsulates an arrow to be drawn between 2 points */
export class GenericArrow<Source extends IVisible, Target extends IVisible> extends Visible {
  private _path: string = '';
  points: number[] = [];
  source: Source;
  target: Target | undefined;
  faded: boolean = false;

  constructor(from: Source) {
    super();
    this.source = from;
    this.target = undefined;
    this._x = from.x();
    this._y = from.y();
  }

  path(): string {
    return this._path;
  }

  to(to: Target): GenericArrow<Source, Target> {
    this.target = to;
    this._width = Math.abs(to.x() - this.source.x());
    this._height = Math.abs(to.y() - this.source.y());

    const points = this.calculateSteps().reduce<Array<number>>(
      (points, step) => [...points, ...step(points[points.length - 2], points[points.length - 1])],
      [this.source.x(), this.source.y()]
    );
    points.splice(0, 2);

    // starting point
    this._path += `M ${points[0]} ${points[1]} `;
    if (points.length === 4) {
      // end the path if the line only has starting and ending coordinates
      this._path += `L ${points[2]} ${points[3]} `;
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
        this._path += `L ${x1} ${y1} Q ${xb} ${yb} ${x2} ${y2}`;
        n += 2;
      }
    }
    // end path
    this._path += `L ${points[points.length - 2]} ${points[points.length - 1]} `;
    this.points = points;
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
    return [() => [to.x(), to.y()]];
  }

  draw() {
    const stroke = this.faded ? fadedStrokeColor() : defaultStrokeColor();
    return (
      <KonvaGroup key={Layout.key++} ref={this.ref} listening={false}>
        <KonvaPath
          {...ShapeDefaultProps}
          stroke={stroke}
          strokeWidth={Config.ArrowStrokeWidth}
          data={this.path()}
          key={Layout.key++}
        />
        <KonvaArrow
          {...ShapeDefaultProps}
          points={this.points.slice(this.points.length - 4)}
          fill={stroke}
          strokeEnabled={false}
          pointerWidth={Config.ArrowHeadSize}
          key={Layout.key++}
        />
      </KonvaGroup>
    );
  }
}
