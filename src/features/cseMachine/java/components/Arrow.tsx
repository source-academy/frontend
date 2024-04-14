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

/** this class encapsulates an Arrow to be drawn between 2 points */
export class Arrow extends Visible implements IHoverable {
  private static readonly TO_X_INDEX = 2;
  private readonly _points: number[] = [];

  constructor(fromX: number, fromY: number, toX: number, toY: number) {
    super();
    this._points.push(fromX, fromY, toX, toY);
  }

  setToX(x: number) {
    this._points[Arrow.TO_X_INDEX] = x;
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
    const path = `M ${this._points[0]} ${this._points[1]} L ${this._points[2]} ${this._points[3]}`;
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
          points={this._points.slice(this._points.length - 4)}
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
