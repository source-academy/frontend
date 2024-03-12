import { KonvaEventObject } from 'konva/lib/Node';
import { Arrow as KonvaArrow, Group as KonvaGroup, Path as KonvaPath } from 'react-konva';

import CseMachine from '../../CseMachine';
import { Config, ShapeDefaultProps } from '../../CseMachineConfig';
import { Layout } from '../../CseMachineLayout';
import { IHoverable, IVisible, StepsArray } from '../../CseMachineTypes';
import { Frame } from '../Frame';
import { Text } from '../Text';
import { Visible } from '../Visible';

/** this class encapsulates an arrow to be drawn between 2 points */
export class GenericArrow<Source extends IVisible, Target extends IVisible>
  extends Visible
  implements IHoverable
{
  points: number[] = [];
  source: Source;
  target: Target | undefined;

  private _path: string = '';
  private selected: boolean = false;
  readonly unhovered_opacity: number = Config.ArrowUnhoveredOpacity;
  readonly hovered_opacity: number = 1;

  constructor(source: Source) {
    super();
    this.source = source;
    this._x = source.x();
    this._y = source.y();
  }
  path() {
    return this._path;
  }
  to(target: Target): GenericArrow<Source, Target> {
    this.target = target;
    this._width = Math.abs(target.x() - this.source.x());
    this._height = Math.abs(target.y() - this.source.y());
    return this;
  }
  isSelected(): boolean {
    return this.selected;
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
  getStrokeWidth(): number {
    return Number(Config.ArrowStrokeWidth);
  }
  onMouseEnter(e: KonvaEventObject<MouseEvent>) {
    this.ref.current.opacity = this.unhovered_opacity;
  }
  onClick({ currentTarget }: KonvaEventObject<MouseEvent>) {
    this.selected = !this.selected;
    if (!this.isSelected()) {
      if (
        !(this.source instanceof Text && this.source.frame?.isSelected()) &&
        !(this.source instanceof Frame && this.source.isSelected())
      ) {
        this.ref.current.opacity = this.unhovered_opacity;
      } else {
        this.ref.current.opacity = this.hovered_opacity;
      }
    }
  }
  onMouseLeave(e: KonvaEventObject<MouseEvent>) {
    if (!this.isSelected()) {
      if (
        (this.source instanceof Text && this.source.frame?.isSelected()) ||
        (this.source instanceof Frame && this.source.isSelected())
      ) {
        this.ref.current.opacity = this.hovered_opacity;
      } else {
        this.ref.current.opacity = this.unhovered_opacity;
      }
    }
  }
  draw() {
    const points = this.calculateSteps().reduce<Array<number>>(
      (points, step) => [...points, ...step(points[points.length - 2], points[points.length - 1])],
      [this.source.x(), this.source.y()]
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
        const dx1 = (xb - xa) / 2;
        const dx2 = (xc - xb) / 2;
        const dy1 = (yb - ya) / 2;
        const dy2 = (yc - yb) / 2;
        const r1 = Math.sqrt(Math.pow(dx1, 2) + Math.pow(dy1, 2)) / 2;
        const r2 = Math.sqrt(Math.pow(dx2, 2) + Math.pow(dy2, 2)) / 2;
        const br = Math.min(Config.ArrowCornerRadius, r1, r2);
        const x1 = xb - (br * dx1) / r1;
        const y1 = yb - (br * dy1) / r1;
        const x2 = xb + (br * dx2) / r2;
        const y2 = yb + (br * dy2) / r2;

        // draw quadratic curves over corners
        path += `L ${x1} ${y1} Q ${xb} ${yb} ${x2} ${y2} `;
        n += 2;
      }
    }
    // end path
    path += `L ${points[points.length - 2]} ${points[points.length - 1]} `;
    this._path = path;
    return (
      <KonvaGroup
        key={Layout.key++}
        ref={this.ref}
        onMouseEnter={e => this.onMouseEnter(e)}
        onMouseLeave={e => this.onMouseLeave(e)}
        onClick={e => this.onClick(e)}
        opacity={this.unhovered_opacity}
      >
        <KonvaPath
          {...ShapeDefaultProps}
          stroke={
            CseMachine.getPrintableMode() ? Config.SA_BLUE.toString() : Config.SA_WHITE.toString()
          }
          strokeWidth={this.getStrokeWidth()}
          hitStrokeWidth={Number(Config.ArrowHitStrokeWidth)}
          data={path}
          key={Layout.key++}
        />
        <KonvaArrow
          {...ShapeDefaultProps}
          points={points.slice(points.length - 4)}
          fill={
            CseMachine.getPrintableMode() ? Config.SA_BLUE.toString() : Config.SA_WHITE.toString()
          }
          strokeEnabled={false}
          pointerWidth={Number(Config.ArrowHeadSize)}
          pointerLength={Number(Config.ArrowHeadSize)}
          key={Layout.key++}
        />
      </KonvaGroup>
    );
  }
}
