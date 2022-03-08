import { KonvaEventObject } from 'konva/lib/Node';
import React from 'react';
import { RefObject } from 'react';
import { Arrow as KonvaArrow, Group as KonvaGroup, Path as KonvaPath } from 'react-konva';

import EnvVisualizer from '../../EnvVisualizer';
import { Config, ShapeDefaultProps } from '../../EnvVisualizerConfig';
import { Layout } from '../../EnvVisualizerLayout';
import { StepsArray, Visible } from '../../EnvVisualizerTypes';
import {
  setHoveredCursor,
  setHoveredStyle,
  setUnhoveredCursor,
  setUnhoveredStyle
} from '../../EnvVisualizerUtils';
import { ArrayUnit } from '../ArrayUnit';
import { Frame } from '../Frame';
import { Text } from '../Text';
import { ArrayValue } from '../values/ArrayValue';
import { Arrow } from './Arrow';

/** this class encapsulates an arrow to be drawn between 2 points */
export class GenericArrow implements Arrow {
  points: number[] = [];
  source: Visible;
  target: Visible | undefined;
  ref: RefObject<any> = React.createRef();
  private _x: number;
  private _y: number;
  private _height: number = 0;
  private _width: number = 0;
  private _path: string = '';
  private selected: boolean = false;

  constructor(source: Visible) {
    this.source = source;
    this._x = source.x();
    this._y = source.y();
  }
  from(from: Visible) {
    throw new Error('Method not implemented.');
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
  path() {
    return this._path;
  }
  to(target: Visible) {
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
    return [(x, y) => [to.x(), to.y()]];
  }
  static getStrokeWidth(): number {
    return Number(Config.ArrowStrokeWidth);
  }
  onMouseEnter(e: KonvaEventObject<MouseEvent>) {
    setHoveredCursor(e.target);
    setHoveredStyle(e.currentTarget, {
      strokeWidth: Number(Config.ArrowHoveredStrokeWidth)
    });
  }
  onClick({ currentTarget }: KonvaEventObject<MouseEvent>) {
    this.selected = !this.selected;
    if (!this.selected) {
      if (
        !(this.source instanceof ArrayUnit && this.source.parent.isSelected()) &&
        !(this.target instanceof ArrayValue && this.target.isSelected()) &&
        !(this.source instanceof Text && this.source.frame?.isSelected()) &&
        !(this.source instanceof Frame && this.source.isSelected())
      ) {
        setUnhoveredStyle(currentTarget, {
          strokeWidth: GenericArrow.getStrokeWidth()
        });
      } else {
        setHoveredStyle(currentTarget, {
          strokeWidth: Number(Config.ArrowHoveredStrokeWidth) * 0.5
        });
      }
    }
  }
  onMouseLeave(e: KonvaEventObject<MouseEvent>) {
    setUnhoveredCursor(e.target);
    if (!this.isSelected()) {
      if (
        (this.source instanceof ArrayUnit && this.source.parent.isSelected()) ||
        (this.target instanceof ArrayValue && this.target.isSelected()) ||
        (this.source instanceof Text && this.source.frame?.isSelected()) ||
        (this.source instanceof Frame && this.source.isSelected())
      ) {
        setHoveredStyle(e.currentTarget, {
          strokeWidth: Number(Config.ArrowHoveredStrokeWidth) * 0.5
        });
      } else {
        setUnhoveredStyle(e.currentTarget, {
          strokeWidth: GenericArrow.getStrokeWidth()
        });
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
      >
        <KonvaPath
          {...ShapeDefaultProps}
          stroke={
            EnvVisualizer.getPrintableMode()
              ? Config.SA_BLUE.toString()
              : Config.SA_WHITE.toString()
          }
          strokeWidth={GenericArrow.getStrokeWidth()}
          hitStrokeWidth={Number(Config.ArrowHitStrokeWidth)}
          data={path}
          key={Layout.key++}
        />
        <KonvaArrow
          {...ShapeDefaultProps}
          points={points.slice(points.length - 4)}
          fill={
            EnvVisualizer.getPrintableMode()
              ? Config.SA_BLUE.toString()
              : Config.SA_WHITE.toString()
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
