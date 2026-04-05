import { KonvaEventObject } from 'konva/lib/Node';
import { Arrow as KonvaArrow, Group as KonvaGroup, Path as KonvaPath } from 'react-konva';

import { Visible } from '../../components/Visible';
import { Config, ShapeDefaultProps } from '../../CseMachineConfig';
import { IHoverable } from '../../CseMachineTypes';
import {
  defaultStrokeColor,
  setHoveredCursor,
  setHoveredStyle,
  setUnhoveredCursor,
  setUnhoveredStyle
} from '../../CseMachineUtils';
import { CseMachine } from '../CseMachine';

type ArrowRoute = 'straight' | 'manhattan';

type ArrowOptions = {
  route?: ArrowRoute;
};

/** this class encapsulates an Arrow to be drawn between 2 points */
export class Arrow extends Visible implements IHoverable {
  private static readonly TO_X_INDEX = 2;
  private static readonly TO_Y_INDEX = 3;
  private readonly _points: number[] = [];
  private readonly route: ArrowRoute;

  constructor(fromX: number, fromY: number, toX: number, toY: number, options: ArrowOptions = {}) {
    super();
    this._points.push(fromX, fromY, toX, toY);
    this.route = options.route ?? 'straight';
  }

  setToX(x: number) {
    this._points[Arrow.TO_X_INDEX] = x;
  }

  private get fromX() {
    return this._points[0];
  }

  private get fromY() {
    return this._points[1];
  }

  private get toX() {
    return this._points[Arrow.TO_X_INDEX];
  }

  private get toY() {
    return this._points[Arrow.TO_Y_INDEX];
  }

  private getPoints(): number[] {
    if (this.route === 'straight') {
      return [...this._points];
    }

    const terminalSegmentLength = Math.max(Config.ArrowHeadSize, Config.MinTerminalSegmentLength);
    const postSourceStraightLength = Config.ArrowPostFrameStraightLength;
    const turnX =
      this.toX >= this.fromX
        ? Math.max(this.fromX + postSourceStraightLength, this.toX - terminalSegmentLength)
        : Math.min(this.fromX - postSourceStraightLength, this.toX + terminalSegmentLength);

    const points = [this.fromX, this.fromY, turnX, this.fromY, turnX, this.toY, this.toX, this.toY];

    for (let i = points.length - 2; i >= 2; i -= 2) {
      if (points[i] === points[i - 2] && points[i + 1] === points[i - 1]) {
        points.splice(i, 2);
      }
    }

    return points;
  }

  private getPath(points: number[]): string {
    if (points.length < 4) {
      return '';
    }

    let path = `M ${points[0]} ${points[1]} `;
    if (points.length === 4) {
      return path + `L ${points[2]} ${points[3]} `;
    }

    let n = 0;
    while (n < points.length - 4) {
      const [xa, ya, xb, yb, xc, yc] = points.slice(n, n + 6);
      const dx1 = xb - xa;
      const dx2 = xc - xb;
      const dy1 = yb - ya;
      const dy2 = yc - yb;
      const segment1Length = Math.abs(dx1) + Math.abs(dy1);
      const segment2Length = Math.abs(dx2) + Math.abs(dy2);
      const isLastCorner = n + 6 >= points.length;
      const minTerminalStraightLength = Math.max(Config.ArrowHeadSize, Config.ArrowMinCornerRadius);
      const terminalAllowance = isLastCorner
        ? Math.max(0, segment2Length - minTerminalStraightLength)
        : segment2Length / 2;
      const maxSpaceRadius = Math.min(segment1Length / 2, segment2Length / 2, terminalAllowance);
      const desiredRadius = Math.min(
        Config.ArrowCornerRadius,
        maxSpaceRadius * Config.ArrowSmallBendRadiusScale
      );
      const br =
        maxSpaceRadius >= Config.ArrowMinCornerRadius
          ? Math.max(Config.ArrowMinCornerRadius, desiredRadius)
          : Math.max(0, maxSpaceRadius);
      const x1 = xb - br * Math.sign(dx1);
      const y1 = yb - br * Math.sign(dy1);
      const x2 = xb + br * Math.sign(dx2);
      const y2 = yb + br * Math.sign(dy2);

      path += `L ${x1} ${y1} Q ${xb} ${yb} ${x2} ${y2} `;
      n += 2;
    }

    path += `L ${points[points.length - 2]} ${points[points.length - 1]} `;
    return path;
  }

  onMouseEnter(e: KonvaEventObject<MouseEvent>) {
    setHoveredStyle(e.currentTarget);
    setHoveredCursor(e.currentTarget);
  }

  onMouseLeave(e: KonvaEventObject<MouseEvent>) {
    setUnhoveredStyle(e.currentTarget);
    setUnhoveredCursor(e.currentTarget);
  }

  draw() {
    const points = this.getPoints();
    const path = this.getPath(points);
    return (
      <KonvaGroup
        key={CseMachine.key++}
        onMouseEnter={e => this.onMouseEnter(e)}
        onMouseLeave={e => this.onMouseLeave(e)}
      >
        <KonvaPath
          {...ShapeDefaultProps}
          stroke={defaultStrokeColor()}
          strokeWidth={Config.ArrowStrokeWidth}
          hitStrokeWidth={Config.ArrowHitStrokeWidth}
          data={path}
          key={CseMachine.key++}
        />
        <KonvaArrow
          {...ShapeDefaultProps}
          points={points.slice(points.length - 4)}
          fill={defaultStrokeColor()}
          strokeEnabled={false}
          pointerWidth={Config.ArrowHeadSize}
          pointerLength={Config.ArrowHeadSize}
          key={CseMachine.key++}
        />
      </KonvaGroup>
    );
  }
}
